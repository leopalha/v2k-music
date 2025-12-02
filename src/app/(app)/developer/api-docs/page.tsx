'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Key, Copy, Check, Eye, EyeOff, Trash2, Plus, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  maskedKey: string;
  permissions: string[];
  environment: string;
  status: string;
  requestsCount: number;
  lastUsedAt: string | null;
  expiresAt: string | null;
  rateLimit: number;
  createdAt: string;
}

export default function ApiDocsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('overview');
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState('');
  const [creatingKey, setCreatingKey] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      const res = await fetch('/api/developer/keys');
      if (res.ok) {
        const data = await res.json();
        setApiKeys(data.keys || []);
      }
    } catch (error) {
      console.error('Failed to fetch API keys:', error);
    } finally {
      setLoading(false);
    }
  };

  const createApiKey = async () => {
    if (!newKeyName.trim()) return;

    setCreatingKey(true);
    try {
      const res = await fetch('/api/developer/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newKeyName,
          permissions: ['READ_ONLY'],
          environment: 'PRODUCTION',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setNewlyCreatedKey(data.key);
        setNewKeyName('');
        fetchApiKeys();
      }
    } catch (error) {
      console.error('Failed to create API key:', error);
    } finally {
      setCreatingKey(false);
    }
  };

  const revokeApiKey = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch(`/api/developer/keys/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchApiKeys();
      }
    } catch (error) {
      console.error('Failed to revoke API key:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'authentication', label: 'Authentication' },
    { id: 'endpoints', label: 'Endpoints' },
    { id: 'keys', label: 'API Keys' },
    { id: 'examples', label: 'Code Examples' },
  ];

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Key className="w-6 h-6 text-emerald-500" />
          <h1 className="text-3xl font-bold">API Documentation</h1>
        </div>
        <p className="text-gray-400">Build applications with the V2K Music API</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-800 mb-8">
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-emerald-500 text-emerald-500'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h2 className="text-2xl font-bold mb-4">Welcome to V2K Music API</h2>
              <p className="text-gray-400 mb-4">
                The V2K Music API allows you to programmatically access track data, portfolio information, 
                and trading functionality. Build powerful applications on top of the V2K Music platform.
              </p>
              
              <div className="grid md:grid-cols-2 gap-4 mt-6">
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">🚀 Getting Started</h3>
                  <p className="text-sm text-gray-400">Create an API key and start making requests in minutes</p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">📊 Real-time Data</h3>
                  <p className="text-sm text-gray-400">Access live market data, prices, and trading volumes</p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">🔐 Secure</h3>
                  <p className="text-sm text-gray-400">API keys with customizable permissions and rate limits</p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">📖 RESTful</h3>
                  <p className="text-sm text-gray-400">Standard REST API with JSON responses</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-xl font-bold mb-4">Base URL</h3>
              <div className="bg-gray-800 p-4 rounded font-mono text-sm">
                <span className="text-emerald-500">Production:</span> https://v2k-music.vercel.app/api/v1<br />
                <span className="text-blue-500">Development:</span> http://localhost:5000/api/v1
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-xl font-bold mb-4">Quick Start</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-400">
                <li>Generate an API key in the "API Keys" tab</li>
                <li>Include the key in your requests using the Authorization header</li>
                <li>Start making API calls to access data</li>
              </ol>
            </div>
          </div>
        )}

        {/* Authentication Tab */}
        {activeTab === 'authentication' && (
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h2 className="text-2xl font-bold mb-4">Authentication</h2>
              <p className="text-gray-400 mb-4">
                All API requests require authentication using an API key. Include your API key in the request header.
              </p>

              <h3 className="text-lg font-semibold mb-3 mt-6">Header Format</h3>
              <div className="bg-gray-800 p-4 rounded font-mono text-sm mb-6">
                Authorization: Bearer sk_live_your_api_key_here
              </div>

              <h3 className="text-lg font-semibold mb-3">cURL Example</h3>
              <div className="bg-gray-800 p-4 rounded font-mono text-sm overflow-x-auto">
                <pre>{`curl -X GET "https://v2k-music.vercel.app/api/v1/tracks" \\
  -H "Authorization: Bearer sk_live_your_api_key_here"`}</pre>
              </div>

              <div className="mt-6 p-4 bg-blue-900/20 border border-blue-800 rounded-lg">
                <h4 className="font-semibold text-blue-400 mb-2">💡 API Key Formats</h4>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li><span className="text-emerald-500 font-mono">sk_live_...</span> - Production keys</li>
                  <li><span className="text-blue-500 font-mono">sk_test_...</span> - Sandbox keys (test data only)</li>
                </ul>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold mb-3">Permissions</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="bg-gray-800 px-3 py-1 rounded text-sm font-mono">READ_ONLY</span>
                  <p className="text-sm text-gray-400">Read access to public endpoints (GET requests)</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="bg-gray-800 px-3 py-1 rounded text-sm font-mono">WRITE</span>
                  <p className="text-sm text-gray-400">Create and update data (POST, PUT, PATCH)</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="bg-gray-800 px-3 py-1 rounded text-sm font-mono">TRADE</span>
                  <p className="text-sm text-gray-400">Execute trades on behalf of the user</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="bg-gray-800 px-3 py-1 rounded text-sm font-mono">FULL_ACCESS</span>
                  <p className="text-sm text-gray-400">Complete access to all endpoints</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Endpoints Tab */}
        {activeTab === 'endpoints' && (
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h2 className="text-2xl font-bold mb-4">API Endpoints</h2>
              
              <div className="space-y-4">
                {/* Tracks endpoint */}
                <div className="border border-gray-800 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="bg-emerald-500/20 text-emerald-500 px-3 py-1 rounded font-mono text-sm">GET</span>
                    <span className="font-mono text-sm">/tracks</span>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">
                    Get a paginated list of all active tracks with optional filters
                  </p>
                  <div className="bg-gray-800 p-3 rounded">
                    <p className="text-xs text-gray-500 mb-2">Query Parameters:</p>
                    <div className="space-y-1 text-sm font-mono">
                      <div><span className="text-blue-400">page</span> <span className="text-gray-500">integer</span> - Page number (default: 1)</div>
                      <div><span className="text-blue-400">limit</span> <span className="text-gray-500">integer</span> - Items per page (max: 100)</div>
                      <div><span className="text-blue-400">genre</span> <span className="text-gray-500">string</span> - Filter by genre</div>
                      <div><span className="text-blue-400">sortBy</span> <span className="text-gray-500">string</span> - Sort field</div>
                    </div>
                  </div>
                </div>

                <a 
                  href="/api-docs/openapi.json" 
                  target="_blank"
                  className="inline-flex items-center gap-2 text-emerald-500 hover:text-emerald-400 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Full OpenAPI Specification
                </a>
              </div>
            </div>
          </div>
        )}

        {/* API Keys Tab */}
        {activeTab === 'keys' && (
          <div className="space-y-6">
            {/* Newly created key alert */}
            {newlyCreatedKey && (
              <div className="bg-emerald-900/20 border border-emerald-800 rounded-lg p-4">
                <h3 className="text-emerald-500 font-semibold mb-2">🎉 API Key Created!</h3>
                <p className="text-sm text-gray-400 mb-3">
                  Save this key securely. It will not be shown again.
                </p>
                <div className="flex items-center gap-2 bg-gray-900 p-3 rounded">
                  <code className="flex-1 text-sm font-mono break-all">{newlyCreatedKey}</code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(newlyCreatedKey)}
                  >
                    {copiedKey ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="mt-3"
                  onClick={() => setNewlyCreatedKey(null)}
                >
                  I've saved my key
                </Button>
              </div>
            )}

            {/* Create new key */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h2 className="text-xl font-bold mb-4">Create New API Key</h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Key name (e.g., Production App)"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="flex-1 bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white"
                />
                <Button
                  onClick={createApiKey}
                  disabled={creatingKey || !newKeyName.trim()}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Key
                </Button>
              </div>
            </div>

            {/* API Keys List */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h2 className="text-xl font-bold mb-4">Your API Keys</h2>
              
              {loading ? (
                <div className="text-center text-gray-400 py-8">Loading...</div>
              ) : apiKeys.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  No API keys yet. Create one to get started.
                </div>
              ) : (
                <div className="space-y-3">
                  {apiKeys.map((key) => (
                    <div
                      key={key.id}
                      className="bg-gray-800 rounded-lg p-4 border border-gray-700"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">{key.name}</h3>
                            <span className={`px-2 py-1 rounded text-xs ${
                              key.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-gray-700 text-gray-400'
                            }`}>
                              {key.status}
                            </span>
                            <span className="px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-500">
                              {key.environment}
                            </span>
                          </div>
                          <p className="font-mono text-sm text-gray-400 mb-2">{key.maskedKey}</p>
                          <div className="flex gap-4 text-xs text-gray-500">
                            <span>Requests: {key.requestsCount}</span>
                            <span>Rate Limit: {key.rateLimit}/hour</span>
                            {key.lastUsedAt && (
                              <span>Last used: {new Date(key.lastUsedAt).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => revokeApiKey(key.id)}
                          className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Examples Tab */}
        {activeTab === 'examples' && (
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h2 className="text-2xl font-bold mb-4">Code Examples</h2>
              
              {/* JavaScript Example */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">JavaScript / Node.js</h3>
                <div className="bg-gray-800 p-4 rounded font-mono text-sm overflow-x-auto">
                  <pre>{`const apiKey = 'sk_live_your_api_key_here';

const response = await fetch('https://v2k-music.vercel.app/api/v1/tracks', {
  headers: {
    'Authorization': \`Bearer \${apiKey}\`
  }
});

const data = await response.json();
console.log(data);`}</pre>
                </div>
              </div>

              {/* Python Example */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Python</h3>
                <div className="bg-gray-800 p-4 rounded font-mono text-sm overflow-x-auto">
                  <pre>{`import requests

api_key = 'sk_live_your_api_key_here'
headers = {'Authorization': f'Bearer {api_key}'}

response = requests.get('https://v2k-music.vercel.app/api/v1/tracks', headers=headers)
data = response.json()
print(data)`}</pre>
                </div>
              </div>

              {/* cURL Example */}
              <div>
                <h3 className="text-lg font-semibold mb-3">cURL</h3>
                <div className="bg-gray-800 p-4 rounded font-mono text-sm overflow-x-auto">
                  <pre>{`curl -X GET "https://v2k-music.vercel.app/api/v1/tracks?page=1&limit=20" \\
  -H "Authorization: Bearer sk_live_your_api_key_here"`}</pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
