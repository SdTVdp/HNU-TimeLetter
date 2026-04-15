import schedule from 'node-schedule';
import { getAdminConfig, updateAdminConfig } from './config';
import { syncFeishuData } from '../sync-service';

let syncJob: schedule.Job | null = null;

export function initScheduler() {
  const config = getAdminConfig();
  if (config.sync.enabled && config.sync.cron) {
    startSyncJob(config.sync.cron);
  }
}

export function startSyncJob(cron: string) {
  if (syncJob) {
    syncJob.cancel();
  }

  console.log(`[Scheduler] Starting sync job with cron: ${cron}`);
  syncJob = schedule.scheduleJob(cron, async () => {
    console.log('[Scheduler] Triggering scheduled sync...');
    await runSyncTask();
  });
}

export function stopSyncJob() {
  if (syncJob) {
    syncJob.cancel();
    syncJob = null;
    console.log('[Scheduler] Sync job stopped');
  }
}

export async function runSyncTask() {
  updateAdminConfig({
    sync: {
      enabled: getAdminConfig().sync.enabled,
      cron: getAdminConfig().sync.cron,
      status: 'running',
    },
  });

  const result = await syncFeishuData();

  updateAdminConfig({
    sync: {
      enabled: getAdminConfig().sync.enabled,
      cron: getAdminConfig().sync.cron,
      lastRun: new Date().toISOString(),
      status: result.success ? 'success' : 'failed',
      lastMessage: result.message,
    },
  });
}
