import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Sse,
  MessageEvent,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ChatService } from './chat.service';
import type { SendMessageDto } from './dto/send-message.dto';

// ============================================================
// ChatController — 多轮对话 REST API
// 路由前缀: /api/v1/review/task/:taskId/chat
// ============================================================

@Controller('review/task/:taskId/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  /**
   * POST /api/v1/review/task/:taskId/chat
   * 发送消息（SSE 流式输出）
   *
   * SSE 事件流：
   * - data: {"type":"delta","data":"..."}  // 逐字输出
   * - data: {"type":"done","data":""}      // 完成
   * - data: {"type":"error","data":"..."}   // 错误
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  @Sse()
  sendMessage(
    @Param('taskId') taskId: string,
    @Body() dto: SendMessageDto,
  ): Observable<MessageEvent> {
    return this.chatService.sendMessageStream(taskId, dto.message, dto.relatedIssueIndex).pipe(
      map((event) => ({
        data: JSON.stringify({ type: event.type, data: event.data }),
      })),
    );
  }

  /**
   * GET /api/v1/review/task/:taskId/chat/history
   * 获取对话历史
   */
  @Get('history')
  async getHistory(@Param('taskId') taskId: string) {
    const history = await this.chatService.getHistory(taskId);
    return { success: true, data: history };
  }

  /**
   * DELETE /api/v1/review/task/:taskId/chat
   * 清空对话历史
   */
  @Delete()
  @HttpCode(HttpStatus.OK)
  async clearHistory(@Param('taskId') taskId: string) {
    const result = await this.chatService.clearHistory(taskId);
    return { success: true, data: result };
  }
}
