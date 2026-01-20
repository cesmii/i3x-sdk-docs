# Troubleshooting Common Issues

## Troubleshooting Common Issues

### Issue: Authentication Token Expiry

**Solution**: Implement automatic token refresh

```javascript
class TokenManager {
  constructor() {
    this.token = null;
    this.refreshToken = null;
    this.expiresAt = null;
  }
  
  async ensureValidToken() {
    if (!this.token || Date.now() >= this.expiresAt) {
      await this.refreshAccessToken();
    }
    return this.token;
  }
  
  async refreshAccessToken() {
    const response = await fetch('https://i3x.cesmii.net/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: this.refreshToken })
    });
    
    const data = await response.json();
    this.token = data.access_token;
    this.expiresAt = Date.now() + (data.expires_in * 1000);
  }
}
```

### Issue: Rate Limiting

**Symptoms**: 429 Too Many Requests responses

**Solution**: Implement exponential backoff and respect retry-after headers

```javascript
const fetchWithBackoff = async (url, options, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    const response = await fetch(url, options);
    
    if (response.status !== 429) {
      return response;
    }
    
    const retryAfter = response.headers.get('Retry-After') || Math.pow(2, i);
    await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
  }
  
  throw new Error('Max retries exceeded');
};
```

### Issue: Large Data Set Handling

**Solution**: Use time-bounded queries and subscriptions for streaming

```javascript
// For historical data, use time-bounded queries
const getHistoryInChunks = async (token, elementId, startTime, endTime) => {
  const response = await fetch('https://i3x.cesmii.net/objects/history', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      elementId: elementId,
      startTime: startTime,
      endTime: endTime,
      maxDepth: 1
    })
  });

  return await response.json();
};

// For real-time streaming, use subscriptions
const streamObjectData = async (token, elementIds, callback) => {
  // Create subscription
  const createRes = await fetch('https://i3x.cesmii.net/subscriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({})
  });
  const { subscriptionId } = await createRes.json();

  // Register objects to monitor
  await fetch(`https://i3x.cesmii.net/subscriptions/${subscriptionId}/register`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ elementIds, maxDepth: 1 })
  });

  // Stream via SSE
  const eventSource = new EventSource(
    `https://i3x.cesmii.net/subscriptions/${subscriptionId}/stream`
  );
  eventSource.onmessage = (event) => callback(JSON.parse(event.data));

  return { subscriptionId, eventSource };
};
```

