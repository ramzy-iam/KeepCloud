import {
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@keepcloud/commons/backend';
import { FileRepository, Prisma } from '@keepcloud/core/db';
import { Injectable } from '@nestjs/common';

@Injectable()
export class NestedSetService {
  private readonly logger = new Logger(NestedSetService.name);

  constructor(private readonly fileRepository: FileRepository) {}
  private get prisma() {
    return this.fileRepository.prisma;
  }
  async allocateNestedSetPosition(
    treeOwnerId: string,
    parentId: string,
    tx: Prisma.TransactionClient,
  ): Promise<{ left: number; right: number }> {
    const repo = tx ? tx.file : this.fileRepository.prisma.file;

    this.logger.info(`Inserting node under parentId=${parentId}`);
    const parent = await repo.findUniqueOrThrow({ where: { id: parentId } });

    await repo.updateMany({
      where: { treeOwnerId, left: { gte: parent.right } },
      data: { left: { increment: 2 } },
    });

    await repo.updateMany({
      where: { treeOwnerId, right: { gte: parent.right } },
      data: { right: { increment: 2 } },
    });

    const inserted = { left: parent.right, right: parent.right + 1 };
    this.logger.info(
      `Inserted node with boundaries: ${JSON.stringify(inserted)}`,
    );
    return inserted;
  }

  async deleteNode(treeOwnerId: string, id: string): Promise<void> {
    this.logger.info(`Deleting node id=${id}, treeOwnerId=${treeOwnerId}`);
    const node = await this.prisma.file.findUnique({
      where: { id, treeOwnerId },
      select: { left: true, right: true },
    });

    if (!node) {
      this.logger.warn(`Node with ID ${id} not found`);
      throw new NotFoundException({ message: `Node with ID ${id} not found` });
    }

    const { left, right } = node;
    const width = right - left + 1;

    try {
      await this.prisma.$transaction([
        // 1. Mark the node and all its descendants as deleted
        this.prisma.file.updateMany({
          where: { treeOwnerId, left: { gte: left }, right: { lte: right } },
          data: {
            deletedAt: new Date(),
          },
        }),
        // 2. Shift left values of remaining nodes to the left
        this.prisma.file.updateMany({
          where: { treeOwnerId, left: { gt: right } },
          data: { left: { decrement: width } },
        }),
        // 3. Shift right values of remaining nodes to the left
        this.prisma.file.updateMany({
          where: { treeOwnerId, right: { gt: right } },
          data: { right: { decrement: width } },
        }),
      ]);
      this.logger.info(`Node deleted successfully`);
    } catch (err: unknown) {
      this.logger.error(
        `Failed to delete node ${id}: ${(err as Error).message}`,
        (err as Error).stack,
      );
      throw new InternalServerErrorException({
        message: 'Failed to delete node and update tree structure',
      });
    }
  }

  async moveNode(
    treeOwnerId: string,
    id: string,
    newParentId: string | null,
  ): Promise<void> {
    this.logger.info(
      `Moving node id=${id} to newParentId=${newParentId}, treeOwnerId=${treeOwnerId}`,
    );
    const node = await this.prisma.file.findUnique({
      where: { id },
      select: { left: true, right: true },
    });

    if (!node) {
      this.logger.warn(`Node with ID ${id} not found`);
      throw new NotFoundException({ message: `Node with ID ${id} not found` });
    }

    const { left, right } = node;
    const width = right - left + 1;

    if (
      newParentId &&
      (await this.isDescendant(treeOwnerId, newParentId, id))
    ) {
      this.logger.warn(
        `Cannot move node ${id} into its own descendant ${newParentId}`,
      );
      throw new BadRequestException({
        message: 'Cannot move a node into one of its own descendants',
      });
    }

    try {
      this.logger.debug(`Marking node subtree for temporary removal`);
      await this.prisma.file.updateMany({
        where: { treeOwnerId, left: { gte: left }, right: { lte: right } },
        data: {
          left: { decrement: left * 2 },
          right: { decrement: left * 2 },
        },
      });

      this.logger.debug(`Closing gap after node removal`);
      await this.prisma.$transaction([
        this.prisma.file.updateMany({
          where: { treeOwnerId, left: { gt: right } },
          data: { left: { decrement: width } },
        }),
        this.prisma.file.updateMany({
          where: { treeOwnerId, right: { gt: right } },
          data: { right: { decrement: width } },
        }),
      ]);

      const parentRight = newParentId
        ? ((
            await this.prisma.file.findUnique({
              where: { id: newParentId },
              select: { right: true },
            })
          )?.right ?? null)
        : await this.getRootInsertPosition(treeOwnerId);

      if (!parentRight) {
        this.logger.warn(`Parent node ${newParentId} has no right value`);
        throw new NotFoundException({
          message: `Parent node with ID ${newParentId} not found or has no right value`,
        });
      }

      this.logger.debug(`Opening space at new position right=${parentRight}`);
      await this.prisma.$transaction([
        this.prisma.file.updateMany({
          where: { treeOwnerId, left: { gte: parentRight } },
          data: { left: { increment: width } },
        }),
        this.prisma.file.updateMany({
          where: { treeOwnerId, right: { gte: parentRight } },
          data: { right: { increment: width } },
        }),
      ]);

      const shift = parentRight - left;
      this.logger.debug(`Shifting node subtree by ${shift}`);
      await this.prisma.file.updateMany({
        where: {
          treeOwnerId,
          left: { lt: 0 },
          right: { lt: 0 },
        },
        data: {
          left: { increment: shift + left * 2 },
          right: { increment: shift + left * 2 },
        },
      });

      await this.prisma.file.update({
        where: { id },
        data: { parentId: newParentId },
      });
      this.logger.info(`Node ${id} moved successfully`);
    } catch (err: unknown) {
      this.logger.error(
        `Failed to move node ${id}: ${(err as Error).message}`,
        (err as Error).stack,
      );
      throw new InternalServerErrorException({
        message: 'Failed to move node',
      });
    }
  }

  async rebuildTree(treeOwnerId: string): Promise<void> {
    this.logger.info(`Rebuilding nested set tree for userId=${treeOwnerId}`);
    const nodes = await this.prisma.file.findMany({
      where: { treeOwnerId },
      select: { id: true, parentId: true },
    });

    const childrenMap = new Map<string | null, string[]>();
    for (const node of nodes) {
      const parentId = node.parentId ?? null;
      if (!childrenMap.has(parentId)) childrenMap.set(parentId, []);
      childrenMap.get(parentId)?.push(node.id);
    }

    let index = 1;
    const updates: { id: string; left: number; right: number }[] = [];

    const dfs = (id: string) => {
      const left = index++;
      const children = childrenMap.get(id) || [];
      for (const childId of children) dfs(childId);
      const right = index++;
      updates.push({ id, left, right });
    };

    for (const rootId of childrenMap.get(null) ?? []) {
      dfs(rootId);
    }

    try {
      await this.prisma.$transaction(
        updates.map((node) =>
          this.prisma.file.update({
            where: { id: node.id },
            data: { left: node.left, right: node.right },
          }),
        ),
      );
      this.logger.info(`Tree rebuilt successfully for userId=${treeOwnerId}`);
    } catch (err: unknown) {
      this.logger.error(
        `Failed to rebuild tree: ${(err as Error).message}`,
        (err as Error).stack,
      );
      throw new InternalServerErrorException({
        message: 'Failed to rebuild nested set tree',
      });
    }
  }

  private async getRootInsertPosition(treeOwnerId: string): Promise<number> {
    const maxRight = await this.prisma.file.aggregate({
      where: { treeOwnerId },
      _max: { right: true },
    });
    const position = (maxRight._max.right ?? 0) + 1;
    this.logger.debug(
      `Root insert position for treeOwnerId=${treeOwnerId} is ${position}`,
    );
    return position;
  }

  private async isDescendant(
    treeOwnerId: string,
    childId: string,
    ancestorId: string,
  ): Promise<boolean> {
    const child = await this.prisma.file.findUnique({
      where: { id: childId, treeOwnerId },
      select: { left: true, right: true },
    });

    const ancestor = await this.prisma.file.findUnique({
      where: { id: ancestorId, treeOwnerId },
      select: { left: true, right: true },
    });

    const result =
      !!child &&
      !!ancestor &&
      child.left > ancestor.left &&
      child.right < ancestor.right;

    if (result) {
      this.logger.debug(`${childId} is a descendant of ${ancestorId}`);
    }
    return result;
  }
}
