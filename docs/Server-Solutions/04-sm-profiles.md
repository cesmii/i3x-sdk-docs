# Smart Manufacturing Profiles

## Overview

Smart Manufacturing (SM) Profiles are OPC UA Information Model type definitions that provide standardized descriptions of manufacturing entities. This section explains how to support SM Profiles in your i3X implementation.

## Mapping OPC UA Information Models

If your platform uses OPC UA Information Models or SM Profiles:

```python
class ProfileMapper:
    """Maps between your internal model and SM Profiles"""
    
    def map_to_api_entity(self, ua_node) -> Dict:
        """Convert OPC UA node to API entity"""
        return {
            'id': self._generate_entity_id(ua_node),
            'type': ua_node.browse_name.Name,
            'displayName': ua_node.display_name.Text,
            'namespace': ua_node.browse_name.NamespaceUri,
            'attributes': self._extract_attributes(ua_node),
            'dataPoints': self._extract_data_points(ua_node)
        }
    
    def _generate_entity_id(self, ua_node) -> str:
        """Generate unique entity ID from UA node"""
        return f"urn:ua:node:{ua_node.nodeid.to_string()}"
    
    def _extract_attributes(self, ua_node) -> Dict:
        """Extract static attributes from UA node"""
        attributes = {}
        
        # Extract standard attributes
        try:
            # Manufacturer
            manufacturer_node = ua_node.get_child(["0:Identification", "0:Manufacturer"])
            if manufacturer_node:
                attributes['manufacturer'] = manufacturer_node.get_value()
        except:
            pass
        
        try:
            # Model
            model_node = ua_node.get_child(["0:Identification", "0:Model"])
            if model_node:
                attributes['model'] = model_node.get_value()
        except:
            pass
        
        try:
            # Serial Number
            serial_node = ua_node.get_child(["0:Identification", "0:SerialNumber"])
            if serial_node:
                attributes['serialNumber'] = serial_node.get_value()
        except:
            pass
        
        return attributes
    
    def _extract_data_points(self, ua_node) -> List[Dict]:
        """Extract variable nodes as data points"""
        data_points = []
        
        # Iterate through child variable nodes
        for child in ua_node.get_children():
            if child.get_node_class() == NodeClass.Variable:
                data_point = {
                    'id': child.nodeid.to_string(),
                    'displayName': child.get_display_name().Text,
                    'dataType': self._map_datatype(child.get_data_type()),
                    'accessLevel': self._map_access_level(child.get_access_level()),
                }
                
                # Add unit if available
                try:
                    engineering_units = child.get_child(["0:EngineeringUnits"])
                    if engineering_units:
                        unit_info = engineering_units.get_value()
                        data_point['unit'] = unit_info.DisplayName.Text
                except:
                    pass
                
                data_points.append(data_point)
        
        return data_points
    
    def _map_datatype(self, ua_datatype) -> str:
        """Map OPC UA data type to API data type"""
        mapping = {
            'Boolean': 'Boolean',
            'SByte': 'Integer',
            'Byte': 'Integer',
            'Int16': 'Integer',
            'UInt16': 'Integer',
            'Int32': 'Integer',
            'UInt32': 'Integer',
            'Int64': 'Integer',
            'UInt64': 'Integer',
            'Float': 'Double',
            'Double': 'Double',
            'String': 'String',
            'DateTime': 'DateTime',
            'ByteString': 'ByteString'
        }
        return mapping.get(str(ua_datatype), 'String')
    
    def _map_access_level(self, ua_access_level) -> str:
        """Map OPC UA access level to API access level"""
        if ua_access_level & 0x03 == 0x03:
            return 'readwrite'
        elif ua_access_level & 0x01:
            return 'read'
        elif ua_access_level & 0x02:
            return 'write'
        return 'read'
```

## Supporting Multiple Namespaces

