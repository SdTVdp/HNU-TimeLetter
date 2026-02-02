/**
 * 测试获取完整记录数据
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

const FEISHU_APP_ID = process.env.FEISHU_APP_ID;
const FEISHU_APP_SECRET = process.env.FEISHU_APP_SECRET;
const FEISHU_APP_TOKEN = process.env.FEISHU_APP_TOKEN;
const FEISHU_TABLE_ID = process.env.FEISHU_TABLE_ID;

async function getTenantToken(appId: string, appSecret: string): Promise<string> {
  const url = "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal";
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ app_id: appId, app_secret: appSecret })
  });
  const json = await res.json();
  if (json.code !== 0) throw new Error(`Auth Failed: ${json.msg}`);
  return json.tenant_access_token as string;
}

async function listRecords(token: string) {
  // 使用 list 接口而不是 search
  const url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${FEISHU_APP_TOKEN}/tables/${FEISHU_TABLE_ID}/records`;
  
  console.log("\n📡 请求记录列表");
  console.log("URL:", url);

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json; charset=utf-8"
    }
  });

  const json = await res.json();
  console.log("\n📥 记录响应:", JSON.stringify(json, null, 2));
  
  if (json.code !== 0) {
    throw new Error(`List Records Failed: ${json.msg} (code: ${json.code})`);
  }
  
  return json;
}

async function main() {
  try {
    console.log("🚀 开始获取记录数据\n");

    if (!FEISHU_APP_ID || !FEISHU_APP_SECRET || !FEISHU_APP_TOKEN || !FEISHU_TABLE_ID) {
      throw new Error("缺少必要的环境变量");
    }

    const token = await getTenantToken(FEISHU_APP_ID, FEISHU_APP_SECRET);
    console.log("✅ 获取令牌成功");

    const result = await listRecords(token);
    
    console.log("\n✅ 成功获取记录!");
    console.log(`📊 共 ${result.data?.items?.length || 0} 条记录`);

  } catch (error) {
    console.error("\n❌ 获取失败:", error);
    process.exit(1);
  }
}

main();
