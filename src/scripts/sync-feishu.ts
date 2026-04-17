import { syncFeishuData } from '../lib/sync-service';

async function main() {
  try {
    const result = await syncFeishuData();
    if (result.success) {
      console.log(result.message);
      if (result.data) {
        console.log(
          `地点数: ${result.data.locationCount}, 故事数: ${result.data.storyCount}, 创作记录数: ${result.data.creationIdeaCount}`
        );
      }
    } else {
      console.error(result.message);
      process.exit(1);
    }
  } catch (error) {
    console.error('同步失败:', error);
    process.exit(1);
  }
}

main();