```python
@app.route('/api/v1/namespaces', methods=['GET'])
@require_auth
def list_namespaces():
    """List available namespaces"""
    namespaces = [
        {
            'uri': 'urn:platform:production',
            'name': 'Production Equipment',
            'description': 'Production line equipment and sensors',
            'version': '1.0',
            'publisher': 'Platform Vendor',
            'publishDate': '2024-01-01T00:00:00Z'
        },
        {
            'uri': 'urn:platform:quality',
            'name': 'Quality Management',
            'description': 'Quality control and inspection data',
            'version': '1.0',
            'publisher': 'Platform Vendor',
            'publishDate': '2024-01-01T00:00:00Z'
        }
    ]
    
    return jsonify({'namespaces': namespaces}), 200

@app.route('/api/v1/types', methods=['GET'])
@require_auth
def list_entity_types():
    """List available entity types"""
    namespace = request.args.get('namespace')
    
    types = [
        {
            'id': 'Equipment',
            'namespace': 'urn:platform:production',
            'displayName': 'Manufacturing Equipment',
            'description': 'Physical manufacturing equipment',
            'baseType': None,
            'attributes': [
                {'name': 'manufacturer', 'type': 'String', 'required': False},
                {'name': 'model', 'type': 'String', 'required': False},
                {'name': 'serialNumber', 'type': 'String', 'required': False}
            ],
            'dataPoints': [
                {
                    'name': 'status',
                    'dataType': 'String',
                    'enumValues': ['Running', 'Stopped', 'Maintenance']
                }
            ]
        },
        {
            'id': 'PackagingLine',
            'namespace': 'urn:platform:production',
            'displayName': 'Packaging Line',
            'description': 'High-speed packaging equipment',
            'baseType': 'Equipment',
            'attributes': [
                {'name': 'lineSpeed', 'type': 'Double', 'required': False},
                {'name': 'capacity', 'type': 'Integer', 'required': False}
            ]
        }
    ]
    
    if namespace:
        types = [t for t in types if t['namespace'] == namespace]
    
    return jsonify({'types': types}), 200

@app.route('/api/v1/types/<type_id>', methods=['GET'])
@require_auth
def get_entity_type(type_id: str):
    """Get details of a specific entity type"""
    namespace = request.args.get('namespace')
    
    # Find the type
    type_def = type_repository.get_type(type_id, namespace)
    
    if not type_def:
        return jsonify({'error': 'Type not found'}), 404
    
    return jsonify(type_def), 200
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

## Type Inheritance

Support type inheritance for SM Profiles:

```python
class TypeRegistry:
    """Registry for managing entity types with inheritance"""
    
    def __init__(self):
        self.types = {}
    
    def register_type(self, type_def: Dict):
        """Register a new type"""
        type_id = type_def['id']
        namespace = type_def.get('namespace')
        
        key = f"{namespace}:{type_id}" if namespace else type_id
        self.types[key] = type_def
    
    def get_type(self, type_id: str, namespace: str = None) -> Optional[Dict]:
        """Get a type definition"""
        key = f"{namespace}:{type_id}" if namespace else type_id
        return self.types.get(key)
    
    def get_effective_attributes(self, type_id: str, namespace: str = None) -> List[Dict]:
        """Get all attributes including inherited ones"""
        attributes = []
        
        type_def = self.get_type(type_id, namespace)
        if not type_def:
            return attributes
        
        # Get base type attributes first
        base_type = type_def.get('baseType')
        if base_type:
            base_namespace = type_def.get('namespace')
            attributes.extend(self.get_effective_attributes(base_type, base_namespace))
        
        # Add this type's attributes
        attributes.extend(type_def.get('attributes', []))
        
        return attributes
    
    def is_type_of(self, instance_type: str, check_type: str, namespace: str = None) -> bool:
        """Check if instance_type is a subtype of check_type"""
        if instance_type == check_type:
            return True
        
        type_def = self.get_type(instance_type, namespace)
        if not type_def:
            return False
        
        base_type = type_def.get('baseType')
        if base_type:
            return self.is_type_of(base_type, check_type, namespace)
        
        return False

