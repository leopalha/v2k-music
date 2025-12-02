# V2K Webhooks Guide

## Overview

Webhooks allow you to receive real-time notifications about events in your V2K account. Instead of polling for changes, your server will receive HTTP POST requests when events occur.

## Getting Started

### 1. Create a Webhook Endpoint

Create an endpoint on your server to receive webhook events:

```javascript
// Express.js example
app.post('/webhooks/v2k', async (req, res) => {
  const signature = req.headers['x-v2k-signature'];
  const event = req.headers['x-v2k-event'];
  const payload = req.body;
  
  // Verify signature (see Security section)
  if (!verifySignature(payload, signature, YOUR_WEBHOOK_SECRET)) {
    return res.status(401).send('Invalid signature');
  }
  
  // Process event
  switch (event) {
    case 'trade.completed':
      await handleTradeCompleted(payload.data);
      break;
    case 'alert.triggered':
      await handleAlertTriggered(payload.data);
      break;
    // ... handle other events
  }
  
  res.status(200).send('OK');
});
```

### 2. Register Your Webhook

```bash
curl -X POST https://v2k-music.com/api/webhooks \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-domain.com/webhooks/v2k",
    "events": ["trade.completed", "alert.triggered"],
    "description": "My webhook"
  }'
```

**Response:**
```json
{
  "id": "wh_abc123",
  "url": "https://your-domain.com/webhooks/v2k",
  "secret": "whsec_xyz789",
  "events": ["trade.completed", "alert.triggered"],
  "isActive": true
}
```

**⚠️ Save the secret!** You'll need it to verify webhook signatures.

## Event Types

### trade.completed
Fired when a trade is successfully executed.

```json
{
  "event": "trade.completed",
  "timestamp": "2025-12-02T12:00:00Z",
  "data": {
    "tradeId": "tx_123",
    "userId": "user_456",
    "trackId": "track_789",
    "type": "BUY",
    "amount": 100,
    "price": 1.50,
    "totalValue": 150.00,
    "txHash": "0x..."
  }
}
```

### trade.failed
Fired when a trade fails.

```json
{
  "event": "trade.failed",
  "timestamp": "2025-12-02T12:00:00Z",
  "data": {
    "tradeId": "tx_123",
    "userId": "user_456",
    "reason": "Insufficient balance"
  }
}
```

### alert.triggered
Fired when a price alert is triggered.

```json
{
  "event": "alert.triggered",
  "timestamp": "2025-12-02T12:00:00Z",
  "data": {
    "alertId": "alert_123",
    "userId": "user_456",
    "trackId": "track_789",
    "condition": "ABOVE",
    "targetPrice": 2.00,
    "currentPrice": 2.05
  }
}
```

### royalty.claimed
Fired when royalties are claimed.

```json
{
  "event": "royalty.claimed",
  "timestamp": "2025-12-02T12:00:00Z",
  "data": {
    "userId": "user_456",
    "amount": 150.50,
    "tracks": [
      {
        "trackId": "track_789",
        "amount": 150.50
      }
    ]
  }
}
```

### portfolio.updated
Fired when portfolio is significantly updated.

```json
{
  "event": "portfolio.updated",
  "timestamp": "2025-12-02T12:00:00Z",
  "data": {
    "userId": "user_456",
    "totalValue": 50000,
    "change": 500,
    "changePercent": 1.01
  }
}
```

### user.kyc.approved
Fired when KYC is approved.

```json
{
  "event": "user.kyc.approved",
  "timestamp": "2025-12-02T12:00:00Z",
  "data": {
    "userId": "user_456",
    "verifiedAt": "2025-12-02T12:00:00Z"
  }
}
```

### user.kyc.rejected
Fired when KYC is rejected.

```json
{
  "event": "user.kyc.rejected",
  "timestamp": "2025-12-02T12:00:00Z",
  "data": {
    "userId": "user_456",
    "reason": "Invalid document"
  }
}
```

## Security

### Signature Verification

Every webhook includes an `X-V2K-Signature` header containing an HMAC SHA256 signature.

**Node.js:**
```javascript
const crypto = require('crypto');

function verifySignature(payload, signature, secret) {
  const payloadString = JSON.stringify(payload);
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payloadString)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

**Python:**
```python
import hmac
import hashlib

def verify_signature(payload, signature, secret):
    payload_string = json.dumps(payload)
    expected_signature = hmac.new(
        secret.encode(),
        payload_string.encode(),
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(signature, expected_signature)
```

### Best Practices

1. **Always verify signatures** before processing events
2. **Use HTTPS** for your webhook endpoint
3. **Return 200 quickly** - process events asynchronously
4. **Implement idempotency** - events may be delivered multiple times
5. **Store webhook secret securely** - use environment variables

## Retry Logic

If your endpoint returns a non-2xx status code or times out:
- **Retry 1:** After 2 seconds
- **Retry 2:** After 4 seconds  
- **Retry 3:** After 8 seconds

After 10 consecutive failures, the webhook will be automatically disabled.

## Testing

### Test Endpoint

```bash
curl -X POST https://v2k-music.com/api/webhooks/wh_abc123/test \
  -H "Authorization: Bearer YOUR_API_KEY"
```

This sends a test event to your webhook:

```json
{
  "event": "test",
  "timestamp": "2025-12-02T12:00:00Z",
  "data": {
    "test": true,
    "message": "This is a test webhook"
  }
}
```

### Local Development

Use tools like [ngrok](https://ngrok.com) to expose your local server:

```bash
ngrok http 3000
```

Then register the ngrok URL as your webhook.

## Managing Webhooks

### List Webhooks

```bash
curl https://v2k-music.com/api/webhooks \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Update Webhook

```bash
curl -X PATCH https://v2k-music.com/api/webhooks/wh_abc123 \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "events": ["trade.completed", "alert.triggered", "royalty.claimed"],
    "isActive": true
  }'
```

### Delete Webhook

```bash
curl -X DELETE https://v2k-music.com/api/webhooks/wh_abc123 \
  -H "Authorization: Bearer YOUR_API_KEY"
```

## Monitoring

Track webhook deliveries in your dashboard at `/admin/webhooks`:
- Success/failure rates
- Response times
- Recent deliveries
- Error logs

## Rate Limits

- Maximum 10 webhooks per user
- Maximum 100 deliveries per minute per webhook
- 10 second timeout per delivery

## Support

Having issues with webhooks?
- Check delivery logs in dashboard
- Verify your endpoint is accessible
- Test signature verification
- Contact support: dev@v2k-music.com
