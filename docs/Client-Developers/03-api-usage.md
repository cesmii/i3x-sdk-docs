# API Patterns and Usage

## API Patterns and Usage

### Common Operations

#### 1. Discovering Available Objects

Query the API to discover what manufacturing objects are available:

```javascript
const discoverObjects = async (token) => {
  const response = await fetch('https://i3x.cesmii.net/objects', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });

  return await response.json();
};
```

You can also explore available namespaces and object types:

```javascript
// Get all namespaces
const getNamespaces = async (token) => {
  const response = await fetch('https://i3x.cesmii.net/namespaces', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await response.json();
};

// Get all object types (optionally filtered by namespace)
const getObjectTypes = async (token, namespaceUri = null) => {
  const url = namespaceUri
    ? `https://i3x.cesmii.net/objecttypes?namespaceUri=${encodeURIComponent(namespaceUri)}`
    : 'https://i3x.cesmii.net/objecttypes';
  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await response.json();
};
```

#### 2. Reading Object Values

Retrieve current values from manufacturing objects using POST:

```javascript
const readObjectValue = async (token, elementId, maxDepth = 1) => {
  const response = await fetch('https://i3x.cesmii.net/objects/value', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      elementId: elementId,
      maxDepth: maxDepth  // 0 = infinite recursion, 1 = no child recursion
    })
  });

  return await response.json();
};

// Retrieve historical data
const readObjectHistory = async (token, elementId, options = {}) => {
  const response = await fetch('https://i3x.cesmii.net/objects/history', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      elementId: elementId,
      startTime: options.startTime || new Date(Date.now() - 3600000).toISOString(),
      endTime: options.endTime || new Date().toISOString(),
      maxDepth: options.maxDepth || 1
    })
  });

  return await response.json();
};
```

#### 3. Querying Multiple Objects

Retrieve multiple objects by their element IDs:

```javascript
const getObjectsByIds = async (token, elementIds) => {
  const response = await fetch('https://i3x.cesmii.net/objects/list', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      elementIds: elementIds
    })
  });

  return await response.json();
};

// Get related objects
const getRelatedObjects = async (token, elementId, relationshipType = null) => {
  const response = await fetch('https://i3x.cesmii.net/objects/related', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      elementId: elementId,
      relationshiptype: relationshipType,
      includeMetadata: true
    })
  });

  return await response.json();
};
```

#### 4. Subscribing to Real-time Updates

For applications requiring real-time data, use Server-Sent Events (SSE) subscriptions:

```javascript
// Create a subscription and stream updates
const subscribeToObjects = async (token, elementIds, callback) => {
  // Step 1: Create a subscription
  const createResponse = await fetch('https://i3x.cesmii.net/subscriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({})
  });

  const { subscriptionId } = await createResponse.json();

  // Step 2: Register objects to monitor
  await fetch(`https://i3x.cesmii.net/subscriptions/${subscriptionId}/register`, {
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

  // Step 3: Open SSE stream for real-time updates
  const eventSource = new EventSource(
    `https://i3x.cesmii.net/subscriptions/${subscriptionId}/stream`,
    { headers: { 'Authorization': `Bearer ${token}` } }
  );

  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    callback(data);
  };

  return { subscriptionId, eventSource };
};

// Alternative: Use sync endpoint for polling instead of streaming
const syncSubscription = async (token, subscriptionId) => {
  const response = await fetch(
    `https://i3x.cesmii.net/subscriptions/${subscriptionId}/sync`,
    {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );
  return await response.json();  // Returns and clears queued updates
};
```