type_registry = TypeRegistry()
```

## Instance Creation from Types

Create entity instances from SM Profile types:

```python
@app.route('/api/v1/entities/from-type', methods=['POST'])
@require_auth
@require_permission('entities', 'create')
def create_entity_from_type():
    """Create an entity instance from a type"""
    try:
        request_data = request.get_json()
        
        type_id = request_data.get('type')
        namespace = request_data.get('namespace')
        display_name = request_data.get('displayName')
        
        if not type_id or not display_name:
            return jsonify({'error': 'type and displayName required'}), 400
        
        # Get type definition
        type_def = type_registry.get_type(type_id, namespace)
        if not type_def:
            return jsonify({'error': 'Type not found'}), 404
        
        # Create instance with all inherited attributes
        attributes = {}
        for attr in type_registry.get_effective_attributes(type_id, namespace):
            if attr.get('required'):
                if attr['name'] not in request_data:
                    return jsonify({
                        'error': 'Validation failed',
                        'details': {attr['name']: 'Required attribute missing'}
                    }), 422
            
            if attr['name'] in request_data:
                attributes[attr['name']] = request_data[attr['name']]
        
        # Create entity
        entity = {
            'type': type_id,
            'namespace': namespace,
            'displayName': display_name,
            'attributes': attributes
        }
        
        created_entity = repo.create_entity(entity)
        
        return jsonify(created_entity), 201
        
    except Exception as e:
        return jsonify({'error': 'Failed to create entity', 'message': str(e)}), 500
```

## Best Practices

### 1. Namespace Versioning

Support multiple versions of the same namespace:

```python
def get_namespace_version(namespace_uri: str) -> str:
    """Extract version from namespace URI"""
    # Example: urn:platform:production:v1.0 -> v1.0
    parts = namespace_uri.split(':')
    if len(parts) > 3 and parts[-1].startswith('v'):
        return parts[-1]
    return '1.0'  # Default version
```

### 2. Type Validation

Validate entity instances against their types:

```python
def validate_entity_against_type(entity: Dict, type_def: Dict) -> List[str]:
    """Validate entity conforms to its type definition"""
    errors = []
    
    # Check required attributes
    for attr in type_def.get('attributes', []):
        if attr.get('required') and attr['name'] not in entity.get('attributes', {}):
            errors.append(f"Required attribute missing: {attr['name']}")
    
    # Check data types
    for attr_name, attr_value in entity.get('attributes', {}).items():
        attr_def = next((a for a in type_def.get('attributes', []) if a['name'] == attr_name), None)
        if attr_def:
            expected_type = attr_def['type']
            if not isinstance(attr_value, get_python_type(expected_type)):
                errors.append(f"Invalid type for {attr_name}: expected {expected_type}")
    
    return errors
```

### 3. Profile Discovery

Provide endpoints for discovering available profiles:

```python
@app.route('/api/v1/profiles', methods=['GET'])
@require_auth
def list_sm_profiles():
    """List available SM Profiles"""
    category = request.args.get('category')
    
    profiles = profile_repository.list_profiles(category=category)
    
    return jsonify({'profiles': profiles}), 200

@app.route('/api/v1/profiles/<profile_id>', methods=['GET'])
@require_auth
def get_sm_profile(profile_id: str):
    """Get details of a specific SM Profile"""
    profile = profile_repository.get_profile(profile_id)
    
    if not profile:
        return jsonify({'error': 'Profile not found'}), 404
    
    return jsonify(profile), 200
```

## Resources

- **OPC UA Cloud Library**: https://uacloudlibrary.opcfoundation.org
- **SM Profiles GitHub**: https://github.com/cesmii/SMProfiles
- **OPC UA Specification**: https://opcfoundation.org/developer-tools/specifications-unified-architecture
- **CESMII Profile Designer**: https://www.cesmii.org
