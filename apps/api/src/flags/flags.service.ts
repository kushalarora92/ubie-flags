import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeatureFlag } from '../entities/feature-flag.entity';
import { CreateFlagDto } from './dto/create-flag.dto';
import { UpdateFlagDto } from './dto/update-flag.dto';

@Injectable()
export class FlagsService {
  constructor(
    @InjectRepository(FeatureFlag)
    private readonly flagRepository: Repository<FeatureFlag>,
  ) {}

  async create(createFlagDto: CreateFlagDto): Promise<FeatureFlag> {
    // Check if flag with same key and environment already exists
    const existingFlag = await this.flagRepository.findOne({
      where: {
        key: createFlagDto.key,
        environment: createFlagDto.environment,
      },
    });

    if (existingFlag) {
      throw new ConflictException(
        `Flag with key '${createFlagDto.key}' already exists in '${createFlagDto.environment}' environment`,
      );
    }

    const flag = this.flagRepository.create(createFlagDto);
    return await this.flagRepository.save(flag);
  }

  async findAll(): Promise<FeatureFlag[]> {
    return await this.flagRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<FeatureFlag> {
    const flag = await this.flagRepository.findOne({ where: { id } });
    
    if (!flag) {
      throw new NotFoundException(`Flag with ID ${id} not found`);
    }
    
    return flag;
  }

  async update(id: string, updateFlagDto: UpdateFlagDto): Promise<FeatureFlag> {
    const flag = await this.findOne(id);

    // If updating key or environment, check for conflicts
    if (updateFlagDto.key || updateFlagDto.environment) {
      const conflictingFlag = await this.flagRepository.findOne({
        where: {
          key: updateFlagDto.key || flag.key,
          environment: updateFlagDto.environment || flag.environment,
        },
      });

      if (conflictingFlag && conflictingFlag.id !== id) {
        throw new ConflictException(
          `Flag with key '${updateFlagDto.key || flag.key}' already exists in '${updateFlagDto.environment || flag.environment}' environment`,
        );
      }
    }

    Object.assign(flag, updateFlagDto);
    return await this.flagRepository.save(flag);
  }

  async remove(id: string): Promise<void> {
    const flag = await this.findOne(id);
    await this.flagRepository.remove(flag);
  }

  /**
   * Find stale flags (not evaluated in X days)
   */
  async findStaleFlags(days: number): Promise<FeatureFlag[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return await this.flagRepository
      .createQueryBuilder('flag')
      .where(
        '(flag.lastEvaluatedAt IS NULL OR flag.lastEvaluatedAt < :cutoffDate)',
        { cutoffDate },
      )
      .orderBy('flag.lastEvaluatedAt', 'ASC', 'NULLS FIRST')
      .getMany();
  }

  /**
   * Get lifecycle statistics
   */
  async getStats() {
    const total = await this.flagRepository.count();

    const stale30 = (await this.findStaleFlags(30)).length;
    const stale60 = (await this.findStaleFlags(60)).length;
    const stale90 = (await this.findStaleFlags(90)).length;

    return {
      total,
      stale: {
        thirtyDays: stale30,
        sixtyDays: stale60,
        ninetyDays: stale90,
      },
    };
  }
}
