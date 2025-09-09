import { Injectable } from '@nestjs/common';
import { SubscriptionPlanRepository, UserRepository } from '@keepcloud/core/db';
import { TokenPayload } from 'google-auth-library';
import { User } from '@prisma/client';
import { UserNotFoundException } from '@keepcloud/commons/backend';
import { SYSTEM_FILE } from '@keepcloud/commons/constants';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly subscriptionPlanRepository: SubscriptionPlanRepository,
  ) {}

  async createOrUpdateGoogleUser(
    profile: TokenPayload,
  ): Promise<{ user: User; isNewUser: boolean }> {
    if (!profile.email) {
      throw new UserNotFoundException('Email not provided in profile');
    }
    const email = profile.email;

    let user = await this.userRepository.scoped.filterByEmail(email).getOne();
    let isNewUser = false;

    const plan = await this.subscriptionPlanRepository.scoped
      .filterByDefault()
      .getOneOrFail();

    if (!user) {
      isNewUser = true;
      const [newUser] = await this.userRepository.prisma.$transaction(
        async (tx) => {
          const newUser = await tx.user.create({
            data: {
              email,
              firstName: profile.given_name,
              lastName: profile.family_name,
              picture: profile.picture,
              planId: plan.id,
            },
          });

          await tx.file.create({
            data: {
              name: SYSTEM_FILE.MY_STORAGE.code,
              owner: {
                connect: { email },
              },
              treeOwner: {
                connect: { email },
              },
              contentType: 'folder',
              isFolder: true,
              size: BigInt(0),
              type: 'FOLDER',
              isSystem: true,
              left: 1,
              right: 2,
            },
          });

          return [newUser];
        },
      );
      user = newUser;
    }

    return { user, isNewUser };
  }

  findOne({ email, id }: { email?: string; id?: string }) {
    const scope = this.userRepository.scoped;
    if (email) scope.filterByEmail(email);
    if (id) scope.filterById(id);

    return scope.getOne();
  }

  getOne(id?: string) {
    if (!id) {
      throw new UserNotFoundException('undefined');
    }
    return this.userRepository.scoped.filterById(id).getOneOrFail();
  }

  async getRemainingStorage(userId: string): Promise<bigint> {
    const user = await this.userRepository.scoped
      .filterById(userId)
      .getOneOrFail();
    const plan = await this.subscriptionPlanRepository.scoped
      .filterById(user.planId)
      .getOneOrFail();
    return plan.maxStorage - user.storageUsed;
  }

  /**
   * Fast incremental update for frequent operations (file creation)
   */
  async updateStorageUsed(userId: string, storageUsed: number) {
    const user = await this.userRepository.scoped
      .filterById(userId)
      .getOneOrFail();

    return this.userRepository.update(
      { id: user.id },
      {
        storageUsed: user.storageUsed + BigInt(storageUsed),
      },
    );
  }

  /**
   * Accurate recalculation for critical operations (deletion, maintenance)
   */
  async syncStorageUsage(userId: string) {
    // Get actual storage usage from files (including trashed files, excluding permanently deleted files)
    const result = await this.userRepository.prisma.file.aggregate({
      where: {
        treeOwnerId: userId,
        type: 'FILE',
        deletedAt: null, // Exclude permanently deleted files
        size: { gte: 0 },
      },
      _sum: {
        size: true,
      },
    });

    const actualStorageUsed = BigInt(result._sum.size || 0);

    // Update user's storage to match actual usage
    return this.userRepository.update(
      { id: userId },
      {
        storageUsed: actualStorageUsed,
      },
    );
  }
}
