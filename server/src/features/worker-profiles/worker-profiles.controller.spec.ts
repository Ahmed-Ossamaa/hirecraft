jest.mock('@/common/decorators/roles.decorator', () => ({
  Roles: () => () => undefined,
}));

import { WorkerProfilesController } from './worker-profiles.controller';
import { SUBSCRIPTION_PLANS_KEY } from '@/common/decorators/subscription-plan.decorator';
import { PlanId } from '../plans/domain/plan-id.enum';

describe('WorkerProfilesController', () => {
  it('restricts candidate search to Pro and Enterprise plans', () => {
    expect(
      Reflect.getMetadata(
        SUBSCRIPTION_PLANS_KEY,
        WorkerProfilesController.prototype.searchByMachineId,
      ),
    ).toEqual([
      PlanId.PRO_MONTHLY,
      PlanId.PRO_YEARLY,
      PlanId.ENTERPRISE_MONTHLY,
      PlanId.ENTERPRISE_YEARLY,
    ]);
  });
});
