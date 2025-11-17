import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { EvaluationService } from './evaluation.service';
import { EvaluateDto } from './dto/evaluate.dto';

@Controller('evaluate')
export class EvaluationController {
  constructor(private readonly evaluationService: EvaluationService) {}

  @Post()
  async evaluate(@Body(ValidationPipe) evaluateDto: EvaluateDto) {
    return await this.evaluationService.evaluateFlag(
      evaluateDto.flagKey,
      evaluateDto.environment,
      evaluateDto.context,
    );
  }
}
