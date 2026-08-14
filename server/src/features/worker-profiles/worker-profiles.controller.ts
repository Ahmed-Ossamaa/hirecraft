import { Controller } from '@nestjs/common';
import { WorkerProfilesService } from './worker-profiles.service';

@Controller('worker-profiles')
export class WorkerProfilesController {
  constructor(private readonly workerProfilesService: WorkerProfilesService) {}
}
