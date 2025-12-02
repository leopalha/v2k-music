'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Database, 
  Zap, 
  Clock, 
  TrendingUp,
  Server,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  responseTime: number;
  checks: {
    database: {
      status: string;
      latency: number;
    };
    redis: {
      status: string;
      latency: number;
    };
    memory: {
      status: string;
      usage: number;
      limit: number;
    };
  };
}

interface Metrics {
  timestamp: string;
  queries: {
    total: number;
    averageDuration: number;
    slowQueries: number;
    slowestQuery: {
      model: string;
      action: string;
      duration: number;
    } | null;
    recentSlowQueries: Array<{
      model: string;
      action: string;
      duration: number;
      timestamp: string;
    }>;
  };
  memory: {
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
  };
  process: {
    uptime: number;
    pid: number;
    platform: string;
    nodeVersion: string;
  };
  cache: {
    enabled: boolean;
  };
}

export default function MonitoringPage() {
  const [health, setHealth] = useState<HealthCheck | null>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchData = async () => {
    try {
      const [healthRes, metricsRes] = await Promise.all([
        fetch('/api/health'),
        fetch('/api/metrics'),
      ]);

      if (healthRes.ok) {
        const healthData = await healthRes.json();
        setHealth(healthData);
      }

      if (metricsRes.ok) {
        const metricsData = await metricsRes.json();
        setMetrics(metricsData);
      }
    } catch (error) {
      console.error('Failed to fetch monitoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    if (autoRefresh) {
      const interval = setInterval(fetchData, 10000); // Refresh every 10s
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'unhealthy':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'disabled':
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
      default:
        return <Activity className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-green-500">Healthy</Badge>;
      case 'degraded':
        return <Badge className="bg-yellow-500">Degraded</Badge>;
      case 'unhealthy':
        return <Badge className="bg-red-500">Unhealthy</Badge>;
      case 'disabled':
        return <Badge className="bg-gray-500">Disabled</Badge>;
      default:
        return <Badge className="bg-gray-500">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span className="text-lg">Loading monitoring data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Monitoring</h1>
          <p className="text-muted-foreground">Real-time system health and performance metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={autoRefresh ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Now
          </Button>
        </div>
      </div>

      {/* Overall Status */}
      {health && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">System Status</h2>
            {getStatusBadge(health.status)}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Uptime</p>
                <p className="text-2xl font-bold">{formatUptime(health.uptime)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Zap className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Response Time</p>
                <p className="text-2xl font-bold">{health.responseTime}ms</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Last Check</p>
                <p className="text-sm font-medium">{new Date(health.timestamp).toLocaleTimeString()}</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Health Checks */}
      {health && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Database */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                <h3 className="font-semibold">Database</h3>
              </div>
              {getStatusIcon(health.checks.database.status)}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                {getStatusBadge(health.checks.database.status)}
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Latency</span>
                <span className="font-medium">{health.checks.database.latency}ms</span>
              </div>
            </div>
          </Card>

          {/* Redis */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5" />
                <h3 className="font-semibold">Redis Cache</h3>
              </div>
              {getStatusIcon(health.checks.redis.status)}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                {getStatusBadge(health.checks.redis.status)}
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Latency</span>
                <span className="font-medium">
                  {health.checks.redis.status === 'disabled' ? 'N/A' : `${health.checks.redis.latency}ms`}
                </span>
              </div>
            </div>
          </Card>

          {/* Memory */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                <h3 className="font-semibold">Memory</h3>
              </div>
              {getStatusIcon(health.checks.memory.status)}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                {getStatusBadge(health.checks.memory.status)}
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Usage</span>
                <span className="font-medium">
                  {health.checks.memory.usage} / {health.checks.memory.limit} MB
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Performance Metrics */}
      {metrics && (
        <>
          {/* Query Performance */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Database Queries</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div>
                <p className="text-sm text-muted-foreground">Total Queries</p>
                <p className="text-2xl font-bold">{metrics.queries.total}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average Duration</p>
                <p className="text-2xl font-bold">{metrics.queries.averageDuration}ms</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Slow Queries</p>
                <p className="text-2xl font-bold text-yellow-500">{metrics.queries.slowQueries}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Slowest Query</p>
                <p className="text-2xl font-bold text-red-500">
                  {metrics.queries.slowestQuery?.duration || 0}ms
                </p>
              </div>
            </div>

            {/* Recent Slow Queries */}
            {metrics.queries.recentSlowQueries.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Recent Slow Queries (&gt;100ms)</h3>
                <div className="space-y-2">
                  {metrics.queries.recentSlowQueries.map((query, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{query.model}</Badge>
                        <span className="text-sm">{query.action}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {new Date(query.timestamp).toLocaleTimeString()}
                        </span>
                        <Badge className="bg-red-500">{query.duration}ms</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Memory & Process */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Memory Stats */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Memory Usage</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Heap Used</span>
                  <span className="font-medium">{metrics.memory.heapUsed} MB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Heap Total</span>
                  <span className="font-medium">{metrics.memory.heapTotal} MB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">External</span>
                  <span className="font-medium">{metrics.memory.external} MB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">RSS</span>
                  <span className="font-medium">{metrics.memory.rss} MB</span>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Usage Percentage</span>
                    <span className="font-bold text-lg">
                      {((metrics.memory.heapUsed / metrics.memory.heapTotal) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Process Info */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Process Information</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Uptime</span>
                  <span className="font-medium">{formatUptime(metrics.process.uptime)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Process ID</span>
                  <span className="font-medium">{metrics.process.pid}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Platform</span>
                  <span className="font-medium capitalize">{metrics.process.platform}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Node Version</span>
                  <span className="font-medium">{metrics.process.nodeVersion}</span>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Cache Status</span>
                    {metrics.cache.enabled ? (
                      <Badge className="bg-green-500">Enabled</Badge>
                    ) : (
                      <Badge className="bg-gray-500">Disabled</Badge>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </>
      )}

      {/* Footer Info */}
      <Card className="p-4 bg-muted">
        <p className="text-sm text-muted-foreground text-center">
          Monitoring dashboard updates every 10 seconds when auto-refresh is enabled.
          <br />
          Configure Sentry DSN in environment variables for error tracking.
        </p>
      </Card>
    </div>
  );
}
