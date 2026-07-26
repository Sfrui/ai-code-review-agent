import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import type { ReviewTaskRepository } from '../database/repositories/review-task.repository';
import type { CodeReviewAgentService } from '../ai/ai.service';
import type { CreateReviewTaskDto } from './dto/create-review-task.dto';
import type { PaginationDto } from './dto/pagination.dto';
import type { ReviewTask, ReviewTaskListItem } from '@ai-review/shared';

// ============================================================
// ReviewService — 审查任务业务逻辑
// ============================================================

@Injectable()
export class ReviewService {
  private readonly logger = new Logger(ReviewService.name);

  constructor(
    private readonly reviewTaskRepo: ReviewTaskRepository,
    private readonly agentService: CodeReviewAgentService,
  ) {}

  /** 创建审查任务 */
  async createTask(dto: CreateReviewTaskDto): Promise<ReviewTask> {
    const doc = await this.reviewTaskRepo.create({
      codeName: dto.codeName,
      codeContent: dto.codeContent,
    });

    return this.toReviewTask(doc);
  }

  /** 查询单个任务详情 */
  async getTaskById(id: string): Promise<ReviewTask> {
    const doc = await this.reviewTaskRepo.findById(id);
    if (!doc) {
      throw new NotFoundException(`任务不存在: ${id}`);
    }
    return this.toReviewTask(doc);
  }

  /** 分页查询任务列表 */
  async getTaskList(pagination: PaginationDto): Promise<{
    items: ReviewTaskListItem[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const result = await this.reviewTaskRepo.findPaginated({
      page: pagination.page,
      pageSize: pagination.pageSize,
    });

    const items = result.items.map((doc) => this.toReviewTaskListItem(doc));

    return {
      items,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    };
  }

  /**
   * 执行 AI 代码审查
   * 状态流转：pending → running → success/fail
   */
  async runReview(taskId: string): Promise<ReviewTask> {
    // 1. 获取任务
    const doc = await this.reviewTaskRepo.findById(taskId);
    if (!doc) {
      throw new NotFoundException(`任务不存在: ${taskId}`);
    }

    // 2. 更新状态为 running
    await this.reviewTaskRepo.updateStatus(taskId, 'running');
    this.logger.log(`Task ${taskId} status → running`);

    // 3. 调用 AI Agent 执行审查
    try {
      const result = await this.agentService.executeReview({
        codeName: doc.codeName,
        codeContent: doc.codeContent,
      });

      if (!result.success || !result.data) {
        // AI 调用失败
        await this.reviewTaskRepo.updateStatus(taskId, 'fail');
        this.logger.error(`Task ${taskId} AI review failed: ${result.error}`);
        throw new InternalServerErrorException(`AI 审查失败: ${result.error}`);
      }

      // 4. 保存审查结果，更新状态为 success
      const reviewResultData = {
        summary: result.data.summary,
        score: result.data.score,
        issues: result.data.issues.map((issue) => ({
          line: issue.line,
          severity: issue.severity,
          category: issue.category,
          message: issue.message,
          suggestion: issue.suggestion,
          fixedCode: issue.fixedCode,
        })),
        modelUsed: result.modelUsed,
      };

      const updatedDoc = await this.reviewTaskRepo.updateReviewResult(
        taskId,
        reviewResultData,
      );

      this.logger.log(
        `Task ${taskId} completed: score=${result.data.score}, issues=${result.data.issues.length}`,
      );

      return this.toReviewTask(updatedDoc!);
    } catch (error) {
      // 异常处理：确保状态更新为 fail
      if (!(error instanceof InternalServerErrorException)) {
        await this.reviewTaskRepo.updateStatus(taskId, 'fail');
        this.logger.error(`Task ${taskId} unexpected error: ${error}`);
      }
      throw error;
    }
  }

  // ---- 私有方法：Mongoose 文档 → 共享 TS 类型 ----

  private toReviewTask(doc: {
    _id: { toString(): string };
    codeName: string;
    codeContent: string;
    reviewResult: unknown;
    status: string;
    createdAt?: Date;
    completedAt: Date | null;
  }): ReviewTask {
    const reviewResult = doc.reviewResult
      ? this.parseReviewResult(doc.reviewResult as Record<string, unknown>)
      : null;

    return {
      id: doc._id.toString(),
      codeName: doc.codeName,
      codeContent: doc.codeContent,
      reviewResult,
      status: doc.status as ReviewTask['status'],
      createdAt: doc.createdAt?.toISOString() ?? new Date().toISOString(),
      completedAt: doc.completedAt?.toISOString(),
    };
  }

  /** 解析审查结果：将 unknown 转为类型安全的 ReviewResult */
  private parseReviewResult(raw: unknown): ReviewTask['reviewResult'] {
    if (!raw || typeof raw !== 'object') return null;
    const obj = raw as Record<string, unknown>;
    const issues = Array.isArray(obj['issues'])
      ? (obj['issues'] as Array<Record<string, unknown>>).map((issue, idx) => ({
          id: String(issue['id'] ?? `issue-${idx}`),
          file: String(issue['file'] ?? ''),
          line: Number(issue['line'] ?? 0),
          severity: String(issue['severity'] ?? 'info') as 'error' | 'warning' | 'info',
          category: String(issue['category'] ?? 'style') as
            | 'bug'
            | 'security'
            | 'performance'
            | 'style'
            | 'maintainability',
          message: String(issue['message'] ?? ''),
          suggestion: issue['suggestion'] ? String(issue['suggestion']) : undefined,
        }))
      : [];

    return {
      summary: String(obj['summary'] ?? ''),
      score: Number(obj['score'] ?? 0),
      issues,
      modelUsed: String(obj['modelUsed'] ?? ''),
    };
  }

  private toReviewTaskListItem(doc: {
    _id: { toString(): string };
    codeName: string;
    status: string;
    reviewResult: unknown;
    createdAt?: Date;
    completedAt: Date | null;
  }): ReviewTaskListItem {
    const rawResult = doc.reviewResult as Record<string, unknown> | null;
    const issueCount = rawResult && Array.isArray(rawResult['issues'])
      ? (rawResult['issues'] as unknown[]).length
      : 0;

    return {
      id: doc._id.toString(),
      codeName: doc.codeName,
      status: doc.status as ReviewTaskListItem['status'],
      createdAt: doc.createdAt?.toISOString() ?? new Date().toISOString(),
      completedAt: doc.completedAt?.toISOString(),
      issueCount,
    };
  }
}
