# Best Practices for Client Development

## Best Practices for Client Development

### 1. Error Handling

Implement robust error handling for API calls:

```javascript
const safeApiCall = async (apiFunction, ...args) => {
  try {
    const response = await apiFunction(...args);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    
    // Implement retry logic for transient failures
    if (error.message.includes('503') || error.message.includes('timeout')) {
      // Retry with exponential backoff
      return retryWithBackoff(apiFunction, ...args);
    }
    
    throw error;
  }
};
```

### 2. Caching Strategy

Implement intelligent caching to reduce API load:

```javascript
class ApiCache {
  constructor(ttl = 60000) { // Default 1 minute TTL
    this.cache = new Map();
    this.ttl = ttl;
  }
  
  set(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }
  
  get(key) {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }
}
```

### 3. Rate Limiting Awareness

Respect API rate limits to ensure service availability:

```javascript
class RateLimiter {
  constructor(maxRequests = 100, windowMs = 60000) {
    this.requests = [];
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }
  
  async throttle() {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = this.windowMs - (now - oldestRequest);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.requests.push(now);
  }
}
```

### 4. Efficient Batch Data Retrieval

When retrieving data for multiple objects, use batch endpoints:

```javascript
// Batch retrieve values for multiple objects
const batchGetObjectValues = async (token, elementIds) => {
  const response = await fetch('https://i3x.cesmii.net/objects/value', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      elementIds: elementIds,
      maxDepth: 1
    })
  });

  return await response.json();
};

// Get objects filtered by type
const getObjectsByType = async (token, typeId) => {
  const response = await fetch(
    `https://i3x.cesmii.net/objects?typeId=${encodeURIComponent(typeId)}`,
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );

  return await response.json();
};
```

