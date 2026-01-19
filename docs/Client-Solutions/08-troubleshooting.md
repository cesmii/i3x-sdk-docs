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

**Solution**: Use streaming or pagination

```javascript
async function* streamEntityData(token, entityId) {
  let offset = 0;
  const pageSize = 100;
  
  while (true) {
    const response = await fetch(
      `https://i3x.cesmii.net/api/entities/${entityId}/data?limit=${pageSize}&offset=${offset}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    
    const data = await response.json();
    
    if (data.dataPoints.length === 0) break;
    
    yield* data.dataPoints;
    offset += pageSize;
  }
}

// Usage
for await (const dataPoint of streamEntityData(token, entityId)) {
  processDataPoint(dataPoint);
}
```

