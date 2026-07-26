import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

// ============================================================
// 创建审查任务 DTO — 使用 class-validator 校验
// ============================================================

export class CreateReviewTaskDto {
  @IsString({ message: 'codeName 必须是字符串' })
  @IsNotEmpty({ message: 'codeName 不能为空' })
  @MinLength(1, { message: 'codeName 长度不能小于 1' })
  @MaxLength(255, { message: 'codeName 长度不能超过 255' })
  codeName!: string;

  @IsString({ message: 'codeContent 必须是字符串' })
  @IsNotEmpty({ message: 'codeContent 不能为空' })
  @MinLength(1, { message: 'codeContent 长度不能小于 1' })
  @MaxLength(100_000, { message: 'codeContent 长度不能超过 100000' })
  codeContent!: string;
}
