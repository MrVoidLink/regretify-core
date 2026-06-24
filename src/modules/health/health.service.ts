import { Injectable } from '@nestjs/common';
import { getAppConfig } from '../../config/app.config';

@Injectable()
export class HealthService {
  getStatus() {
    const appConfig = getAppConfig();

    return {
      status: 'ok',
      service: 'regretify-core',
      environment: appConfig.nodeEnv,
    };
  }
}
