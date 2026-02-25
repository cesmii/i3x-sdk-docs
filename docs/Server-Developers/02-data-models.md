# Data Models

## Object Instance Representation

Objects are serialized in JSON format following the i3X API structure. The `ObjectInstance` schema includes the full object with relationship metadata:

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

- **elementId** (string): Unique string identifier for the element
- **displayName** (string): Object name
- **typeId** (string): ElementId of the object type
- **isComposition** (boolean): Whether this element has child objects
- **namespaceUri** (string): Namespace URI

### Optional Fields

- **parentId** (string | null): ElementId of the parent object
- **relationships** (object | null): Relationships to other objects

## ObjectInstanceMinimal

A lightweight variant of `ObjectInstance` that excludes the `relationships` field. Returned by `GET /objects` and `GET /objects?includeMetadata=false`. Has the same required and optional fields as `ObjectInstance`, minus `relationships`.

```json
{
  "elementId": "urn:platform:object:12345",
  "displayName": "Packaging Line 1",
  "typeId": "urn:platform:type:Equipment",
  "parentId": "urn:platform:object:building-a",
  "isComposition": true,
  "namespaceUri": "urn:platform:namespace:production"
}
```

## ObjectType Representation

ObjectTypes define the schema for objects. All fields are required:

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

**Fields** (all required):
- **elementId** (string): Unique string identifier for the type
- **displayName** (string): Type name
- **namespaceUri** (string): Namespace URI
- **schema** (object): JSON Schema definition for this object type

## Namespace Representation

All fields are required:

```json
{
  "uri": "urn:platform:namespace:production",
  "displayName": "Production Equipment"
}
```

**Fields** (all required):
- **uri** (string): Namespace URI
- **displayName** (string): Namespace name

## RelationshipType Representation

All fields are required:

```json
{
  "elementId": "urn:platform:reltype:HasComponent",
  "displayName": "Has Component",
  "namespaceUri": "urn:platform:namespace:core",
  "reverseOf": "ComponentOf"
}
```

**Fields** (all required):
- **elementId** (string): Unique string identifier for the relationship type
- **displayName** (string): Relationship type name
- **namespaceUri** (string): Namespace URI
- **reverseOf** (string): Type name of the reverse relationship

### Supported Data Types

- **Boolean**: true/false values
- **Number**: numeric values
- **String**: Text values

Other data types remain under consideration, with constraints including what is supported by JSON Schema.

## Value Request/Response

### GetObjectValueRequest (POST /objects/value)

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
- **elementIds** (string[], required): Array of element IDs to query
- **maxDepth** (integer, default: 1, min: 0): Controls recursion depth. `0` = infinite (includes all HasComponent children recursively); `1` = no recursion (just the specified element)

### GetObjectHistoryRequest (POST /objects/history)

```json
{
  "elementIds": [
    "urn:platform:object:12345"
  ],
  "startTime": "2025-01-15T00:00:00Z",
  "endTime": "2025-01-15T23:59:59Z",
  "maxDepth": 1
}
```

**Parameters:**
- **elementIds** (string[], required): Array of element IDs to query
- **startTime** (string | null): RFC 3339 start time for filtering
- **endTime** (string | null): RFC 3339 end time for filtering
- **maxDepth** (integer, default: 1, min: 0): Controls recursion depth. `0` = infinite; `1` = no recursion

### Value Response

The value endpoints return an array of value objects in this shape:

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
- **timestamp** (string | null): When the value was recorded (RFC 3339)
- **quality** (string | null): Quality indicator

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

For a full list of Quality Codes and Meanings, refer to [https://reference.opcfoundation.org/Core/Part8/v104/docs/A.4.3.3](https://reference.opcfoundation.org/Core/Part8/v104/docs/A.4.3.3)

## Object List/Query Requests

### GetObjectsRequest (POST /objects/list)

Return one or more objects by elementId. Returns full `ObjectInstance` with metadata.

```json
{
  "elementIds": ["urn:platform:object:12345", "urn:platform:object:12346"],
  "includeMetadata": false
}
```

**Parameters:**
- **elementIds** (string[], required): Array of element IDs to query
- **includeMetadata** (boolean, default: false): Include full metadata in response

### GetObjectTypesRequest (POST /objecttypes/query)

Get the schema for one or more ObjectTypes by elementId.

```json
{
  "elementIds": ["urn:platform:type:Equipment"]
}
```

**Parameters:**
- **elementIds** (string[], required): Array of element IDs to query

### GetRelationshipTypesRequest (POST /relationshiptypes/query)

Get one or more RelationshipTypes by elementId.

```json
{
  "elementIds": ["urn:platform:reltype:HasComponent"]
}
```

**Parameters:**
- **elementIds** (string[], required): Array of element IDs to query

## Related Objects Request

### GetRelatedObjectsRequest (POST /objects/related)

```json
{
  "elementIds": ["urn:platform:object:12345"],
  "relationshiptype": "HasComponent",
  "includeMetadata": true
}
```

**Parameters:**
- **elementIds** (string[], required): Array of element IDs to query
- **relationshiptype** (string | null): Filter by relationship type
- **includeMetadata** (boolean, default: false): Include full metadata in response

## Subscription Models

### CreateSubscriptionRequest

Empty request body — no parameters required:

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

**Fields** (all required):
- **subscriptionId** (string): The new subscription ID
- **message** (string): Confirmation message

### GetSubscriptionsResponse

```json
{
  "subscriptionIds": [
    { "subscriptionId": 1, "created": "2025-01-15T10:00:00.000Z" },
    { "subscriptionId": 2, "created": "2025-01-15T11:00:00.000Z" }
  ]
}
```

**Fields** (all required):
- **subscriptionIds** (SubscriptionSummary[]): Array of active subscription summaries

### RegisterMonitoredItemsRequest

```json
{
  "elementIds": ["urn:platform:object:12345", "urn:platform:object:12346"],
  "maxDepth": 1
}
```

**Parameters:**
- **elementIds** (string[], required): Array of element IDs to monitor
- **maxDepth** (integer | null, default: 1): Recursion depth for compositional hierarchies

### SubscriptionSummary

```json
{
  "subscriptionId": 1,
  "created": "2025-01-15T10:00:00.000Z"
}
```

**Fields** (all required):
- **subscriptionId** (integer): Numeric subscription identifier
- **created** (string): RFC 3339 timestamp when the subscription was created
