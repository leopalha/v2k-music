export type WidgetType = 'track' | 'portfolio' | 'leaderboard' | 'market';

export type WidgetTheme = 'light' | 'dark' | 'auto';

export interface WidgetConfig {
  type: WidgetType;
  width?: number | string;
  height?: number | string;
  theme?: WidgetTheme;
  autoplay?: boolean;
  // Track widget specific
  trackId?: string;
  // Portfolio widget specific
  userId?: string;
  slug?: string;
  // Leaderboard widget specific
  limit?: number;
}

/**
 * Gera código HTML/iframe para embed de widgets
 */
export function generateWidgetCode(config: WidgetConfig): string {
  const { type, width = '100%', height = 400, theme = 'light' } = config;
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000';
  let embedUrl = '';

  // Construir URL baseado no tipo
  switch (type) {
    case 'track':
      if (!config.trackId) throw new Error('trackId is required for track widget');
      embedUrl = `${baseUrl}/embed/track/${config.trackId}`;
      break;
    case 'portfolio':
      if (!config.slug && !config.userId) {
        throw new Error('slug or userId is required for portfolio widget');
      }
      embedUrl = config.slug
        ? `${baseUrl}/embed/portfolio/${config.slug}`
        : `${baseUrl}/embed/portfolio/${config.userId}`;
      break;
    case 'leaderboard':
      embedUrl = `${baseUrl}/embed/leaderboard`;
      break;
    case 'market':
      embedUrl = `${baseUrl}/embed/market`;
      break;
  }

  // Adicionar query params
  const params = new URLSearchParams();
  params.append('theme', theme);
  if (config.autoplay) params.append('autoplay', 'true');
  if (config.limit) params.append('limit', config.limit.toString());

  const finalUrl = `${embedUrl}?${params.toString()}`;

  // Gerar código HTML
  const widthStr = typeof width === 'number' ? `${width}px` : width;
  const heightStr = typeof height === 'number' ? `${height}px` : height;

  return `<iframe
  src="${finalUrl}"
  width="${widthStr}"
  height="${heightStr}"
  frameborder="0"
  allow="autoplay; encrypted-media"
  allowtransparency="true"
  loading="lazy"
  style="border: none; border-radius: 8px; overflow: hidden;"
></iframe>`;
}

/**
 * Gera código JavaScript para embed dinâmico
 */
export function generateScriptCode(config: WidgetConfig): string {
  const htmlCode = generateWidgetCode(config);
  
  return `<!-- V2K Widget -->
<div id="v2k-widget"></div>
<script>
  (function() {
    const container = document.getElementById('v2k-widget');
    container.innerHTML = ${JSON.stringify(htmlCode)};
  })();
</script>`;
}

/**
 * Valida configuração de widget
 */
export function validateWidgetConfig(config: WidgetConfig): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validar tipo
  if (!['track', 'portfolio', 'leaderboard', 'market'].includes(config.type)) {
    errors.push('Invalid widget type');
  }

  // Validar campos específicos
  if (config.type === 'track' && !config.trackId) {
    errors.push('trackId is required for track widget');
  }

  if (config.type === 'portfolio' && !config.slug && !config.userId) {
    errors.push('slug or userId is required for portfolio widget');
  }

  // Validar dimensões
  if (config.width && typeof config.width === 'number' && config.width < 200) {
    errors.push('Width must be at least 200px');
  }

  if (config.height && typeof config.height === 'number' && config.height < 200) {
    errors.push('Height must be at least 200px');
  }

  // Validar theme
  if (config.theme && !['light', 'dark', 'auto'].includes(config.theme)) {
    errors.push('Invalid theme');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Extrai configuração da query string
 */
export function parseWidgetParams(searchParams: URLSearchParams): {
  theme: WidgetTheme;
  autoplay: boolean;
  limit?: number;
} {
  return {
    theme: (searchParams.get('theme') as WidgetTheme) || 'light',
    autoplay: searchParams.get('autoplay') === 'true',
    limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
  };
}
