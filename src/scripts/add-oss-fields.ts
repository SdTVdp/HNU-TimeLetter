/**
 * 为飞书表格添加 OSS URL 字段
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

async function createField(token: string, fieldName: string, fieldType: number) {
  const url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${FEISHU_APP_TOKEN}/tables/${FEISHU_TABLE_ID}/fields`;
  
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json; charset=utf-8"
    },
    body: JSON.stringify({
      field_name: fieldName,
      type: fieldType
    })
  });

  const json = await res.json();
  if (json.code !== 0) {
    console.log(`⚠️  创建字段 ${fieldName} 失败: ${json.msg}`);
    return null;
  }
  
  console.log(`✅ 创建字段: ${fieldName}`);
  return json.data.field;
}

async function main() {
  try {
    console.log("🚀 开始添加 OSS URL 字段\n");

    if (!FEISHU_APP_ID || !FEISHU_APP_SECRET || !FEISHU_APP_TOKEN || !FEISHU_TABLE_ID) {
      throw new Error("缺少必要的环境变量");
    }

    const token = await getTenantToken(FEISHU_APP_ID, FEISHU_APP_SECRET);
    console.log("✅ 获取令牌成功\n");

    // 添加 OSS URL 字段
    await createField(token, "头像OSS_URL", 1);  // 文本类型
    await createField(token, "大图OSS_URL", 1);  // 文本类型

    console.log("\n✨ 字段添加完成！");

  } catch (error) {
    console.error("\n❌ 添加失败:", error);
    process.exit(1);
  }
}

main();
