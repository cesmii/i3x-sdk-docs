# API Patterns and Usage

## API Patterns and Usage

### Common Operations

#### 1. Discovering Available Entities

Query the API to discover what manufacturing entities are available:

```javascript
const discoverEntities = async (token) => {
  const response = await fetch('https://i3x.cesmii.net/api/entities', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });
  
  return await response.json();
};
```

#### 2. Reading Entity Data

Retrieve current or historical data from manufacturing entities:

```javascript
const readEntityData = async (token, entityId, options = {}) => {
  const queryParams = new URLSearchParams({
    startTime: options.startTime || new Date(Date.now() - 3600000).toISOString(),
    endTime: options.endTime || new Date().toISOString(),
    ...options
  });
  
  const response = await fetch(
    `https://i3x.cesmii.net/api/entities/${entityId}/data?${queryParams}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    }
  );
  
  return await response.json();
};
```

#### 3. Querying with Filters

Apply filters to narrow down data retrieval:

```javascript
const queryWithFilter = async (token, filter) => {
  const response = await fetch('https://i3x.cesmii.net/api/query', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      filter: filter,
      limit: 100,
      offset: 0
    })
  });
  
  return await response.json();
};
```

#### 4. Subscribing to Real-time Updates

For applications requiring real-time data, establish subscriptions:

```javascript
// Example using WebSocket or Server-Sent Events
const subscribeToEntity = (token, entityId, callback) => {
  const ws = new WebSocket(`wss://i3x.cesmii.net/api/subscribe/${entityId}`);
  
  ws.onopen = () => {
    ws.send(JSON.stringify({
      type: 'auth',
      token: token
    }));
  };
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    callback(data);
  };
  
  return ws;
};
```

