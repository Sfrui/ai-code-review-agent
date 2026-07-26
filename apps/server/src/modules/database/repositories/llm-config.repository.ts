import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import type {
  LLMConfigDocument} from '../schemas/llm-config.schema';
import {
  LLMConfig,
  LLMConfigCollectionName,
} from '../schemas/llm-config.schema';

// ============================================================
// LLM Config Repository — 配置读写
// ============================================================

@Injectable()
export class LLMConfigRepository {
  private readonly logger = new Logger(LLMConfigRepository.name);

  constructor(
    @InjectModel(LLMConfigCollectionName)
    private readonly model: Model<LLMConfigDocument>,
  ) {
    this.logger.log(`LLMConfigRepository initialized with model: ${LLMConfigCollectionName}`);
  }

  /** 获取当前配置（只有一条记录） */
  async getConfig(): Promise<LLMConfigDocument | null> {
    try {
      this.logger.log('getConfig() called');
      const result = await this.model.findOne().exec();
      this.logger.log(`getConfig result: ${result ? 'found' : 'null'}`);
      return result;
    } catch (error) {
      this.logger.error(`getConfig failed: ${error}`);
      throw error;
    }
  }

  /** 保存或更新配置 */
  async saveConfig(data: {
    provider: string;
    model: string;
    apiKey: string;
    baseURL: string;
    temperature: number;
    maxTokens: number;
    timeout: number;
  }): Promise<LLMConfigDocument> {
    try {
      this.logger.log(`saveConfig called: provider=${data.provider}, model=${data.model}`);
      const existing = await this.model.findOne().exec();
      this.logger.log(`Existing config: ${existing ? 'found' : 'null'}`);

      if (existing) {
        this.logger.log('Updating existing config...');
        Object.assign(existing, data);
        const result = await existing.save();
        this.logger.log('Config updated successfully');
        return result;
      }

      this.logger.log('Creating new config...');
      const doc = new this.model(data);
      const result = await doc.save();
      this.logger.log('Config created successfully');
      return result;
    } catch (error) {
      this.logger.error(`saveConfig failed: ${error}`);
      throw error;
    }
  }
}
