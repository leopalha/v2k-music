# V2K Widgets - Integration Guide

## Overview

V2K Widgets allow you to embed music tracks, portfolios, and leaderboards directly into your website. No complex integration required - just copy and paste an iframe.

## Widget Types

### 1. Track Player Widget
Embed a music track with playback, stats, and pricing information.

### 2. Portfolio Showcase Widget
Display a user's investment portfolio with holdings and performance.

### 3. Leaderboard Widget
Show top investors on your platform.

## Quick Start

### Using the Widget Builder

1. Go to [https://v2k-music.com/developer/widgets](https://v2k-music.com/developer/widgets)
2. Select widget type
3. Configure options (theme, size, etc.)
4. Copy the generated code
5. Paste into your HTML

### Manual Integration

#### Track Player

```html
<iframe
  src="https://v2k-music.com/embed/track/TRACK_ID?theme=light"
  width="400"
  height="500"
  frameborder="0"
  style="border: none; border-radius: 8px;"
  allow="autoplay"
></iframe>
```

#### Portfolio Showcase

```html
<iframe
  src="https://v2k-music.com/embed/portfolio/USER_ID?theme=dark"
  width="100%"
  height="600"
  frameborder="0"
  style="border: none; border-radius: 8px;"
></iframe>
```

#### Leaderboard

```html
<iframe
  src="https://v2k-music.com/embed/leaderboard?limit=10&theme=light"
  width="100%"
  height="500"
  frameborder="0"
  style="border: none; border-radius: 8px;"
></iframe>
```

## Configuration Options

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `theme` | string | `light` | Widget theme: `light`, `dark`, or `auto` |
| `autoplay` | boolean | `false` | Auto-play track (track widget only) |
| `limit` | number | `10` | Number of items (leaderboard only) |

### Examples

**Dark theme with autoplay:**
```
/embed/track/abc123?theme=dark&autoplay=true
```

**Leaderboard with 5 items:**
```
/embed/leaderboard?limit=5&theme=light
```

## Responsive Design

All widgets are responsive. For best results:

**Desktop:**
```html
<iframe width="600" height="500" ...></iframe>
```

**Mobile-friendly:**
```html
<iframe width="100%" height="500" ...></iframe>
```

## Styling

### Custom Styling

Widgets respect the theme parameter but can also be styled via CSS:

```css
iframe.v2k-widget {
  border: 2px solid #000;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}
```

### Dark Mode Support

Use `theme=auto` to automatically match the user's system theme preference:

```html
<iframe src="...?theme=auto" ...></iframe>
```

## Security & Performance

### Security

- Widgets run in isolated iframes
- No cookies or tracking
- CORS-enabled for cross-domain embedding
- No access to parent page data

### Performance

- Lazy loading enabled by default
- Optimized asset delivery
- Minimal JavaScript footprint
- Fast initial render

## Advanced Usage

### Dynamic Widget Loading

Load widgets dynamically with JavaScript:

```javascript
function loadV2KWidget(containerId, widgetType, config) {
  const container = document.getElementById(containerId);
  const params = new URLSearchParams(config);
  
  const iframe = document.createElement('iframe');
  iframe.src = `https://v2k-music.com/embed/${widgetType}?${params}`;
  iframe.width = config.width || '100%';
  iframe.height = config.height || '500';
  iframe.frameBorder = '0';
  iframe.loading = 'lazy';
  
  container.appendChild(iframe);
}

// Usage
loadV2KWidget('widget-container', 'track/abc123', {
  theme: 'dark',
  autoplay: 'true'
});
```

### Multiple Widgets

Embed multiple widgets on one page:

```html
<!-- Track 1 -->
<iframe src="https://v2k-music.com/embed/track/track1" ...></iframe>

<!-- Track 2 -->
<iframe src="https://v2k-music.com/embed/track/track2" ...></iframe>

<!-- Leaderboard -->
<iframe src="https://v2k-music.com/embed/leaderboard" ...></iframe>
```

## WordPress Integration

### Using HTML Block

1. Add an HTML block to your page
2. Paste the widget iframe code
3. Publish

### Using Shortcode (Plugin)

Create a simple shortcode:

```php
function v2k_widget_shortcode($atts) {
    $atts = shortcode_atts(array(
        'type' => 'track',
        'id' => '',
        'theme' => 'light',
        'width' => '100%',
        'height' => '500'
    ), $atts);
    
    $url = "https://v2k-music.com/embed/{$atts['type']}";
    if ($atts['id']) {
        $url .= "/{$atts['id']}";
    }
    $url .= "?theme={$atts['theme']}";
    
    return sprintf(
        '<iframe src="%s" width="%s" height="%s" frameborder="0"></iframe>',
        esc_url($url),
        esc_attr($atts['width']),
        esc_attr($atts['height'])
    );
}
add_shortcode('v2k', 'v2k_widget_shortcode');
```

**Usage:**
```
[v2k type="track" id="abc123" theme="dark"]
```

## React Integration

```jsx
function V2KWidget({ type, id, theme = 'light', width = '100%', height = 500 }) {
  const src = `https://v2k-music.com/embed/${type}${id ? `/${id}` : ''}?theme=${theme}`;
  
  return (
    <iframe
      src={src}
      width={width}
      height={height}
      frameBorder="0"
      loading="lazy"
      allow="autoplay"
      style={{ border: 'none', borderRadius: '8px' }}
    />
  );
}

// Usage
<V2KWidget type="track" id="abc123" theme="dark" />
```

## Troubleshooting

### Widget Not Loading

1. Check if iframe src URL is correct
2. Verify track/user ID exists
3. Ensure domain allows iframe embeds
4. Check browser console for errors

### Styling Issues

1. Make sure `frameborder="0"` is set
2. Add `style="border: none"` for clean look
3. Use `loading="lazy"` for better performance

### Autoplay Not Working

Autoplay is restricted by browsers:
- User must interact with page first
- HTTPS required
- Some browsers block autoplay by default

## Support

Need help with widgets?
- **Widget Builder:** https://v2k-music.com/developer/widgets
- **Documentation:** https://v2k-music.com/docs
- **Email:** dev@v2k-music.com

## Examples Gallery

Visit [https://v2k-music.com/developer/widgets](https://v2k-music.com/developer/widgets) to see live examples of all widget types.
