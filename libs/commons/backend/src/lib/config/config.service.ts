import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { EnvVariables, envSchema } from './env.schema';

@Injectable()
export class AppConfigService {
  constructor(private readonly config: ConfigService<EnvVariables>) {}

  get env(): EnvVariables {
    const envKeys = Object.keys(envSchema.shape) as (keyof EnvVariables)[];
    const variables = {} as Record<keyof EnvVariables, undefined>;

    envKeys.forEach((key) => {
      variables[key] = this.config.get(key, { infer: true }) as undefined;
    });

    return variables as unknown as EnvVariables;
  }
}
