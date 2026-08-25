import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import type { CreateReviewTaskDto } from './dto/create-review-task.dto';
import type { PaginationDto } from './dto/pagination.dto';

// ============================================================
// ReviewController — 审查任务 REST API
// 路由前缀: /api/v1/review/task
// ============================================================

@Controller('review/task')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  /**
   * POST /api/v1/review/task
   * 创建代码审查任务
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createTask(@Body() dto: CreateReviewTaskDto) {
    const task = await this.reviewService.createTask(dto);
    return { success: true, data: task };
  }

  /**
   * POST /api/v1/review/task/:id/run
   * 触发执行 AI 代码审查任务
   * 状态流转：pending → running → success/fail
   */
  @Post(':id/run')
  @HttpCode(HttpStatus.OK)
  async runTask(@Param('id') id: string) {
    // 检查任务状态
    const task = await this.reviewService.getTaskById(id);

    if (task.status === 'running') {
      throw new BadRequestException('任务正在执行中，请勿重复触发');
    }

    if (task.status === 'success') {
      throw new BadRequestException('任务已成功完成，如需重新审查请创建新任务');
    }

    // 执行 AI 审查
    const result = await this.reviewService.runReview(id);

    return { success: true, data: result };
  }

  /**
   * GET /api/v1/review/task/list
   * 获取历史任务分页列表
   * 注意：静态路由必须在参数路由 @Get(':id') 之前
   */
  @Get('list')
  async getTaskList(@Query() pagination: PaginationDto) {
    const result = await this.reviewService.getTaskList(pagination);
    return { success: true, data: result };
  }

  /**
   * GET /api/v1/review/task/:id
   * 查询单个审查任务详情
   */
  @Get(':id')
  async getTask(@Param('id') id: string) {
    const task = await this.reviewService.getTaskById(id);
    return { success: true, data: task };
  }

  /**
   * DELETE /api/v1/review/task/:id
   * 删除审查任务
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteTask(@Param('id') id: string) {
    await this.reviewService.deleteTask(id);
    return { success: true, message: '任务已删除' };
  }
}
