import { HealthService } from './health.service';

describe('HealthService', () => {
  it('returns a healthy status payload', () => {
    const service = new HealthService();

    expect(service.getStatus()).toMatchObject({
      status: 'ok',
      service: 'regretify-core',
    });
  });
});
