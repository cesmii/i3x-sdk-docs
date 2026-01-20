# Core Concepts

## Core Concepts

### API Data Model

The i3X API is built around four primary concepts:

#### Namespaces
Namespaces provide organizational groupings for types and objects. Each namespace has:
- `uri`: A unique namespace URI identifier
- `displayName`: A human-readable name

#### ObjectTypes
ObjectTypes define the schema for objects. They are based on OPC UA Information Models and include:
- `elementId`: Unique type identifier
- `displayName`: Human-readable name
- `namespaceUri`: The namespace this type belongs to
- `schema`: JSON Schema definition describing the type's structure

#### Objects
Objects are instances of ObjectTypes representing actual manufacturing equipment, data points, or other elements:
- `elementId`: Unique object identifier
- `displayName`: Human-readable name
- `typeId`: The ObjectType this object is an instance of
- `parentId`: Parent object in the hierarchy (null for root objects)
- `isComposition`: Whether this object has child objects
- `namespaceUri`: The namespace this object belongs to
- `relationships`: References to related objects

#### RelationshipTypes
RelationshipTypes define how objects can be connected to each other:
- `elementId`: Unique relationship type identifier
- `displayName`: Human-readable name
- `reverseOf`: The name of the inverse relationship

### Smart Manufacturing Profiles (SM Profiles)

SM Profiles are OPC UA Information Model type definitions that describe:
- Equipment characteristics
- Identification metadata
- Runtime data structure
- Behavioral contracts

Applications interact with instances of these profiles (Objects) through the API, enabling semantic understanding of manufacturing data.

### Contextualized Data

The API provides access to data that has been:
- Properly structured according to information models
- Tagged with appropriate metadata
- Organized within hierarchical relationships
- Timestamped and quality-assured

