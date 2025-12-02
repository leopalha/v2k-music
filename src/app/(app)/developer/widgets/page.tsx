'use client';

import { useState, useEffect } from 'react';
import { generateWidgetCode, type WidgetConfig } from '@/lib/widgets/builder';

export default function WidgetBuilderPage() {
  const [config, setConfig] = useState<WidgetConfig>({
    type: 'track',
    width: 400,
    height: 500,
    theme: 'light',
    autoplay: false,
    trackId: '',
  });

  const [generatedCode, setGeneratedCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      if (config.type === 'track' && !config.trackId) {
        setGeneratedCode('// Enter a Track ID to generate widget code');
        return;
      }
      if (config.type === 'portfolio' && !config.slug && !config.userId) {
        setGeneratedCode('// Enter a User ID or slug to generate widget code');
        return;
      }
      const code = generateWidgetCode(config);
      setGeneratedCode(code);
    } catch (error) {
      setGeneratedCode(`// Error: ${(error as Error).message}`);
    }
  }, [config]);

  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Widget Builder</h1>
        <p className="text-gray-600 mt-2">
          Embed V2K widgets on your website or blog
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Panel */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Configuration</h2>

          <div className="space-y-4">
            {/* Widget Type */}
            <div>
              <label className="block text-sm font-medium mb-2">Widget Type</label>
              <select
                value={config.type}
                onChange={(e) =>
                  setConfig({ ...config, type: e.target.value as any })
                }
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="track">Track Player</option>
                <option value="portfolio">Portfolio Showcase</option>
                <option value="leaderboard">Leaderboard</option>
              </select>
            </div>

            {/* Track-specific */}
            {config.type === 'track' && (
              <div>
                <label className="block text-sm font-medium mb-2">Track ID</label>
                <input
                  type="text"
                  value={config.trackId || ''}
                  onChange={(e) =>
                    setConfig({ ...config, trackId: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Enter track ID"
                />
              </div>
            )}

            {/* Portfolio-specific */}
            {config.type === 'portfolio' && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  User Slug or ID
                </label>
                <input
                  type="text"
                  value={config.slug || ''}
                  onChange={(e) => setConfig({ ...config, slug: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Enter user slug"
                />
              </div>
            )}

            {/* Leaderboard-specific */}
            {config.type === 'leaderboard' && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Number of Items
                </label>
                <input
                  type="number"
                  value={config.limit || 10}
                  onChange={(e) =>
                    setConfig({ ...config, limit: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  min="5"
                  max="20"
                />
              </div>
            )}

            {/* Width */}
            <div>
              <label className="block text-sm font-medium mb-2">Width</label>
              <input
                type="text"
                value={config.width}
                onChange={(e) => setConfig({ ...config, width: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="400 or 100%"
              />
            </div>

            {/* Height */}
            <div>
              <label className="block text-sm font-medium mb-2">Height</label>
              <input
                type="number"
                value={config.height}
                onChange={(e) =>
                  setConfig({ ...config, height: parseInt(e.target.value) })
                }
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            {/* Theme */}
            <div>
              <label className="block text-sm font-medium mb-2">Theme</label>
              <select
                value={config.theme}
                onChange={(e) => setConfig({ ...config, theme: e.target.value as any })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </div>

            {/* Autoplay */}
            {config.type === 'track' && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="autoplay"
                  checked={config.autoplay || false}
                  onChange={(e) =>
                    setConfig({ ...config, autoplay: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <label htmlFor="autoplay" className="text-sm font-medium">
                  Autoplay
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Code Output */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Generated Code</h2>
            <button
              onClick={copyCode}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
            >
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
          </div>

          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
            <code>{generatedCode}</code>
          </pre>

          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Usage Instructions</h3>
            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
              <li>Copy the generated code above</li>
              <li>Paste it into your HTML file where you want the widget</li>
              <li>The widget will load automatically when the page is accessed</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Examples Section */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Examples</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">Track Player</h3>
            <p className="text-sm text-gray-600 mb-3">
              Embed a music track with preview and stats
            </p>
            <button
              onClick={() =>
                setConfig({
                  type: 'track',
                  width: 400,
                  height: 500,
                  theme: 'light',
                  trackId: 'example-track-id',
                })
              }
              className="text-sm text-blue-600 hover:underline"
            >
              Load Example
            </button>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">Portfolio Showcase</h3>
            <p className="text-sm text-gray-600 mb-3">
              Display a user's portfolio with holdings
            </p>
            <button
              onClick={() =>
                setConfig({
                  type: 'portfolio',
                  width: '100%',
                  height: 600,
                  theme: 'dark',
                  slug: 'investor',
                })
              }
              className="text-sm text-blue-600 hover:underline"
            >
              Load Example
            </button>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">Leaderboard</h3>
            <p className="text-sm text-gray-600 mb-3">
              Show top investors on your site
            </p>
            <button
              onClick={() =>
                setConfig({
                  type: 'leaderboard',
                  width: '100%',
                  height: 500,
                  theme: 'light',
                  limit: 10,
                })
              }
              className="text-sm text-blue-600 hover:underline"
            >
              Load Example
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
