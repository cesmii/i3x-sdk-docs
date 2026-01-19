# Data Models

## Entity Representation

Entities should be serialized in JSON format following this structure:

```json
{
  "id": "urn:platform:entity:12345",
  "type": "Equipment",
  "displayName": "Packaging Line 1",
  "namespace": "urn:platform:namespace:production",
  "description": "High-speed packaging line for consumer goods",
  "attributes": {
    "manufacturer": "ACME Corp",
    "model": "PL-5000",
    "serialNumber": "SN-2023-001",
    "installDate": "2023-01-15T00:00:00Z",
    "location": "Building A, Floor 2"
  },
  "dataPoints": [
    {
      "id": "speed",
      "displayName": "Line Speed",
      "dataType": "Double",
      "unit": "items/min",
      "accessLevel": "read"
    },
    {
      "id": "status",
      "displayName": "Operational Status",
      "dataType": "String",
      "enumValues": ["Running", "Stopped", "Maintenance"],
      "accessLevel": "read"
    }
  ],
  "parentId": "urn:platform:entity:building-a",
  "children": [
    "urn:platform:entity:conveyor-1",
    "urn:platform:entity:sealer-1"
  ],
  "metadata": {
    "created": "2023-01-15T00:00:00Z",
    "modified": "2025-01-15T10:30:00Z",
    "version": "2.1",
    "tags": ["production", "packaging", "critical"]
  },
  "links": {
    "self": "/api/v1/entities/urn:platform:entity:12345",
    "data": "/api/v1/entities/urn:platform:entity:12345/data",
    "children": "/api/v1/entities/urn:platform:entity:12345/children"
  }
}
```

## Entity Field Descriptions

### Required Fields

- **id** (string): Unique identifier for the entity. Should be a URN or UUID.
- **type** (string): Entity type (e.g., "Equipment", "Process", "Line", "Machine")
- **displayName** (string): Human-readable name for the entity

### Optional Fields

- **namespace** (string): URN identifying the namespace/information model
- **description** (string): Detailed description of the entity
- **attributes** (object): Static attributes as key-value pairs
- **dataPoints** (array): Available data points/variables for time-series data
- **parentId** (string): ID of parent entity in hierarchy
- **children** (array): IDs of child entities
- **metadata** (object): System metadata (created, modified, version, tags)
- **links** (object): HATEOAS links to related resources

## Data Point Definition

Each data point in the `dataPoints` array should include:

```json
{
  "id": "speed",
  "displayName": "Line Speed",
  "dataType": "Double",
  "unit": "items/min",
  "accessLevel": "read",
  "minValue": 0,
  "maxValue": 200,
  "enumValues": null,
  "description": "Current operating speed of the packaging line"
}
```

### Data Point Fields

- **id** (string, required): Unique identifier within the entity
- **displayName** (string, required): Human-readable name
- **dataType** (string, required): Data type (see Supported Data Types)
- **unit** (string, optional): Unit of measurement
- **accessLevel** (string, required): Access level ("read", "write", "readwrite")
- **minValue** (number, optional): Minimum valid value
- **maxValue** (number, optional): Maximum valid value
- **enumValues** (array, optional): Valid values for enumerated types
- **description** (string, optional): Detailed description

### Supported Data Types

- **Boolean**: true/false values
- **Integer**: Whole numbers
- **Double**: Floating-point numbers
- **String**: Text values
- **DateTime**: ISO 8601 timestamps
- **Byte**: 8-bit unsigned integer
- **Int16**: 16-bit signed integer
- **Int32**: 32-bit signed integer
- **Int64**: 64-bit signed integer
- **Float**: Single-precision floating point
- **ByteString**: Binary data as base64

## Time-Series Data Representation

```json
{
  "entityId": "urn:platform:entity:12345",
  "dataPointId": "speed",
  "timeRange": {
    "start": "2025-01-15T00:00:00Z",
    "end": "2025-01-15T23:59:59Z"
  },
  "aggregation": {
    "method": "none",
    "interval": null
  },
  "dataPoints": [
    {
      "timestamp": "2025-01-15T12:00:00.000Z",
      "value": 125.5,
      "quality": "Good",
      "source": "PLC-01"
    },
    {
      "timestamp": "2025-01-15T12:01:00.000Z",
      "value": 127.2,
      "quality": "Good",
      "source": "PLC-01"
    }
  ],
  "statistics": {
    "count": 1440,
    "min": 100.0,
    "max": 150.0,
    "avg": 125.8,
    "stdDev": 12.3
  },
  "pagination": {
    "limit": 100,
    "offset": 0,
    "total": 1440,
    "hasMore": true
  }
}
```

## Time-Series Data Fields

### Request Parameters

When querying time-series data, support these parameters:

- **startTime** (ISO 8601): Beginning of time range
- **endTime** (ISO 8601): End of time range
- **dataPoint** (string): Specific data point ID (optional, omit for all)
- **aggregation** (string): Aggregation method ("none", "avg", "min", "max", "sum", "count")
- **interval** (integer): Aggregation interval in seconds
- **limit** (integer): Maximum number of data points to return
- **offset** (integer): Offset for pagination

### Response Fields

- **entityId** (string): Entity identifier
- **dataPointId** (string): Data point identifier
- **timeRange** (object): Actual time range of returned data
- **aggregation** (object): Aggregation settings used
- **dataPoints** (array): Array of time-series data points
- **statistics** (object): Statistical summary of the data
- **pagination** (object): Pagination information

### Data Point Structure

Each item in the `dataPoints` array:

