/**
 * 测试知识库访问权限
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

async function testEndpoint(token: string, url: string, description: string) {
  console.log(`\n📋 ${description}`);
  console.log(`URL: ${url}`);
  
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    const text = await response.text();
    console.log(`状态码: ${response.status}`);
    console.log(`响应:`, text.substring(0, 500));
    
    try {
      const data = JSON.parse(text);
      if (data.code === 0) {
        console.log('✅ 成功!');
        console.log('完整数据:', JSON.stringify(data, null, 2));
      } else {
        console.log(`❌ 错误码: ${data.code}, 消息: ${data.msg}`);
      }
    } catch {
      console.log('⚠️  非 JSON 响应');
    }
  } catch (error) {
    console.error('❌ 请求失败:', error);
  }
}

async function main() {
  console.log('🔍 测试各种 API 端点...\n');
  
  const token = await getTenantAccessToken();
  console.log('✅ 令牌获取成功');
  
  // 测试不同的端点
  await testEndpoint(
    token,
    'https://open.feishu.cn/open-apis/wiki/v2/spaces',
    '获取知识库列表'
  );
  
  await testEndpoint(
    token,
    'https://open.feishu.cn/open-apis/drive/v1/metas/batch_query',
    '批量查询文件元数据'
  );
  
  // 尝试直接访问表格（使用不同的 token 组合）
  const possibleTokens = [
    'ScDawoedLivEd0kvLKjcaYIjn98',  // Wiki ID
    'tblWufNIW5TtO3Am',              // Table ID
  ];
  
  for (const testToken of possibleTokens) {
    await testEndpoint(
      token,
      `https://open.feishu.cn/open-apis/bitable/v1/apps/${testToken}/tables`,
      `尝试使用 ${testToken} 作为 app_token`
    );
  }
  
  console.log('\n\n💡 建议:');
  console.log('1. 在飞书中打开多维表格');
  console.log('2. 点击右上角"..."菜单');
  console.log('3. 选择"高级" -> "获取 app_token"');
  console.log('4. 或者点击"分享"按钮，从分享链接中提取 app_token');
}

main().catch(console.error);
