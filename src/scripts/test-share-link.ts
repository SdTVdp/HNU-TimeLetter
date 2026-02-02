/**
 * 测试分享链接中的 token
 */

import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

const FEISHU_APP_ID = process.env.FEISHU_APP_ID;
const FEISHU_APP_SECRET = process.env.FEISHU_APP_SECRET;

// 从分享链接提取的 token
const SHARE_TOKEN = 'shrcndFgQ6q7jJVBKPy0WAlXqpg';
const TABLE_ID = 'tblWufNIW5TtO3Am';

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

async function testToken(token: string, appToken: string, description: string) {
  console.log(`\n📋 ${description}`);
  console.log(`App Token: ${appToken}`);
  
  // 测试 1: 获取表格列表
  const url1 = `https://open.feishu.cn/open-apis/bitable/v1/apps/${appToken}/tables`;
  console.log(`\n尝试获取表格列表...`);
  console.log(`URL: ${url1}`);
  
  const response1 = await fetch(url1, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  const data1 = await response1.json();
  console.log('响应:', JSON.stringify(data1, null, 2));
  
  if (data1.code === 0) {
    console.log('✅ 成功！找到表格列表');
    
    // 测试 2: 获取记录
    console.log(`\n尝试获取记录...`);
    const url2 = `https://open.feishu.cn/open-apis/bitable/v1/apps/${appToken}/tables/${TABLE_ID}/records?page_size=5`;
    console.log(`URL: ${url2}`);
    
    const response2 = await fetch(url2, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    const data2 = await response2.json();
    console.log('响应:', JSON.stringify(data2, null, 2));
    
    if (data2.code === 0) {
      console.log('✅✅ 完美！可以读取记录了！');
    }
  }
}

async function main() {
  console.log('🔍 测试分享链接中的 token...\n');
  
  const token = await getTenantAccessToken();
  console.log('✅ 令牌获取成功');
  
  // 测试分享 token
  await testToken(token, SHARE_TOKEN, '使用分享链接中的 token');
  
  // 也尝试去掉 "shr" 前缀
  const tokenWithoutPrefix = SHARE_TOKEN.replace('shr', '');
  await testToken(token, tokenWithoutPrefix, '尝试去掉 shr 前缀');
  
  console.log('\n\n💡 如果以上都失败，请尝试:');
  console.log('1. 在飞书中打开多维表格（不是分享链接）');
  console.log('2. 点击右上角"..."菜单 -> "高级" -> "获取 app_token"');
  console.log('3. 或者查看浏览器地址栏，格式应该是: https://xxx.feishu.cn/base/{app_token}');
}

main().catch(console.error);
