# Smart Manufacturing Profiles

## Overview

Smart Manufacturing (SM) Profiles are OPC UA Information Model type definitions that provide standardized descriptions of manufacturing equipment and processes. In the i3X API, SM Profiles map to:

- **Namespaces**: Each SM Profile or OPC UA Nodeset corresponds to a Namespace identified by its URI
- **ObjectTypes**: Type definitions within a profile map to ObjectTypes with their schema definitions
- **Objects**: Instances of SM Profile types become Objects with elementIds

This section explains how to support SM Profiles in your i3X implementation.

## Mapping OPC UA Information Models

If your platform uses OPC UA Information Models or SM Profiles:

```python
class ProfileMapper:
    """Maps between OPC UA nodes and i3X API models"""

    def map_to_namespace(self, nodeset) -> Dict:
        """Convert OPC UA Nodeset to i3X Namespace"""
        return {
            'uri': nodeset.namespace_uri,
            'displayName': nodeset.model_name or nodeset.namespace_uri.split(':')[-1]
        }

    def map_to_object_type(self, ua_type_node) -> Dict:
        """Convert OPC UA ObjectType to i3X ObjectType"""
        return {
            'elementId': self._generate_element_id(ua_type_node),
            'displayName': ua_type_node.display_name.Text,
            'namespaceUri': ua_type_node.browse_name.NamespaceUri,
            'schema': self._build_json_schema(ua_type_node)
        }

    def map_to_object(self, ua_node) -> Dict:
        """Convert OPC UA Object instance to i3X Object"""
        return {
            'elementId': self._generate_element_id(ua_node),
            'displayName': ua_node.display_name.Text,
            'typeId': self._get_type_element_id(ua_node),
            'parentId': self._get_parent_element_id(ua_node),
            'isComposition': len(list(ua_node.get_children())) > 0,
            'namespaceUri': ua_node.browse_name.NamespaceUri,
            'relationships': self._extract_relationships(ua_node)
        }

    def _generate_element_id(self, ua_node) -> str:
        """Generate unique elementId from UA node"""
        return f"urn:ua:node:{ua_node.nodeid.to_string()}"
    
    def _build_json_schema(self, ua_type_node) -> Dict:
        """Build JSON Schema from OPC UA type definition"""
        schema = {
            'type': 'object',
            'properties': {}
        }

        # Extract properties from child variable nodes
        for child in ua_type_node.get_children():
            if child.get_node_class() == NodeClass.Variable:
                prop_name = child.browse_name.Name
                schema['properties'][prop_name] = {
                    'type': self._map_datatype_to_json(child.get_data_type())
                }

                # Add unit if available
                try:
                    engineering_units = child.get_child(["0:EngineeringUnits"])
                    if engineering_units:
                        unit_info = engineering_units.get_value()
                        schema['properties'][prop_name]['unit'] = unit_info.DisplayName.Text
                except:
                    pass

        return schema

    def _extract_relationships(self, ua_node) -> Dict:
        """Extract relationships from UA references"""
        relationships = {}

        for ref in ua_node.get_references():
            ref_type = ref.ReferenceTypeId.to_string()
            target_id = f"urn:ua:node:{ref.NodeId.to_string()}"

            if ref_type not in relationships:
                relationships[ref_type] = []
            relationships[ref_type].append(target_id)

        return relationships if relationships else None

    def _get_type_element_id(self, ua_node) -> str:
        """Get the type definition elementId for an instance"""
        type_def = ua_node.get_type_definition()
        return f"urn:ua:node:{type_def.to_string()}" if type_def else None

    def _get_parent_element_id(self, ua_node) -> str:
        """Get the parent elementId"""
        parent = ua_node.get_parent()
        return f"urn:ua:node:{parent.nodeid.to_string()}" if parent else None
    
    def _map_datatype_to_json(self, ua_datatype) -> str:
        """Map OPC UA data type to JSON Schema type"""
        mapping = {
            'Boolean': 'boolean',
            'SByte': 'integer',
            'Byte': 'integer',
            'Int16': 'integer',
            'UInt16': 'integer',
            'Int32': 'integer',
            'UInt32': 'integer',
            'Int64': 'integer',
            'UInt64': 'integer',
            'Float': 'number',
            'Double': 'number',
            'String': 'string',
            'DateTime': 'string',
            'ByteString': 'string'
        }
        return mapping.get(str(ua_datatype), 'string')
```

## Supporting Namespaces and ObjectTypes

