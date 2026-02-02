/**
 * 初始化 OSS 文件记录表格
 * 添加必要的字段用于记录上传到 OSS 的文件信息
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

const FEISHU_APP_ID = process.env.FEISHU_APP_ID;
const FEISHU_APP_SECRET = process.env.FEISHU_APP_SECRET;
const FEISHU_APP_TOKEN = process.env.FEISHU_APP_TOKEN;
const OSS_TABLE_ID = 'tblwLUNdWNzv1kZw'; // OSS 文件记录表

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
  const url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${FEISHU_APP_TOKEN}/tables/${OSS_TABLE_ID}/fields`;
  
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
    console.log("🚀 开始初始化 OSS 文件记录表格\n");

    if (!FEISHU_APP_ID || !FEISHU_APP_SECRET || !FEISHU_APP_TOKEN) {
      throw new Error("缺少必要的环境变量");
    }

    const token = await getTenantToken(FEISHU_APP_ID, FEISHU_APP_SECRET);
    console.log("✅ 获取令牌成功\n");

    console.log("📋 创建字段...");
    
    // 字段类型：1=文本, 2=数字, 5=日期, 15=超链接
    await createField(token, '文件名', 1);           // 文本
    await createField(token, 'OSS路径', 1);          // 文本
    await createField(token, 'OSS_URL', 15);         // 超链接
    await createField(token, 'MD5哈希', 1);          // 文本
    await createField(token, '文件大小', 1);         // 文本
    await createField(token, '上传时间', 5);         // 日期
    await createField(token, '用途', 1);             // 文本（头像/大图/其他）
    await createField(token, '关联记录ID', 1);       // 文本

    console.log("\n✨ 初始化完成！");
    console.log("\n📝 字段说明：");
    console.log("  - 文件名: 原始文件名");
    console.log("  - OSS路径: OSS 中的完整路径");
    console.log("  - OSS_URL: 公网访问链接");
    console.log("  - MD5哈希: 文件的 MD5 值（用于去重）");
    console.log("  - 文件大小: 文件大小（如 1.2MB）");
    console.log("  - 上传时间: 上传到 OSS 的时间");
    console.log("  - 用途: 头像/大图/其他");
    console.log("  - 关联记录ID: 关联的故事记录 ID");

  } catch (error) {
    console.error("\n❌ 初始化失败:", error);
    process.exit(1);
  }
}

main();
