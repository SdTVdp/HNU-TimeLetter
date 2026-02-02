/**
 * 飞书数据同步脚本
 * 功能: 从飞书多维表格拉取数据并生成本地 JSON 文件
 * 
 * 使用方法:
 * 1. 配置 .env.local 中的飞书凭证
 * 2. 运行: npm run sync
 */

import * as fs from 'fs';
import * as path from 'path';
import type { LocationPoint, Story, FeishuResponse } from '../lib/types';

// 环境变量
const FEISHU_APP_ID = process.env.FEISHU_APP_ID;
const FEISHU_APP_SECRET = process.env.FEISHU_APP_SECRET;
const FEISHU_TABLE_ID = process.env.FEISHU_TABLE_ID;

// 飞书 API 端点
const FEISHU_AUTH_URL = 'https://open.feishu.cn/open-api/auth/v3/tenant_access_token/internal';
const FEISHU_RECORDS_URL = 'https://open.feishu.cn/open-api/bitable/v1/apps/{app_token}/tables/{table_id}/records';

/**
 * 获取飞书访问令牌
 */
async function getTenantAccessToken(): Promise<string> {
  if (!FEISHU_APP_ID || !FEISHU_APP_SECRET) {
    throw new Error('缺少飞书凭证，请检查 .env.local 文件');
  }

  const response = await fetch(FEISHU_AUTH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
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
 * 从飞书拉取记录
 */
async function fetchFeishuRecords(token: string): Promise<FeishuResponse> {
  if (!FEISHU_TABLE_ID) {
    throw new Error('缺少飞书表格 ID');
  }

  // TODO: 替换为实际的 app_token 和 table_id
  const url = FEISHU_RECORDS_URL
    .replace('{app_token}', 'YOUR_APP_TOKEN')
    .replace('{table_id}', FEISHU_TABLE_ID);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  
  if (data.code !== 0) {
    throw new Error(`拉取飞书数据失败: ${data.msg}`);
  }

  return data;
}

/**
 * 转换飞书数据为本地格式
 */
function transformData(feishuData: FeishuResponse): LocationPoint[] {
  // TODO: 根据实际飞书表格字段进行映射
  // 这里是示例逻辑，需要根据实际表格结构调整
  
  const storiesMap = new Map<string, Story[]>();
  
  feishuData.data.items.forEach((record) => {
    const fields = record.fields;
    
    // 示例字段映射（需根据实际调整）
    const story: Story = {
      id: record.record_id,
      characterId: fields['角色ID'] || '',
      characterName: fields['角色名称'] || '',
      avatarUrl: fields['头像URL'] || '',
      mainImageUrl: fields['大图URL'] || '',
      content: fields['故事内容'] || '',
      author: fields['投稿人'] || '',
      date: fields['日期'] || '',
      locationId: fields['地点ID'] || '',
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
    // TODO: 需要从另一个表或字段获取地点的坐标信息
    locations.push({
      id: locationId,
      name: stories[0]?.locationId || locationId, // 临时使用
      x: 50, // TODO: 从配置获取
      y: 50, // TODO: 从配置获取
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
    console.log('🚀 开始同步飞书数据...');
    
    // 1. 获取访问令牌
    console.log('🔑 获取访问令牌...');
    const token = await getTenantAccessToken();
    
    // 2. 拉取数据
    console.log('📥 拉取飞书记录...');
    const feishuData = await fetchFeishuRecords(token);
    
    // 3. 转换数据
    console.log('🔄 转换数据格式...');
    const locations = transformData(feishuData);
    
    // 4. 写入文件
    console.log('💾 写入本地文件...');
    writeToFile(locations);
    
    console.log('✨ 同步完成！');
  } catch (error) {
    console.error('❌ 同步失败:', error);
    process.exit(1);
  }
}

// 执行
main();
