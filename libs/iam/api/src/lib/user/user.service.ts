import { Injectable } from '@nestjs/common';
import { User, UserRepository } from '@keepcloud/core/db';
import { TokenPayload } from 'google-auth-library';

interface Profile {
  email: string;
  family_name?: string;
  given_name?: string;
}

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async createOrUpdateGoogleUser(profile: TokenPayload): Promise<User> {
    let user = await this.userRepository.scoped
      .filterByEmail(profile.email as string)
      .getOne();

    if (!user) {
      user = this.userRepository.create({
        email: profile.email as string,
        firstName: profile.given_name,
        lastName: profile.family_name,
        picture: profile.picture,
      });
      await this.userRepository.save(user);
    }
    return user;
  }

  findOne({ email, id }: { email?: string; id?: number }) {
    const scope = this.userRepository.scoped;
    if (email) scope.filterByEmail(email);
    if (id) scope.filterById(id);
    return scope.getOne();
  }
}