```python
@app.route('/namespaces', methods=['GET'])
@require_auth
def list_namespaces():
    """List all available namespaces (GET /namespaces)"""
    namespaces = [
        {
            'uri': 'urn:platform:production',
            'displayName': 'Production Equipment'
        },
        {
            'uri': 'urn:platform:quality',
            'displayName': 'Quality Management'
        },
        {
            'uri': 'http://opcfoundation.org/UA/Machinery/',
            'displayName': 'OPC UA Machinery'
        }
    ]

    return jsonify(namespaces), 200

@app.route('/objecttypes', methods=['GET'])
@require_auth
def list_object_types():
    """List all object type schemas (GET /objecttypes)"""
    namespace_uri = request.args.get('namespaceUri')

    types = [
        {
            'elementId': 'urn:platform:type:Equipment',
            'displayName': 'Manufacturing Equipment',
            'namespaceUri': 'urn:platform:production',
            'schema': {
                'type': 'object',
                'properties': {
                    'manufacturer': {'type': 'string'},
                    'model': {'type': 'string'},
                    'serialNumber': {'type': 'string'},
                    'status': {
                        'type': 'string',
                        'enum': ['Running', 'Stopped', 'Maintenance']
                    }
                }
            }
        },
        {
            'elementId': 'urn:platform:type:PackagingLine',
            'displayName': 'Packaging Line',
            'namespaceUri': 'urn:platform:production',
            'schema': {
                'type': 'object',
                'properties': {
                    'lineSpeed': {'type': 'number'},
                    'capacity': {'type': 'integer'}
                }
            }
        }
    ]

    if namespace_uri:
        types = [t for t in types if t['namespaceUri'] == namespace_uri]

    return jsonify(types), 200

@app.route('/objecttypes/query', methods=['POST'])
@require_auth
def query_object_types():
    """Get object types by elementId (POST /objecttypes/query)"""
    data = request.get_json()
    element_id = data.get('elementId')
    element_ids = data.get('elementIds', [])

    if element_id:
        element_ids = [element_id]

    # Find matching types
    results = type_repository.get_types_by_ids(element_ids)

    return jsonify(results), 200
```

## SM Profile Cloud Library Integration

Integrate with the OPC UA Cloud Library to retrieve published SM Profiles:

```python
import requests

class CloudLibraryClient:
    """Client for OPC UA Cloud Library"""
    
    def __init__(self, base_url: str = "https://uacloudlibrary.opcfoundation.org"):
        self.base_url = base_url
    
    def get_nodeset(self, namespace_uri: str) -> Dict:
        """Retrieve a nodeset from the cloud library"""
        response = requests.get(
            f"{self.base_url}/api/nodesets",
            params={'namespaceUri': namespace_uri}
        )
        response.raise_for_status()
        return response.json()
    
    def download_nodeset_xml(self, nodeset_id: str) -> str:
        """Download nodeset XML file"""
        response = requests.get(
            f"{self.base_url}/api/nodesets/{nodeset_id}/download"
        )
        response.raise_for_status()
        return response.text
    
    def search_nodesets(self, query: str) -> List[Dict]:
        """Search for nodesets"""
        response = requests.get(
            f"{self.base_url}/api/nodesets/search",
            params={'query': query}
        )
        response.raise_for_status()
        return response.json()

cloud_library = CloudLibraryClient()

@app.route('/api/v1/profiles/import', methods=['POST'])
@require_auth
@require_permission('profiles', 'import')
def import_sm_profile():
    """Import an SM Profile from the Cloud Library"""
    try:
        request_data = request.get_json()
        namespace_uri = request_data.get('namespaceUri')
        
        if not namespace_uri:
            return jsonify({'error': 'namespaceUri required'}), 400
        
        # Get nodeset from cloud library
        nodeset = cloud_library.get_nodeset(namespace_uri)
        
        # Download and parse XML
        nodeset_xml = cloud_library.download_nodeset_xml(nodeset['id'])
        
        # Import into your platform
        imported = profile_importer.import_nodeset(nodeset_xml)
        
        return jsonify({
            'status': 'imported',
            'namespace': namespace_uri,
            'types': len(imported['types']),
            'instances': len(imported['instances'])
        }), 201
        
    except Exception as e:
        return jsonify({'error': 'Import failed', 'message': str(e)}), 500
```

## Type Registry and Inheritance

Support type inheritance for SM Profiles:

```python
class ObjectTypeRegistry:
    """Registry for managing ObjectTypes with inheritance"""

    def __init__(self):
        self.types = {}  # elementId -> type definition

    def register_type(self, type_def: Dict):
        """Register a new ObjectType"""
        element_id = type_def['elementId']
        self.types[element_id] = type_def

    def get_type(self, element_id: str) -> Optional[Dict]:
        """Get an ObjectType by elementId"""
        return self.types.get(element_id)

    def get_types_by_namespace(self, namespace_uri: str) -> List[Dict]:
        """Get all ObjectTypes in a namespace"""
        return [t for t in self.types.values() if t.get('namespaceUri') == namespace_uri]

    def get_types_by_ids(self, element_ids: List[str]) -> List[Dict]:
        """Get ObjectTypes by elementIds"""
        return [self.types[eid] for eid in element_ids if eid in self.types]

    def get_merged_schema(self, element_id: str) -> Dict:
        """Get merged JSON schema including inherited properties"""
        type_def = self.get_type(element_id)
        if not type_def:
            return {}

        schema = {'type': 'object', 'properties': {}}

        # Get base type schema first (if type inheritance is supported)
        base_type_id = type_def.get('baseTypeId')
        if base_type_id:
            base_schema = self.get_merged_schema(base_type_id)
            schema['properties'].update(base_schema.get('properties', {}))

        # Add this type's properties
        schema['properties'].update(type_def.get('schema', {}).get('properties', {}))

        return schema

type_registry = ObjectTypeRegistry()
```

