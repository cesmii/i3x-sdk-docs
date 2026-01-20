# Performance Optimization

## Performance Optimization

### 1. Batch Requests

When possible, batch multiple operations using array parameters:

```javascript
// Batch read current values for multiple objects
const batchReadObjects = async (token, elementIds) => {
  const response = await fetch('https://i3x.cesmii.net/objects/value', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      elementIds: elementIds,
      maxDepth: 1  // Control recursion depth
    })
  });

  return await response.json();
};

// Batch read object metadata
const batchGetObjects = async (token, elementIds) => {
  const response = await fetch('https://i3x.cesmii.net/objects/list', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ elementIds })
  });

  return await response.json();
};
```

### 2. Control Recursion Depth

Use the `maxDepth` parameter to limit data retrieval for compositional hierarchies:

```javascript
const getObjectWithChildren = async (token, elementId, depth = 1) => {
  const response = await fetch('https://i3x.cesmii.net/objects/value', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      elementId: elementId,
      maxDepth: depth  // 0 = infinite, 1 = no child recursion, 2+ = limited depth
    })
  });

  return await response.json();
};
```

### 3. Time-Bounded Historical Queries

When querying historical data, always specify time bounds to limit result size:

```javascript
const getHistoricalData = async (token, elementIds, startTime, endTime) => {
  const response = await fetch('https://i3x.cesmii.net/objects/history', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      elementIds: elementIds,
      startTime: startTime,  // ISO 8601 format
      endTime: endTime,
      maxDepth: 1
    })
  });

  return await response.json();
};
```

