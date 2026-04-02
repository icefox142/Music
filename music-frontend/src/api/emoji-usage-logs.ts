/**
 * 表情使用记录 API
 * Emoji Usage Logs API
 */

import type { ApiResponse } from "@/types/api";
import api from "@/lib/axios";

export type UsageContext = "chat" | "comment" | "post" | "message" | "profile" | "other";

export interface UsageLog {
  id: string;
  userId: string;
  emojiId: string;
  context: UsageContext;
  targetId: string | null;
  count: number;
  usedAt: string;
}

export interface PopularEmoji {
  emojiId: string;
  totalCount: number;
  uniqueUsers: number;
  emoji?: any;
}

export interface UsageStats {
  emojiId: string;
  totalCount: number;
  uniqueUsers: number;
  contextDistribution: Record<UsageContext, number>;
  recentTrend: {
    date: string;
    count: number;
  }[];
}

export const emojiUsageLogsApi = {
  /**
   * 记录表情使用
   */
  record: async (data: {
    emojiId: string;
    context: UsageContext;
    targetId?: string;
  }): Promise<ApiResponse<{ success: boolean }>> => {
    return api.post<ApiResponse<{ success: boolean }>>(
      "/api/client/emoji-usage-logs",
      data
    );
  },

  /**
   * 批量记录表情使用
   */
  batchRecord: async (records: Array<{
    emojiId: string;
    context: UsageContext;
    targetId?: string;
  }>): Promise<ApiResponse<{ success: boolean; count: number }>> => {
    return api.post<ApiResponse<{ success: boolean; count: number }>>(
      "/api/client/emoji-usage-logs/batch",
      { records }
    );
  },

  /**
   * 获取我的使用历史
   */
  getHistory: async (params?: {
    page?: number;
    pageSize?: number;
    context?: UsageContext;
  }): Promise<ApiResponse<{ data: UsageLog[]; total: number }>> => {
    return api.get<ApiResponse<{ data: UsageLog[]; total: number }>>(
      "/api/client/emoji-usage-logs",
      { params }
    );
  },

  /**
   * 获取热门表情排行
   */
  getPopular: async (params?: {
    context?: UsageContext;
    limit?: number;
  }): Promise<ApiResponse<PopularEmoji[]>> => {
    return api.get<ApiResponse<PopularEmoji[]>>(
      "/api/client/emoji-usage-logs/popular",
      { params }
    );
  },

  /**
   * 获取表情使用统计
   */
  getStats: async (emojiId: string): Promise<ApiResponse<UsageStats>> => {
    return api.get<ApiResponse<UsageStats>>(
      `/api/client/emoji-usage-logs/stats/${emojiId}`
    );
  },
};
