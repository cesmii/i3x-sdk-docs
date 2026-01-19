# Performance Optimization

## Performance Optimization

### 1. Batch Requests

When possible, batch multiple operations:

```javascript
const batchReadEntities = async (token, entityIds) => {
  const response = await fetch('https://i3x.cesmii.net/api/batch/read', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ entityIds })
  });
  
  return await response.json();
};
```

### 2. Use Appropriate Aggregations

Request aggregated data when full resolution isn't needed:

```javascript
const getAggregatedData = async (token, entityId, aggregation = 'hourly') => {
  const response = await fetch(
    `https://i3x.cesmii.net/api/entities/${entityId}/data?aggregation=${aggregation}`,
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );
  
  return await response.json();
};
```

