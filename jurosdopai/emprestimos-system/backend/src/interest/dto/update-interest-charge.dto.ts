import { PartialType } from '@nestjs/swagger';
import { CreateInterestChargeDto } from './create-interest-charge.dto';

export class UpdateInterestChargeDto extends PartialType(CreateInterestChargeDto) {}