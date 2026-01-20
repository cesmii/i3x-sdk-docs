# Documentation

## OpenAPI Specification Generation

### Using Flask-RESTX

```python
from flask_restx import Api, Resource, fields, Namespace

# Initialize API with Swagger documentation
api = Api(
    app,
    version='1.0.0',
    title='i3X API',
    description='Industrial Information Interface eXchange API',
    doc='/docs'
)

# Define namespaces for API organization
objects_ns = api.namespace('objects', description='Object operations')
namespaces_ns = api.namespace('namespaces', description='Namespace operations')
objecttypes_ns = api.namespace('objecttypes', description='ObjectType operations')
subscriptions_ns = api.namespace('subscriptions', description='Subscription operations')

# Define models
object_model = api.model('Object', {
    'elementId': fields.String(required=True, description='Unique object identifier'),
    'displayName': fields.String(required=True, description='Human-readable name'),
    'typeId': fields.String(description='ObjectType elementId'),
    'parentId': fields.String(description='Parent object elementId'),
    'isComposition': fields.Boolean(description='Has child objects'),
    'namespaceUri': fields.String(description='Namespace URI'),
    'relationships': fields.Raw(description='Related object references')
})

object_type_model = api.model('ObjectType', {
    'elementId': fields.String(required=True, description='Unique type identifier'),
    'displayName': fields.String(required=True, description='Human-readable name'),
    'namespaceUri': fields.String(description='Namespace URI'),
    'schema': fields.Raw(description='JSON Schema definition')
})

namespace_model = api.model('Namespace', {
    'uri': fields.String(required=True, description='Namespace URI'),
    'displayName': fields.String(required=True, description='Human-readable name')
})

value_response_model = api.model('ValueResponse', {
    'elementId': fields.String(description='Object identifier'),
    'value': fields.Raw(description='Current value'),
    'timestamp': fields.String(description='ISO 8601 timestamp'),
    'quality': fields.String(description='Quality indicator')
})

# Objects endpoints
@objects_ns.route('/')
class ObjectList(Resource):
    @objects_ns.doc('list_objects')
    @objects_ns.param('typeId', 'Filter by ObjectType elementId', type='string')
    @objects_ns.param('includeMetadata', 'Include full metadata', type='boolean')
    @objects_ns.marshal_list_with(object_model)
    def get(self):
        """List all objects (GET /objects)"""
        pass

@objects_ns.route('/list')
class ObjectsByIds(Resource):
    @objects_ns.doc('get_objects_by_ids')
    def post(self):
        """Get objects by elementId(s) (POST /objects/list)"""
        pass

@objects_ns.route('/value')
class ObjectValue(Resource):
    @objects_ns.doc('get_object_value')
    def post(self):
        """Get current values for object(s) (POST /objects/value)"""
        pass

@objects_ns.route('/history')
class ObjectHistory(Resource):
    @objects_ns.doc('get_object_history')
    def post(self):
        """Get historical values for object(s) (POST /objects/history)"""
        pass

@objects_ns.route('/related')
class ObjectRelated(Resource):
    @objects_ns.doc('get_related_objects')
    def post(self):
        """Get related objects (POST /objects/related)"""
        pass

# Namespaces endpoints
@namespaces_ns.route('/')
class NamespaceList(Resource):
    @namespaces_ns.doc('list_namespaces')
    @namespaces_ns.marshal_list_with(namespace_model)
    def get(self):
        """List all namespaces (GET /namespaces)"""
        pass

# ObjectTypes endpoints
@objecttypes_ns.route('/')
class ObjectTypeList(Resource):
    @objecttypes_ns.doc('list_object_types')
    @objecttypes_ns.param('namespaceUri', 'Filter by namespace URI', type='string')
    @objecttypes_ns.marshal_list_with(object_type_model)
    def get(self):
        """List all object types (GET /objecttypes)"""
        pass

@objecttypes_ns.route('/query')
class ObjectTypeQuery(Resource):
    @objecttypes_ns.doc('query_object_types')
    def post(self):
        """Query object types by elementId(s) (POST /objecttypes/query)"""
        pass
```

### Using APISpec

