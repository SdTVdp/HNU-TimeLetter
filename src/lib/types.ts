/**
 * 核心数据类型定义
 * 供全项目使用
 */

// 故事实体 (对应飞书表格一行)
export interface Story {
  id: string;
  characterId: string;
  characterName: string;
  avatarUrl: string;      // Q版头像路径
  mainImageUrl: string;   // 高清大图路径
  content: string;        // 故事文本
  author: string;
  date: string;           // YYYY.MM.DD
  locationId: string;     // 关联的地点ID
  locationName?: string;
}

// 创作公示板实体 (对应揭示板表中的一行展示记录)
export interface CreationIdea {
  id: string;
  cardId: string;
  title: string;
  contentType: string;
  content: string;
  author: string;
  images: string[];
  createdAt: string;
  sourceIdeaId: string | null;
  sourceIdeaTitle: string | null;
  tags: string[];
}

// 地点实体 (前端聚合用)
export interface LocationPoint {
  id: string;
  name: string;
  x: number;              // 0-100% (SVG坐标百分比)
  y: number;              // 0-100%
  stories: Story[];       // 该地点包含的所有故事
}

// 飞书 API 响应类型 (用于同步脚本)
export interface FeishuRecord {
  record_id: string;
  fields: Record<string, unknown>;
}

export interface FeishuResponse {
  code: number;
  msg: string;
  data: {
    items: FeishuRecord[];
    has_more: boolean;
    page_token?: string;
  };
}
