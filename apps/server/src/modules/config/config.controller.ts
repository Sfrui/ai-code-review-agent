import { Controller, Get, Put, Body, Logger } from '@nestjs/common';
import { ConfigService } from './config.service';
import type { SaveLLMConfigDto } from './dto/save-llm-config.dto';

// ============================================================
// ConfigController — 配置管理 REST API
// 路由前缀: /api/v1/config
// ============================================================

@Controller('config')
export class ConfigController {
  private readonly logger = new Logger(ConfigController.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * GET /api/v1/config/llm
   * 获取当前 LLM 配置
   */
  @Get('llm')
  async getLLMConfig() {
    try {
      this.logger.log('GET /config/llm');
      const config = await this.configService.getLLMConfig();
      this.logger.log(`Config loaded: provider=${config?.provider ?? 'null'}`);
      return { success: true, data: config };
    } catch (error) {
      this.logger.error(`GET /config/llm failed: ${error}`);
      throw error;
    }
  }

  /**
   * PUT /api/v1/config/llm
   * 保存 LLM 配置
   */
  @Put('llm')
  async saveLLMConfig(@Body() dto: SaveLLMConfigDto) {
    try {
      this.logger.log(`PUT /config/llm: provider=${dto.provider}, model=${dto.model}`);
      this.logger.log(
        `DTO received: ${JSON.stringify({ ...dto, apiKey: dto.apiKey ? '***' : '' })}`,
      );
      const config = await this.configService.saveLLMConfig(dto);
      this.logger.log('Config saved successfully');
      return { success: true, data: config };
    } catch (error) {
      this.logger.error(`PUT /config/llm failed: ${error}`);
      throw error;
    }
  }
}
