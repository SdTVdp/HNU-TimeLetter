/**
 * 测试飞书搜索记录 API
 * 使用文档中推荐的标准方法
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

// 从 .env.local 读取配置
const FEISHU_APP_ID = process.env.FEISHU_APP_ID;
const FEISHU_APP_SECRET = process.env.FEISHU_APP_SECRET;
const FEISHU_APP_TOKEN = process.env.FEISHU_APP_TOKEN;
const FEISHU_TABLE_ID = process.env.FEISHU_TABLE_ID;
const FEISHU_VIEW_ID = process.env.FEISHU_VIEW_ID;

async function getTenantToken(appId: string, appSecret: string): Promise<string> {
  const url = "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal";
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ app_id: appId, app_secret: appSecret })
  });
  const json = await res.json();
  console.log("🔑 认证响应:", json);
  if (json.code !== 0) throw new Error(`Auth Failed: ${json.msg}`);
  return json.tenant_access_token as string;
}

async function searchRecords(token: string) {
  const url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${FEISHU_APP_TOKEN}/tables/${FEISHU_TABLE_ID}/records/search`;
  
  console.log("\n📡 请求 URL:", url);
  console.log("📋 请求参数:", {
    view_id: FEISHU_VIEW_ID,
    page_size: 10
  });

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json; charset=utf-8"
    },
    body: JSON.stringify({
      page_size: 10,
      view_id: FEISHU_VIEW_ID
      // 不指定 field_names，获取所有字段
    })
  });

  const json = await res.json();
  console.log("\n📥 搜索响应:", JSON.stringify(json, null, 2));
  
  if (json.code !== 0) {
    throw new Error(`Search Failed: ${json.msg} (code: ${json.code})`);
  }
  
  return json;
}

async function main() {
  try {
    console.log("🚀 开始测试飞书搜索记录 API\n");
    console.log("📝 配置信息:");
    console.log("  APP_ID:", FEISHU_APP_ID);
    console.log("  APP_TOKEN:", FEISHU_APP_TOKEN);
    console.log("  TABLE_ID:", FEISHU_TABLE_ID);
    console.log("  VIEW_ID:", FEISHU_VIEW_ID);
    console.log("");

    if (!FEISHU_APP_ID || !FEISHU_APP_SECRET || !FEISHU_APP_TOKEN || !FEISHU_TABLE_ID) {
      throw new Error("缺少必要的环境变量，请检查 .env.local");
    }

    const token = await getTenantToken(FEISHU_APP_ID, FEISHU_APP_SECRET);
    console.log("✅ 获取令牌成功");

    const result = await searchRecords(token);
    console.log("\n✅ 搜索成功！");
    console.log(`📊 共获取 ${result.data?.items?.length || 0} 条记录`);
    
    if (result.data?.items?.length > 0) {
      console.log("\n📄 第一条记录示例:");
      console.log(JSON.stringify(result.data.items[0], null, 2));
    }

  } catch (error) {
    console.error("\n❌ 测试失败:", error);
    process.exit(1);
  }
}

main();
