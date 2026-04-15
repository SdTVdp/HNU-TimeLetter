'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

type Config = {
  sync: {
    enabled: boolean;
    cron: string;
    lastRun?: string;
    status: string;
    lastMessage?: string;
  };
};

export default function DashboardPage() {
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchConfig = async () => {
    try {
        const res = await fetch('/api/admin/sync');
        if (res.ok) {
            setConfig(await res.json());
        }
    } catch (e) {
        console.error("Failed to fetch config", e);
    }
  };

  useEffect(() => {
    fetchConfig();
    const interval = setInterval(fetchConfig, 5000); // Poll status
    return () => clearInterval(interval);
  }, []);

  const handleSync = async () => {
    setLoading(true);
    try {
        await fetch('/api/admin/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'trigger' }),
        });
        // Wait a bit before fetching config to allow status update
        setTimeout(fetchConfig, 500);
    } finally {
        setLoading(false);
    }
  };

  const handleUpdate = async (enabled: boolean, cron: string) => {
    try {
        await fetch('/api/admin/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'update', enabled, cron }),
        });
        fetchConfig();
    } catch (e) {
        console.error("Failed to update config", e);
    }
  };

  if (!config) return <div className="p-8">Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">系统控制台</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-lg font-semibold mb-4">数据同步状态</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>状态:</span>
              <span className={`px-2 py-1 rounded text-sm ${
                config.sync.status === 'running' ? 'bg-blue-100 text-blue-800' :
                config.sync.status === 'success' ? 'bg-green-100 text-green-800' :
                config.sync.status === 'failed' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {config.sync.status.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>上次执行:</span>
              <span>{config.sync.lastRun ? new Date(config.sync.lastRun).toLocaleString() : 'Never'}</span>
            </div>
            {config.sync.lastMessage && (
               <div className="bg-gray-50 p-2 rounded text-sm text-gray-600 mt-2 break-all">
                 {config.sync.lastMessage}
               </div>
            )}
            <Button 
              onClick={handleSync} 
              disabled={loading || config.sync.status === 'running'}
              className="w-full mt-4"
            >
              {loading || config.sync.status === 'running' ? '同步中...' : '立即同步'}
            </Button>
          </div>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-lg font-semibold mb-4">定时任务配置</h3>
          <div className="space-y-4">
             <div className="flex items-center justify-between">
                <span>启用定时任务:</span>
                <input 
                  type="checkbox" 
                  checked={config.sync.enabled}
                  onChange={(e) => handleUpdate(e.target.checked, config.sync.cron)}
                  className="h-5 w-5"
                />
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cron 表达式</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={config.sync.cron}
                    onChange={(e) => setConfig({ ...config, sync: { ...config.sync, cron: e.target.value } })}
                    onBlur={(e) => handleUpdate(config.sync.enabled, e.target.value)}
                    className="flex-1 p-2 border rounded"
                  />
                  <Button onClick={() => handleUpdate(config.sync.enabled, config.sync.cron)}>保存</Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">例如: 0 0 * * * (每天凌晨)</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
