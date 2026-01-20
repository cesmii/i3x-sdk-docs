# Data Models

## Object Instance Representation

Objects should be serialized in JSON format following the i3X API structure:

```json
{
  "elementId": "urn:platform:object:12345",
  "displayName": "Packaging Line 1",
  "typeId": "urn:platform:type:Equipment",
  "parentId": "urn:platform:object:building-a",
  "isComposition": true,
  "namespaceUri": "urn:platform:namespace:production",
  "relationships": {
    "HasComponent": ["urn:platform:object:conveyor-1", "urn:platform:object:sealer-1"],
    "References": ["urn:platform:object:operator-station-1"]
  }
}
```

## Object Field Descriptions

### Required Fields

- **elementId** (string): Unique identifier for the object
- **displayName** (string): Human-readable name for the object

### Optional Fields

- **typeId** (string): ElementId of the ObjectType this object is an instance of
- **parentId** (string | null): ElementId of parent object in hierarchy
- **isComposition** (boolean): Whether this object has child objects
- **namespaceUri** (string): URI of the namespace this object belongs to
- **relationships** (object | null): Map of relationship type names to arrays of related elementIds

## ObjectType Representation

ObjectTypes define the schema for objects:

```json
{
  "elementId": "urn:platform:type:Equipment",
  "displayName": "Manufacturing Equipment",
  "namespaceUri": "urn:platform:namespace:production",
  "schema": {
    "type": "object",
    "properties": {
      "manufacturer": { "type": "string" },
      "model": { "type": "string" },
      "status": {
        "type": "string",
        "enum": ["Running", "Stopped", "Maintenance"]
      }
    }
  }
}
```

## Namespace Representation

```json
{
  "uri": "urn:platform:namespace:production",
  "displayName": "Production Equipment"
}
```

## RelationshipType Representation

```json
{
  "elementId": "urn:platform:reltype:HasComponent",
  "displayName": "Has Component",
  "namespaceUri": "urn:platform:namespace:core",
  "reverseOf": "ComponentOf"
}
```

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

## Value Request/Response

### GetObjectValueRequest (POST /objects/value)

```json
{
  "elementId": "urn:platform:object:12345",
  "maxDepth": 1
}
```

Or for multiple objects:

```json
{
  "elementIds": [
    "urn:platform:object:12345",
    "urn:platform:object:12346"
  ],
  "maxDepth": 1
}
```

**Parameters:**
- **elementId** (string | null): Single object to query
- **elementIds** (string[] | null): Multiple objects to query
- **maxDepth** (integer, default: 1): Recursion depth for compositional hierarchies (0 = infinite)

### GetObjectHistoryRequest (POST /objects/history)

```json
{
  "elementId": "urn:platform:object:12345",
  "startTime": "2025-01-15T00:00:00Z",
  "endTime": "2025-01-15T23:59:59Z",
  "maxDepth": 1
}
```

**Parameters:**
- **elementId** (string | null): Single object to query
- **elementIds** (string[] | null): Multiple objects to query
- **startTime** (string | null): ISO 8601 start of time range
- **endTime** (string | null): ISO 8601 end of time range
- **maxDepth** (integer, default: 1): Recursion depth

### Value Response

```json
{
  "elementId": "urn:platform:object:12345",
  "value": 125.5,
  "timestamp": "2025-01-15T12:00:00.000Z",
  "quality": "Good"
}
```

**Response Fields:**
- **elementId** (string): Object identifier
- **value** (any): The current or historical value
- **timestamp** (string | null): When the value was recorded (ISO 8601)
- **quality** (string | null): Quality indicator

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

All error responses should follow the HTTPValidationError structure:

```json
{
  "detail": [
    {
      "loc": ["body", "elementId"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

### ValidationError Fields

- **loc** (array): Location of the error (path to the field)
- **msg** (string): Human-readable error message
- **type** (string): Error type for programmatic handling

### Standard Error Codes

```
OBJECT_NOT_FOUND        - Requested object doesn't exist
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

## Related Objects Request

### GetRelatedObjectsRequest (POST /objects/related)

```json
{
  "elementId": "urn:platform:object:12345",
  "relationshiptype": "HasComponent",
  "includeMetadata": true
}
```

**Parameters:**
- **elementId** (string | null): Single object to query
- **elementIds** (string[] | null): Multiple objects to query
- **relationshiptype** (string | null): Filter by relationship type
- **includeMetadata** (boolean, default: false): Include full metadata

## Subscription Models

### CreateSubscriptionRequest

```json
{}
```

### CreateSubscriptionResponse

```json
{
  "subscriptionId": "sub-12345",
  "message": "Subscription created successfully"
}
```

### RegisterMonitoredItemsRequest

```json
{
  "elementIds": ["urn:platform:object:12345", "urn:platform:object:12346"],
  "maxDepth": 1
}
```

### SyncResponseItem

```json
{
  "elementId": "urn:platform:object:12345",
  "value": 125.5,
  "timestamp": "2025-01-15T12:00:00.000Z",
  "quality": "Good"
}
```

### SubscriptionSummary

```json
{
  "subscriptionId": 1,
  "created": "2025-01-15T10:00:00.000Z"
}
```
