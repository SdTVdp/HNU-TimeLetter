/**
 * 飞书数据同步脚本
 * 功能: 从飞书多维表格拉取数据并生成本地 JSON 文件
 * 
 * 使用方法:
 * 1. 配置 .env.local 中的飞书凭证
 * 2. 运行: npm run sync
 */

import { config } from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import type { LocationPoint, Story } from '../lib/types';

config({ path: '.env.local' });

// 环境变量
const FEISHU_APP_ID = process.env.FEISHU_APP_ID;
const FEISHU_APP_SECRET = process.env.FEISHU_APP_SECRET;
const FEISHU_APP_TOKEN = process.env.FEISHU_APP_TOKEN;
const FEISHU_TABLE_ID = process.env.FEISHU_TABLE_ID;
const FEISHU_VIEW_ID = process.env.FEISHU_VIEW_ID;

// 地点坐标配置（可以后续移到配置文件）
const LOCATION_COORDS: Record<string, { name: string; x: number; y: number }> = {
  'lib-001': { name: '图书馆', x: 45, y: 30 },
  'lake-001': { name: '东坡湖', x: 60, y: 55 },
  'siyuan-001': { name: '思源学堂', x: 35, y: 70 },
};

/**
 * 获取飞书访问令牌
 */
async function getTenantAccessToken(): Promise<string> {
  if (!FEISHU_APP_ID || !FEISHU_APP_SECRET) {
    throw new Error('缺少飞书凭证，请检查 .env.local 文件');
  }

  const url = 'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal';
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify({
      app_id: FEISHU_APP_ID,
      app_secret: FEISHU_APP_SECRET,
    }),
  });

  const data = await response.json();
  
  if (data.code !== 0) {
    throw new Error(`获取飞书令牌失败: ${data.msg}`);
  }

  return data.tenant_access_token;
}

/**
 * 从飞书拉取记录（使用搜索接口）
 */
async function fetchFeishuRecords(token: string): Promise<any[]> {
  if (!FEISHU_APP_TOKEN || !FEISHU_TABLE_ID) {
    throw new Error('缺少飞书表格配置');
  }

  const url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${FEISHU_APP_TOKEN}/tables/${FEISHU_TABLE_ID}/records/search`;

  let allItems: any[] = [];
  let hasMore = true;
  let pageToken = '';

  while (hasMore) {
    const body: any = {
      page_size: 500,
    };

    // 如果指定了视图，只拉取该视图的数据
    if (FEISHU_VIEW_ID) {
      body.view_id = FEISHU_VIEW_ID;
    }

    // 添加过滤条件：只拉取状态为"已发布"的记录
    body.filter = {
      conjunction: 'and',
      conditions: [
        {
          field_name: '状态',
          operator: 'is',
          value: ['已发布']
        }
      ]
    };

    if (pageToken) {
      body.page_token = pageToken;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    if (data.code !== 0) {
      throw new Error(`拉取飞书数据失败: ${data.msg} (code: ${data.code})`);
    }

    allItems.push(...(data.data.items || []));
    hasMore = data.data.has_more || false;
    pageToken = data.data.page_token || '';
  }

  return allItems;
}

/**
 * 转换飞书数据为本地格式
 */
function transformData(feishuRecords: any[]): LocationPoint[] {
  const storiesMap = new Map<string, Story[]>();
  
  feishuRecords.forEach((record) => {
    const fields = record.fields;
    
    // 跳过空记录或未发布的记录
    if (!fields['角色ID'] || !fields['故事内容']) {
      return;
    }

    // 飞书字段可能返回对象，需要提取文本值
    const getText = (field: any): string => {
      if (!field) return '';
      if (typeof field === 'string') return field;
      if (Array.isArray(field) && field.length > 0) {
        return field[0].text || String(field[0]);
      }
      if (typeof field === 'object' && field.text) return field.text;
      return String(field);
    };

    const story: Story = {
      id: record.record_id,
      characterId: getText(fields['角色ID']),
      characterName: getText(fields['角色名']),
      avatarUrl: getText(fields['头像URL']),
      mainImageUrl: getText(fields['大图URL']),
      content: getText(fields['故事内容']),
      author: getText(fields['投稿人']),
      date: getText(fields['日期']),
      locationId: getText(fields['地点ID']),
    };
    
    const locationId = story.locationId;
    if (!storiesMap.has(locationId)) {
      storiesMap.set(locationId, []);
    }
    storiesMap.get(locationId)!.push(story);
  });
  
  // 聚合为地点数据
  const locations: LocationPoint[] = [];
  storiesMap.forEach((stories, locationId) => {
    const coords = LOCATION_COORDS[locationId] || {
      name: stories[0]?.locationId || locationId,
      x: 50,
      y: 50,
    };

    locations.push({
      id: locationId,
      name: coords.name,
      x: coords.x,
      y: coords.y,
      stories,
    });
  });
  
  return locations;
}

/**
 * 写入本地 JSON 文件
 */
function writeToFile(data: LocationPoint[]): void {
  const outputPath = path.join(__dirname, '../data/content.json');
  const content = JSON.stringify({ locations: data }, null, 2);
  
  fs.writeFileSync(outputPath, content, 'utf-8');
  console.log(`✅ 数据已写入: ${outputPath}`);
  console.log(`📊 共 ${data.length} 个地点，${data.reduce((sum, loc) => sum + loc.stories.length, 0)} 个故事`);
}

/**
 * 主函数
 */
async function main() {
  try {
    console.log('🚀 开始同步飞书数据...\n');
    
    // 1. 获取访问令牌
    console.log('🔑 获取访问令牌...');
    const token = await getTenantAccessToken();
    console.log('✅ 令牌获取成功\n');
    
    // 2. 拉取数据
    console.log('📥 拉取飞书记录...');
    const feishuRecords = await fetchFeishuRecords(token);
    console.log(`✅ 成功拉取 ${feishuRecords.length} 条记录\n`);
    
    // 3. 转换数据
    console.log('🔄 转换数据格式...');
    const locations = transformData(feishuRecords);
    console.log(`✅ 转换完成\n`);
    
    // 4. 写入文件
    console.log('💾 写入本地文件...');
    writeToFile(locations);
    
    console.log('\n✨ 同步完成！');
  } catch (error) {
    console.error('\n❌ 同步失败:', error);
    process.exit(1);
  }
}

// 执行
main();
