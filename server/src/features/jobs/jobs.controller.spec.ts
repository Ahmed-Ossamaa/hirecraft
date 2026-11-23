jest.mock('@/common/decorators/company-role.decorator', () => ({
  RequireCompanyRole: () => () => undefined,
}));

import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { SUBSCRIPTION_PLANS_KEY } from '@/common/decorators/subscription-plan.decorator';
import { PlanId } from '../plans/domain/plan-id.enum';

describe('JobsController', () => {
  it('passes the company ID to the matching criteria service', async () => {
    const getMatchingCriteria = jest.fn().mockResolvedValue({});
    const controller = new JobsController({
      getMatchingCriteria,
    } as unknown as JobsService);

    await controller.getMatchingCriteria('job-1', 'company-1');

    expect(getMatchingCriteria).toHaveBeenCalledWith('job-1', 'company-1');
  });

  it('restricts matching criteria to Pro and Enterprise plans', () => {
    expect(
      Reflect.getMetadata(
        SUBSCRIPTION_PLANS_KEY,
        JobsController.prototype.getMatchingCriteria,
      ),
    ).toEqual([
      PlanId.PRO_MONTHLY,
      PlanId.PRO_YEARLY,
      PlanId.ENTERPRISE_MONTHLY,
      PlanId.ENTERPRISE_YEARLY,
    ]);
  });
});
