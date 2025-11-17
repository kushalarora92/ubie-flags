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
}