```python
from apispec import APISpec
from apispec.ext.marshmallow import MarshmallowPlugin
from apispec_webframeworks.flask import FlaskPlugin

# Create API spec
spec = APISpec(
    title="i3X API",
    version="1.0.0",
    openapi_version="3.0.2",
    info=dict(
        description="Industrial Information Interface eXchange API",
        contact=dict(
            email="rfc@cesmii.org"
        ),
        license=dict(
            name="BSD 3-Clause",
            url="https://opensource.org/licenses/BSD-3-Clause"
        )
    ),
    servers=[
        dict(
            url="https://api.example.com",
            description="Production server"
        ),
        dict(
            url="https://i3x.cesmii.net",
            description="Demo server"
        )
    ],
    plugins=[FlaskPlugin(), MarshmallowPlugin()],
)

# Add security scheme
spec.components.security_scheme(
    "bearerAuth",
    {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "JWT"
    }
)

# Add schemas
spec.components.schema("Object", schema=ObjectSchema)
spec.components.schema("ObjectType", schema=ObjectTypeSchema)
spec.components.schema("Namespace", schema=NamespaceSchema)
spec.components.schema("ValueResponse", schema=ValueResponseSchema)
spec.components.schema("HTTPValidationError", schema=HTTPValidationErrorSchema)

# Add paths
with app.test_request_context():
    spec.path(view=list_objects)
    spec.path(view=get_object_value)
    spec.path(view=list_namespaces)
    spec.path(view=list_object_types)

# Serve OpenAPI spec
@app.route('/openapi.json')
def openapi_spec():
    return jsonify(spec.to_dict())

# Serve Swagger UI
from flask_swagger_ui import get_swaggerui_blueprint

SWAGGER_URL = '/docs'
API_URL = '/openapi.json'

swaggerui_blueprint = get_swaggerui_blueprint(
    SWAGGER_URL,
    API_URL,
    config={
        'app_name': "i3X API",
        'deepLinking': True,
        'displayRequestDuration': True
    }
)

app.register_blueprint(swaggerui_blueprint, url_prefix=SWAGGER_URL)
```

### Manual OpenAPI Specification

```yaml
# openapi.yaml
openapi: 3.0.2
info:
  title: i3X API
  version: 1.0.0
  description: Industrial Information Interface eXchange
  contact:
    email: rfc@cesmii.org
  license:
    name: BSD 3-Clause
    url: https://opensource.org/licenses/BSD-3-Clause

servers:
  - url: https://api.example.com
    description: Production server
  - url: https://i3x.cesmii.net
    description: Demo server

paths:
  /namespaces:
    get:
      summary: List all namespaces
      operationId: listNamespaces
      tags:
        - Namespaces
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Namespace'
      security:
        - bearerAuth: []

  /objecttypes:
    get:
      summary: List all object types
      operationId: listObjectTypes
      tags:
        - ObjectTypes
      parameters:
        - name: namespaceUri
          in: query
          schema:
            type: string
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/ObjectType'
      security:
        - bearerAuth: []

  /objects:
    get:
      summary: List all objects
      operationId: listObjects
      tags:
        - Objects
      parameters:
        - name: typeId
          in: query
          schema:
            type: string
        - name: includeMetadata
          in: query
          schema:
            type: boolean
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Object'
      security:
        - bearerAuth: []

  /objects/value:
    post:
      summary: Get current values for object(s)
      operationId: getObjectValue
      tags:
        - Objects
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/GetObjectValueRequest'
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/ValueResponse'
        '422':
          description: Validation error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/HTTPValidationError'
      security:
        - bearerAuth: []

  /objects/history:
    post:
      summary: Get historical values for object(s)
      operationId: getObjectHistory
      tags:
        - Objects
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/GetObjectHistoryRequest'
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/ValueResponse'
      security:
        - bearerAuth: []

  /subscriptions:
    get:
      summary: List all subscriptions
      operationId: listSubscriptions
      tags:
        - Subscriptions
      responses:
        '200':
          description: Successful response
      security:
        - bearerAuth: []

    post:
      summary: Create a new subscription
      operationId: createSubscription
      tags:
        - Subscriptions
      responses:
        '201':
          description: Subscription created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CreateSubscriptionResponse'
      security:
        - bearerAuth: []

components:
  schemas:
    Namespace:
      type: object
      required:
        - uri
        - displayName
      properties:
        uri:
          type: string
          example: "urn:platform:namespace:production"
        displayName:
          type: string
          example: "Production Equipment"

    ObjectType:
      type: object
      required:
        - elementId
        - displayName
      properties:
        elementId:
          type: string
          example: "urn:platform:type:Equipment"
        displayName:
          type: string
          example: "Manufacturing Equipment"
        namespaceUri:
          type: string
        schema:
          type: object
          additionalProperties: true

    Object:
      type: object
      required:
        - elementId
        - displayName
      properties:
        elementId:
          type: string
          example: "urn:platform:object:12345"
        displayName:
          type: string
          example: "Packaging Line 1"
        typeId:
          type: string
        parentId:
          type: string
          nullable: true
        isComposition:
          type: boolean
        namespaceUri:
          type: string
        relationships:
          type: object
          nullable: true
          additionalProperties:
            type: array
            items:
              type: string

    GetObjectValueRequest:
      type: object
      properties:
        elementId:
          type: string
        elementIds:
          type: array
          items:
            type: string
        maxDepth:
          type: integer
          default: 1

    GetObjectHistoryRequest:
      type: object
      properties:
        elementId:
          type: string
        elementIds:
          type: array
          items:
            type: string
        startTime:
          type: string
          format: date-time
        endTime:
          type: string
          format: date-time
        maxDepth:
          type: integer
          default: 1

    ValueResponse:
      type: object
      properties:
        elementId:
          type: string
        value:
          nullable: true
        timestamp:
          type: string
          format: date-time
          nullable: true
        quality:
          type: string
          nullable: true

    CreateSubscriptionResponse:
      type: object
      properties:
        subscriptionId:
          type: string
        message:
          type: string

    HTTPValidationError:
      type: object
      properties:
        detail:
          type: array
          items:
            $ref: '#/components/schemas/ValidationError'

    ValidationError:
      type: object
      properties:
        loc:
          type: array
          items:
            type: string
        msg:
          type: string
        type:
          type: string

  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
```

