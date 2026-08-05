import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';

// ============================================================
// 发送消息 DTO
// ============================================================

/** 发送聊天消息请求 */
export class SendMessageDto {
  /** 用户消息内容 */
  @IsString()
  message!: string;

  /** 关联的 issue 索引（从 0 开始，可选） */
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(49)
  relatedIssueIndex?: number;
}
