/**
 * 初始化飞书多维表格
 * 1. 创建必要的字段
 * 2. 填充示例数据
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

// 创建字段
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

// 添加记录
async function addRecord(token: string, fields: Record<string, unknown>) {
  const url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${FEISHU_APP_TOKEN}/tables/${FEISHU_TABLE_ID}/records`;
  
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json; charset=utf-8"
    },
    body: JSON.stringify({
      fields
    })
  });

  const json = await res.json();
  if (json.code !== 0) {
    console.log(`⚠️  添加记录失败: ${json.msg}`);
    return null;
  }
  
  return json.data.record;
}

async function main() {
  try {
    console.log("🚀 开始初始化飞书表格\n");

    if (!FEISHU_APP_ID || !FEISHU_APP_SECRET || !FEISHU_APP_TOKEN || !FEISHU_TABLE_ID) {
      throw new Error("缺少必要的环境变量");
    }

    const token = await getTenantToken(FEISHU_APP_ID, FEISHU_APP_SECRET);
    console.log("✅ 获取令牌成功\n");

    // 步骤 1: 创建字段
    console.log("📋 步骤 1: 创建字段");
    console.log("─────────────────────");
    
    // 字段类型参考：
    // 1: 文本, 2: 数字, 3: 单选, 4: 多选, 5: 日期, 7: 复选框, 
    // 11: 人员, 13: 电话, 15: 超链接, 17: 附件, 18: 关联, 20: 公式, 21: 双向关联
    
    await createField(token, "角色ID", 1);        // 文本
    await createField(token, "角色名", 1);         // 文本
    await createField(token, "头像URL", 1);       // 文本
    await createField(token, "大图URL", 1);       // 文本
    await createField(token, "故事内容", 1);      // 文本（多行）
    await createField(token, "投稿人", 1);        // 文本
    await createField(token, "日期", 1);          // 文本 (YYYY.MM.DD)
    await createField(token, "地点ID", 1);        // 文本
    await createField(token, "地点名称", 1);      // 文本

    console.log("\n📝 步骤 2: 填充示例数据");
    console.log("─────────────────────");

    // 示例数据（基于 mock-content.json）
    const sampleRecords = [
      {
        "Text": "故事001",
        "角色ID": "char-001",
        "角色名": "夏目绫",
        "头像URL": "/images/avatars/natsume.png",
        "大图URL": "/images/scenes/library-natsume.jpg",
        "故事内容": "那天下午，阳光透过图书馆的落地窗洒在书架上。她坐在靠窗的位置，手里捧着一本村上春树的《挪威的森林》。\n\n我走过去，轻声问：\"这个位置有人吗？\"\n\n她抬起头，露出温柔的笑容：\"没有，请坐。\"\n\n就这样，我们成为了图书馆的常客。",
        "投稿人": "投稿者A",
        "日期": "2024.03.15",
        "地点ID": "lib-001",
        "地点名称": "图书馆"
      },
      {
        "Text": "故事002",
        "角色ID": "char-002",
        "角色名": "樱井美咲",
        "头像URL": "/images/avatars/sakurai.png",
        "大图URL": "/images/scenes/library-sakurai.jpg",
        "故事内容": "考试周的图书馆总是人满为患。她占了一个角落的位置，周围堆满了专业书。\n\n\"借过一下，这本《数据结构》能借我看看吗？\"\n\n她推了推眼镜，递给我书的同时，还附上了一张手写的笔记。\n\n\"这是我整理的重点，希望对你有帮助。\"",
        "投稿人": "投稿者B",
        "日期": "2024.06.20",
        "地点ID": "lib-001",
        "地点名称": "图书馆"
      },
      {
        "Text": "故事003",
        "角色ID": "char-003",
        "角色名": "月见栞",
        "头像URL": "/images/avatars/tsukimi.png",
        "大图URL": "/images/scenes/lake-tsukimi.jpg",
        "故事内容": "傍晚的东坡湖特别美，夕阳把湖面染成了金色。\n\n她站在湖边，手里拿着相机，专注地捕捉着光影的变化。\n\n\"你也喜欢摄影吗？\"我问。\n\n\"嗯，我想把这些美好的瞬间都留下来。\"她转过身，对着我按下了快门。\n\n那张照片，我至今还保存着。",
        "投稿人": "投稿者C",
        "日期": "2024.04.10",
        "地点ID": "lake-001",
        "地点名称": "东坡湖"
      }
    ];

    for (const record of sampleRecords) {
      const result = await addRecord(token, record);
      if (result) {
        console.log(`✅ 添加记录: ${record.Text}`);
      }
    }

    console.log("\n✨ 初始化完成！");
    console.log("📊 已创建 9 个字段");
    console.log(`📝 已添加 ${sampleRecords.length} 条示例记录`);

  } catch (error) {
    console.error("\n❌ 初始化失败:", error);
    process.exit(1);
  }
}

main();