## API Documentation Best Practices

### 1. Clear Descriptions

```python
@api.route('/objects/value')
class ObjectValue(Resource):
    @api.doc('get_object_value', description='''
        Retrieve current values for one or more objects.

        Use elementId for a single object or elementIds for multiple objects.
        The maxDepth parameter controls recursion for compositional hierarchies:
        - 0 = infinite recursion
        - 1 = no child recursion (default)
        - 2+ = limited depth

        Example:
            POST /objects/value
            {"elementId": "urn:platform:object:12345", "maxDepth": 1}
    ''')
    def post(self):
        """Get current values for object(s)"""
        pass
```

### 2. Request/Response Examples

```python
value_request_example = {
    "elementId": "urn:platform:object:12345",
    "maxDepth": 1
}

value_response_example = {
    "elementId": "urn:platform:object:12345",
    "value": 125.5,
    "timestamp": "2025-01-15T12:00:00Z",
    "quality": "Good"
}

history_request_example = {
    "elementIds": ["urn:platform:object:12345", "urn:platform:object:12346"],
    "startTime": "2025-01-15T00:00:00Z",
    "endTime": "2025-01-15T23:59:59Z",
    "maxDepth": 1
}

@api.expect(value_request_model, examples={
    'application/json': value_request_example
})
@api.marshal_with(value_response_model, examples={
    'application/json': value_response_example
})
def post(self):
    """Get object value"""
    pass
```

### 3. Error Documentation

```python
@api.response(400, 'Bad Request', error_model)
@api.response(401, 'Unauthorized', error_model)
@api.response(403, 'Forbidden', error_model)
@api.response(404, 'Not Found', error_model)
@api.response(422, 'Validation Error', validation_error_model, examples={
    'application/json': {
        'detail': [
            {
                'loc': ['body', 'elementId'],
                'msg': 'field required',
                'type': 'value_error.missing'
            }
        ]
    }
})
@api.response(429, 'Too Many Requests', error_model)
@api.response(500, 'Internal Server Error', error_model)
def post(self):
    """Get object value"""
    pass
```

## README Documentation

```markdown
# i3X API Implementation

## Overview

This is a server implementation of the i3X Industrial Information Interface eXchange API.

## Features

- RESTful API for manufacturing objects
- Namespace and ObjectType management
- Time-series data storage and retrieval (current values and history)
- Real-time subscriptions via Server-Sent Events
- JWT authentication
- Role-based access control
- Smart Manufacturing Profile support
- OpenAPI/Swagger documentation

## Quick Start

### Prerequisites

- Python 3.11+
- PostgreSQL 14+
- Redis 7+

### Installation

\`\`\`bash
# Clone repository
git clone https://github.com/your-org/i3x-api.git
cd i3x-api

# Install dependencies
pip install -r requirements.txt

# Set up database
createdb manufacturing
alembic upgrade head

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Run server
python app.py
\`\`\`

### Docker

\`\`\`bash
docker-compose up
\`\`\`

## API Documentation

Interactive API documentation is available at:
- Swagger UI: http://localhost:8000/docs
- OpenAPI Spec: http://localhost:8000/openapi.json

## Core Endpoints

- `GET /namespaces` - List all namespaces
- `GET /objecttypes` - List object type schemas
- `GET /objects` - List all objects
- `POST /objects/value` - Get current values
- `POST /objects/history` - Get historical values
- `POST /subscriptions` - Create real-time subscription

## Configuration

See [Configuration Guide](docs/configuration.md)

## Development

\`\`\`bash
# Run tests
pytest

# Run with auto-reload
FLASK_ENV=development python app.py

# Generate migrations
alembic revision --autogenerate -m "Description"
\`\`\`

## Deployment

See [Deployment Guide](docs/deployment.md)

## Contributing

See [Contributing Guidelines](CONTRIBUTING.md)

## License

BSD 3-Clause License
```

## Best Practices

1. **Keep documentation up-to-date** with code changes
2. **Provide examples** for all endpoints
3. **Document error responses** thoroughly
4. **Use semantic versioning** for API versions
5. **Generate documentation** automatically when possible
6. **Include changelog** for version updates
7. **Provide migration guides** for breaking changes
8. **Host interactive documentation** (Swagger UI)
9. **Document rate limits** and quotas
10. **Include authentication examples**
