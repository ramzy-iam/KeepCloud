import { Injectable } from '@nestjs/common';
import { SubscriptionPlanRepository, UserRepository } from '@keepcloud/core/db';
import { TokenPayload } from 'google-auth-library';
import { User } from '@prisma/client';

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
}
