import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';

// ============================================================
// LLM 配置 DTO
// ============================================================

export class SaveLLMConfigDto {
  @IsString()
  provider!: string;

  @IsString()
  model!: string;

  @IsString()
  apiKey!: string;

  @IsOptional()
  @IsString()
  baseURL: string = '';

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(2)
  temperature: number = 0.1;

  @IsOptional()
  @IsNumber()
  @Min(256)
  @Max(128000)
  maxTokens: number = 4096;

  @IsOptional()
  @IsNumber()
  @Min(1000)
  @Max(300000)
  timeout: number = 60000;
}
