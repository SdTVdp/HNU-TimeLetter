/**
 * 从 Wiki 节点获取 Bitable 的 app_token
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

const FEISHU_APP_ID = process.env.FEISHU_APP_ID;
const FEISHU_APP_SECRET = process.env.FEISHU_APP_SECRET;
const WIKI_NODE_TOKEN = 'ScDawoedLivEd0kvLKjcaYIjn98'; // 从 URL 中提取

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

async function getWikiNode(token: string, nodeToken: string) {
  const url = `https://open.feishu.cn/open-apis/wiki/v2/spaces/get_node?token=${encodeURIComponent(nodeToken)}`;
  
  console.log("\n📡 请求 Wiki 节点信息");
  console.log("URL:", url);

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json; charset=utf-8"
    }
  });

  const json = await res.json();
  console.log("\n📥 Wiki 节点响应:", JSON.stringify(json, null, 2));
  
  if (json.code !== 0) {
    throw new Error(`Get Wiki Node Failed: ${json.msg} (code: ${json.code})`);
  }
  
  return json;
}

async function main() {
  try {
    console.log("🚀 开始获取 Wiki 节点的 app_token\n");
    console.log("📝 Wiki 节点 Token:", WIKI_NODE_TOKEN);

    if (!FEISHU_APP_ID || !FEISHU_APP_SECRET) {
      throw new Error("缺少必要的环境变量");
    }

    const token = await getTenantToken(FEISHU_APP_ID, FEISHU_APP_SECRET);
    console.log("✅ 获取令牌成功");

    const result = await getWikiNode(token, WIKI_NODE_TOKEN);
    
    if (result.data?.node?.obj_type === 'bitable') {
      const appToken = result.data.node.obj_token;
      console.log("\n✅ 成功获取 app_token!");
      console.log("📋 请将以下值更新到 .env.local:");
      console.log(`FEISHU_APP_TOKEN=${appToken}`);
    } else {
      console.log("\n⚠️  节点类型不是 bitable:", result.data?.node?.obj_type);
    }

  } catch (error) {
    console.error("\n❌ 获取失败:", error);
    process.exit(1);
  }
}

main();