## Creating Objects from ObjectTypes

Create Object instances from SM Profile ObjectTypes:

```python
@app.route('/objects/from-type', methods=['POST'])
@require_auth
@require_permission('objects', 'create')
def create_object_from_type():
    """Create an Object instance from an ObjectType"""
    try:
        request_data = request.get_json()

        type_id = request_data.get('typeId')
        display_name = request_data.get('displayName')
        parent_id = request_data.get('parentId')

        if not type_id or not display_name:
            return jsonify({
                'detail': [{'loc': ['body'], 'msg': 'typeId and displayName required', 'type': 'value_error'}]
            }), 422

        # Get ObjectType definition
        type_def = type_registry.get_type(type_id)
        if not type_def:
            return jsonify({
                'detail': [{'loc': ['body', 'typeId'], 'msg': 'ObjectType not found', 'type': 'not_found'}]
            }), 404

        # Generate elementId for new object
        element_id = f"urn:platform:object:{uuid.uuid4()}"

        # Create Object instance
        obj = {
            'elementId': element_id,
            'displayName': display_name,
            'typeId': type_id,
            'parentId': parent_id,
            'isComposition': False,
            'namespaceUri': type_def.get('namespaceUri'),
            'relationships': None
        }

        created_object = object_repository.create_object(obj)

        return jsonify(created_object), 201

    except Exception as e:
        return jsonify({
            'detail': [{'msg': f'Failed to create object: {str(e)}', 'type': 'server_error'}]
        }), 500
```

## Best Practices

### 1. Namespace URI Conventions

Follow OPC UA namespace URI conventions:

```python
def validate_namespace_uri(uri: str) -> bool:
    """Validate namespace URI format"""
    # OPC UA namespaces typically use http:// or urn: schemes
    valid_schemes = ['http://', 'https://', 'urn:']
    return any(uri.startswith(scheme) for scheme in valid_schemes)

def get_namespace_version(namespace_uri: str) -> str:
    """Extract version from namespace URI"""
    # Example: http://opcfoundation.org/UA/Machinery/1.0.0 -> 1.0.0
    import re
    match = re.search(r'/(\d+\.\d+(\.\d+)?)', namespace_uri)
    return match.group(1) if match else '1.0'
```

### 2. Schema Validation

Validate Object values against their ObjectType schema:

```python
import jsonschema

def validate_object_against_type(obj_value: any, type_def: Dict) -> List[str]:
    """Validate object value conforms to its ObjectType schema"""
    errors = []

    schema = type_def.get('schema', {})
    if not schema:
        return errors

    try:
        jsonschema.validate(instance=obj_value, schema=schema)
    except jsonschema.ValidationError as e:
        errors.append(f"Schema validation failed: {e.message}")
    except jsonschema.SchemaError as e:
        errors.append(f"Invalid schema: {e.message}")

    return errors
```

### 3. RelationshipType Discovery

Expose relationship types from OPC UA reference types:

```python
@app.route('/relationshiptypes', methods=['GET'])
@require_auth
def list_relationship_types():
    """List all relationship types (GET /relationshiptypes)"""
    namespace_uri = request.args.get('namespaceUri')

    rel_types = [
        {
            'elementId': 'urn:opcua:reftype:HasComponent',
            'displayName': 'Has Component',
            'namespaceUri': 'http://opcfoundation.org/UA/',
            'reverseOf': 'ComponentOf'
        },
        {
            'elementId': 'urn:opcua:reftype:HasProperty',
            'displayName': 'Has Property',
            'namespaceUri': 'http://opcfoundation.org/UA/',
            'reverseOf': 'PropertyOf'
        },
        {
            'elementId': 'urn:opcua:reftype:Organizes',
            'displayName': 'Organizes',
            'namespaceUri': 'http://opcfoundation.org/UA/',
            'reverseOf': 'OrganizedBy'
        }
    ]

    if namespace_uri:
        rel_types = [r for r in rel_types if r['namespaceUri'] == namespace_uri]

    return jsonify(rel_types), 200

@app.route('/relationshiptypes/query', methods=['POST'])
@require_auth
def query_relationship_types():
    """Query relationship types by elementId (POST /relationshiptypes/query)"""
    data = request.get_json()
    element_id = data.get('elementId')
    element_ids = data.get('elementIds', [])

    if element_id:
        element_ids = [element_id]

    results = relationship_type_repository.get_by_ids(element_ids)
    return jsonify(results), 200
```

## Resources

- **OPC UA Cloud Library**: https://uacloudlibrary.opcfoundation.org
- **SM Profiles GitHub**: https://github.com/cesmii/SMProfiles
- **OPC UA Specification**: https://opcfoundation.org/developer-tools/specifications-unified-architecture
- **CESMII Profile Designer**: https://www.cesmii.org
