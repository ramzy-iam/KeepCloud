import { Injectable } from '@nestjs/common';
import { SubscriptionPlanRepository, UserRepository } from '@keepcloud/core/db';
import { TokenPayload } from 'google-auth-library';
import { User } from '@prisma/client';
import { UserNotFoundException } from '@keepcloud/commons/backend';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly subscriptionPlanRepository: SubscriptionPlanRepository,
  ) {}

  async createOrUpdateGoogleUser(profile: TokenPayload): Promise<User> {
    const email = profile.email as string;

    let user = await this.userRepository.scoped.filterByEmail(email).getOne();

    const plan = await this.subscriptionPlanRepository.scoped
      .filterByDefault()
      .getOneOrFail();

    if (!user) {
      user = await this.userRepository.create({
        email,
        firstName: profile.given_name,
        lastName: profile.family_name,
        picture: profile.picture,
        plan: {
          connect: {
            id: plan.id,
          },
        },
      });
    }
    return user;
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
}
