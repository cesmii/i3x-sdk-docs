# Data Model Understanding

## Data Model Understanding

### Object Instance Structure

Objects in the i3X API follow this structure:

```json
{
  "elementId": "unique-object-identifier",
  "displayName": "Human Readable Name",
  "typeId": "object-type-element-id",
  "parentId": "parent-object-id-or-null",
  "isComposition": true,
  "namespaceUri": "urn:namespace:identifier",
  "relationships": {
    "HasComponent": ["child-element-id-1", "child-element-id-2"],
    "References": ["related-element-id"]
  }
}
```

### ObjectType Structure

ObjectTypes define the schema for objects:

```json
{
  "elementId": "type-element-id",
  "displayName": "Type Name",
  "namespaceUri": "urn:namespace:identifier",
  "schema": {
    "type": "object",
    "properties": {
      "attribute1": { "type": "string" },
      "attribute2": { "type": "number" }
    }
  }
}
```

### Value Response Structure

Current and historical values follow this format:

```json
{
  "elementId": "object-identifier",
  "value": 75.5,
  "timestamp": "2025-01-15T12:00:00Z",
  "quality": "Good"
}
```

