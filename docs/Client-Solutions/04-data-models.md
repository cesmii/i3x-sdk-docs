# Data Model Understanding

## Data Model Understanding

### Entity Structure

Entities in the CM Information API typically follow this structure:

```json
{
  "id": "unique-entity-identifier",
  "type": "EntityType",
  "displayName": "Human Readable Name",
  "namespace": "urn:namespace:identifier",
  "attributes": {
    "attribute1": "value1",
    "attribute2": "value2"
  },
  "children": [],
  "metadata": {
    "created": "2025-01-15T00:00:00Z",
    "modified": "2025-01-15T00:00:00Z",
    "version": "1.0"
  }
}
```

### Time-Series Data Structure

Historical and real-time data follows a standard time-series format:

```json
{
  "entityId": "entity-identifier",
  "dataPoints": [
    {
      "timestamp": "2025-01-15T12:00:00Z",
      "value": 75.5,
      "quality": "Good",
      "source": "sensor-123"
    }
  ],
  "aggregation": "raw",
  "timeRange": {
    "start": "2025-01-15T00:00:00Z",
    "end": "2025-01-15T23:59:59Z"
  }
}
```

