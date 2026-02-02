/**
 * 列出所有可访问的多维表格
 */

import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

const FEISHU_APP_ID = process.env.FEISHU_APP_ID;
const FEISHU_APP_SECRET = process.env.FEISHU_APP_SECRET;

const FEISHU_AUTH_URL = 'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal/';

async function getTenantAccessToken(): Promise<string> {
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
  return data.tenant_access_token;
}

async function main() {
  console.log('🔍 尝试列出所有可访问的多维表格...\n');
  
  const token = await getTenantAccessToken();
  console.log('✅ 令牌获取成功\n');
  
  // 尝试不同的 API 端点
  const endpoints = [
    'https://open.feishu.cn/open-apis/bitable/v1/apps',
    'https://open.feishu.cn/open-apis/drive/v1/files',
  ];
  
  for (const url of endpoints) {
    console.log(`📋 尝试端点: ${url}`);
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      console.log('响应:', JSON.stringify(data, null, 2));
      console.log('');
    } catch (error) {
      console.error('错误:', error);
      console.log('');
    }
  }
}

main().catch(console.error);