```json
{
  "timestamp": "2025-01-15T12:00:00.000Z",
  "value": 125.5,
  "quality": "Good",
  "source": "PLC-01",
  "statusCode": null
}
```

- **timestamp** (ISO 8601, required): When the value was recorded
- **value** (any, required): The actual value
- **quality** (string, required): Quality indicator (see Data Quality)
- **source** (string, optional): Source of the data (e.g., device ID)
- **statusCode** (integer, optional): Additional status information

## Data Quality Indicators

Implement standard quality codes:

```javascript
const DataQuality = {
  GOOD: 'Good',              // Value is reliable
  BAD: 'Bad',                // Value is unreliable
  UNCERTAIN: 'Uncertain',    // Value may be unreliable
  NOT_CONNECTED: 'NotConnected',  // Source not connected
  STALE: 'Stale',           // Value hasn't updated recently
  CALCULATED: 'Calculated',  // Derived/calculated value
  MANUALLY_ENTERED: 'ManuallyEntered'
};
```

### Quality Code Meanings

- **Good**: The value is accurate and from a reliable source
- **Bad**: The value should not be trusted (sensor failure, communication error)
- **Uncertain**: The value may be inaccurate (out-of-range, sensor degradation)
- **NotConnected**: The data source is not connected
- **Stale**: The value hasn't been updated within expected timeframe
- **Calculated**: Value was computed from other values
- **ManuallyEntered**: Value was entered by a user, not measured

## Aggregation Methods

Support these aggregation methods:

- **none**: Raw data points (no aggregation)
- **avg**: Average value over interval
- **min**: Minimum value over interval
- **max**: Maximum value over interval
- **sum**: Sum of values over interval
- **count**: Number of data points in interval
- **first**: First value in interval
- **last**: Last value in interval
- **range**: Difference between min and max
- **stddev**: Standard deviation over interval

## Error Response Format

All error responses should follow this structure:

```json
{
  "error": "Entity not found",
  "message": "No entity exists with ID: urn:platform:entity:99999",
  "code": "ENTITY_NOT_FOUND",
  "timestamp": "2025-01-15T12:00:00Z",
  "path": "/api/v1/entities/urn:platform:entity:99999",
  "details": {
    "requestedId": "urn:platform:entity:99999"
  }
}
```

### Error Response Fields

- **error** (string, required): Short error description
- **message** (string, required): Detailed error message
- **code** (string, optional): Error code for programmatic handling
- **timestamp** (ISO 8601, required): When the error occurred
- **path** (string, required): Request path that caused the error
- **details** (object, optional): Additional error context

### Standard Error Codes

```
ENTITY_NOT_FOUND        - Requested entity doesn't exist
INVALID_PARAMETER       - Parameter validation failed
UNAUTHORIZED            - Authentication required
FORBIDDEN               - Insufficient permissions
RATE_LIMIT_EXCEEDED     - Too many requests
INTERNAL_ERROR          - Unexpected server error
SERVICE_UNAVAILABLE     - Service temporarily unavailable
INVALID_TIME_RANGE      - Invalid start/end time
DATA_NOT_AVAILABLE      - No data in requested range
VALIDATION_ERROR        - Request validation failed
```

## Pagination Metadata

Include pagination information in list responses:

```json
{
  "items": [...],
  "pagination": {
    "limit": 100,
    "offset": 0,
    "total": 1440,
    "hasMore": true,
    "nextOffset": 100,
    "prevOffset": null
  },
  "links": {
    "first": "/api/v1/entities?limit=100&offset=0",
    "next": "/api/v1/entities?limit=100&offset=100",
    "prev": null,
    "last": "/api/v1/entities?limit=100&offset=1400"
  }
}
```

## Namespace Definition

```json
{
  "uri": "urn:platform:namespace:production",
  "name": "Production Equipment",
  "description": "Production line equipment and sensors",
  "version": "1.0",
  "publisher": "ACME Manufacturing",
  "publishDate": "2024-01-15T00:00:00Z",
  "types": [
    {
      "name": "PackagingLine",
      "baseType": "Equipment",
      "description": "High-speed packaging equipment"
    }
  ]
}
```

## Entity Type Definition

```json
{
  "id": "Equipment",
  "namespace": "urn:platform:namespace:production",
  "displayName": "Manufacturing Equipment",
  "description": "Physical manufacturing equipment",
  "baseType": null,
  "attributes": [
    {
      "name": "manufacturer",
      "dataType": "String",
      "required": false
    },
    {
      "name": "model",
      "dataType": "String",
      "required": false
    }
  ],
  "dataPoints": [
    {
      "name": "status",
      "dataType": "String",
      "enumValues": ["Running", "Stopped", "Maintenance"]
    }
  ]
}
```

## Batch Operation Format

For batch operations (creating/updating multiple entities):

```json
{
  "operations": [
    {
      "method": "POST",
      "path": "/entities",
      "body": {
        "type": "Equipment",
        "displayName": "New Equipment 1"
      }
    },
    {
      "method": "PUT",
      "path": "/entities/urn:platform:entity:12345",
      "body": {
        "displayName": "Updated Name"
      }
    }
  ]
}
```

Response:

```json
{
  "results": [
    {
      "status": 201,
      "body": {
        "id": "urn:platform:entity:new-1",
        "type": "Equipment",
        "displayName": "New Equipment 1"
      }
    },
    {
      "status": 200,
      "body": {
        "id": "urn:platform:entity:12345",
        "displayName": "Updated Name"
      }
    }
  ]
}
```
