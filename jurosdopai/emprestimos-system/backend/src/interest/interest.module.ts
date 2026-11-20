import { Module } from '@nestjs/common';
import { InterestService } from './interest.service';
import { InterestController } from './interest.controller';

@Module({
  controllers: [InterestController],
  providers: [InterestService],
  exports: [InterestService],
})
export class InterestModule {}