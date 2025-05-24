import { RLSContext, RLSContextService } from '@keepcloud/core/db';
import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class RLSContextMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    const initialContext: RLSContext = {};

    RLSContextService.runWithContext(initialContext, () => {
      next();
    });
  }
}
