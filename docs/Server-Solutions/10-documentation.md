# Documentation

## OpenAPI Specification Generation

### Using Flask-RESTX

```python
from flask_restx import Api, Resource, fields, Namespace

# Initialize API with Swagger documentation
api = Api(
    app,
    version='1.0.0',
    title='CM Information API',
    description='Contextualized Manufacturing Information API',
    doc='/docs',
    prefix='/api/v1'
)

# Define namespaces
entities_ns = api.namespace('entities', description='Entity operations')

# Define models
entity_model = api.model('Entity', {
    'id': fields.String(description='Unique entity identifier'),
    'type': fields.String(required=True, description='Entity type'),
    'displayName': fields.String(required=True, description='Human-readable name'),
    'namespace': fields.String(description='Namespace URI'),
    'attributes': fields.Raw(description='Entity attributes'),
    'metadata': fields.Raw(description='System metadata')
})

# Define endpoints with documentation
@entities_ns.route('/')
class EntityList(Resource):
    @entities_ns.doc('list_entities')
    @entities_ns.param('limit', 'Maximum number of results', type='integer', default=100)
    @entities_ns.param('offset', 'Offset for pagination', type='integer', default=0)
    @entities_ns.param('type', 'Filter by entity type', type='string')
    @entities_ns.marshal_list_with(entity_model)
    def get(self):
        """List all entities"""
        pass
    
    @entities_ns.doc('create_entity')
    @entities_ns.expect(entity_model)
    @entities_ns.marshal_with(entity_model, code=201)
    def post(self):
        """Create a new entity"""
        pass

@entities_ns.route('/<string:entity_id>')
class Entity(Resource):
    @entities_ns.doc('get_entity')
    @entities_ns.marshal_with(entity_model)
    @entities_ns.response(404, 'Entity not found')
    def get(self, entity_id):
        """Get a specific entity"""
        pass
    
    @entities_ns.doc('update_entity')
    @entities_ns.expect(entity_model)
    @entities_ns.marshal_with(entity_model)
    def put(self, entity_id):
        """Update an entity"""
        pass
    
    @entities_ns.doc('delete_entity')
    @entities_ns.response(204, 'Entity deleted')
    def delete(self, entity_id):
        """Delete an entity"""
        pass
```

### Using APISpec

```python
from apispec import APISpec
from apispec.ext.marshmallow import MarshmallowPlugin
from apispec_webframeworks.flask import FlaskPlugin

# Create API spec
spec = APISpec(
    title="CM Information API",
    version="1.0.0",
    openapi_version="3.0.2",
    info=dict(
        description="Contextualized Manufacturing Information API",
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
            url="https://api.example.com/api/v1",
            description="Production server"
        ),
        dict(
            url="https://i3x.cesmii.net/api/v1",
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
spec.components.schema("Entity", schema=EntitySchema)
spec.components.schema("Error", schema=ErrorSchema)

# Add paths
with app.test_request_context():
    spec.path(view=list_entities)
    spec.path(view=get_entity)
    spec.path(view=create_entity)

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
        'app_name': "CM Information API",
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
  title: CM Information API
  version: 1.0.0
  description: Contextualized Manufacturing Information API
  contact:
    email: rfc@cesmii.org
  license:
    name: BSD 3-Clause
    url: https://opensource.org/licenses/BSD-3-Clause

servers:
  - url: https://api.example.com/api/v1
    description: Production server
  - url: https://i3x.cesmii.net/api/v1
    description: Demo server

paths:
  /entities:
    get:
      summary: List all entities
      operationId: listEntities
      tags:
        - Entities
      parameters:
        - name: limit
          in: query
          schema:
            type: integer
            default: 100
            maximum: 1000
        - name: offset
          in: query
          schema:
            type: integer
            default: 0
        - name: type
          in: query
          schema:
            type: string
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                type: object
                properties:
                  items:
                    type: array
                    items:
                      $ref: '#/components/schemas/Entity'
                  pagination:
                    $ref: '#/components/schemas/Pagination'
      security:
        - bearerAuth: []
    
    post:
      summary: Create a new entity
      operationId: createEntity
      tags:
        - Entities
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/EntityCreate'
      responses:
        '201':
          description: Entity created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Entity'
        '422':
          description: Validation error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
      security:
        - bearerAuth: []

components:
  schemas:
    Entity:
      type: object
      required:
        - id
        - type
        - displayName
      properties:
        id:
          type: string
          example: "urn:platform:entity:12345"
        type:
          type: string
          example: "Equipment"
        displayName:
          type: string
          example: "Packaging Line 1"
        namespace:
          type: string
          example: "urn:platform:namespace:production"
        description:
          type: string
        attributes:
          type: object
          additionalProperties: true
        metadata:
          $ref: '#/components/schemas/Metadata'
    
    Pagination:
      type: object
      properties:
        limit:
          type: integer
        offset:
          type: integer
        total:
          type: integer
        hasMore:
          type: boolean
    
    Error:
      type: object
      required:
        - error
        - message
      properties:
        error:
          type: string
        message:
          type: string
        code:
          type: string
        timestamp:
          type: string
          format: date-time
        path:
          type: string
        details:
          type: object
  
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
```

## API Documentation Best Practices

### 1. Clear Descriptions

```python
@api.route('/entities/<entity_id>/data')
class EntityData(Resource):
    @api.doc('get_entity_data', description='''
        Retrieve time-series data for a specific entity.
        
        This endpoint returns historical data points within the specified time range.
        The data can be aggregated using various methods (avg, min, max, sum, count).
        
        Example:
            GET /entities/123/data?startTime=2025-01-01T00:00:00Z&aggregation=avg&interval=3600
    ''')
    @api.param('startTime', 'Start of time range (ISO 8601)', required=True)
    @api.param('endTime', 'End of time range (ISO 8601)')
    @api.param('aggregation', 'Aggregation method', enum=['none', 'avg', 'min', 'max', 'sum', 'count'])
    @api.param('interval', 'Aggregation interval in seconds', type='integer')
    def get(self, entity_id):
        """Get time-series data"""
        pass
```

### 2. Request/Response Examples

```python
entity_create_example = {
    "type": "Equipment",
    "displayName": "Packaging Line 1",
    "namespace": "urn:platform:namespace:production",
    "attributes": {
        "manufacturer": "ACME Corp",
        "model": "PL-5000",
        "serialNumber": "SN-2023-001"
    }
}

entity_response_example = {
    "id": "urn:platform:entity:12345",
    **entity_create_example,
    "metadata": {
        "created": "2025-01-15T10:00:00Z",
        "modified": "2025-01-15T10:00:00Z",
        "version": "1.0"
    }
}

@api.expect(entity_model, code=201, examples={
    'application/json': entity_create_example
})
@api.marshal_with(entity_model, code=201, examples={
    'application/json': entity_response_example
})
def post(self):
    """Create entity"""
    pass
```

### 3. Error Documentation

```python
@api.response(400, 'Bad Request', error_model, examples={
    'application/json': {
        'error': 'Validation failed',
        'message': 'Invalid entity type',
        'code': 'VALIDATION_ERROR',
        'timestamp': '2025-01-15T12:00:00Z',
        'path': '/api/v1/entities',
        'details': {
            'type': 'Field is required'
        }
    }
})
@api.response(401, 'Unauthorized', error_model)
@api.response(403, 'Forbidden', error_model)
@api.response(404, 'Not Found', error_model)
@api.response(429, 'Too Many Requests', error_model)
@api.response(500, 'Internal Server Error', error_model)
def get(self, entity_id):
    """Get entity"""
    pass
```

## README Documentation

```markdown
# CM Information API Implementation

## Overview

This is a server implementation of the CESMII Contextualized Manufacturing Information API.

## Features

- RESTful API for manufacturing entities
- Time-series data storage and retrieval
- Data aggregation support
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
git clone https://github.com/your-org/cm-api.git
cd cm-api

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

## CONTRIBUTING.md

```markdown
# Contributing Guidelines

## Code of Conduct

Be respectful and professional in all interactions.

## Development Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests
5. Run tests (`pytest`)
6. Commit changes (`git commit -m 'Add amazing feature'`)
7. Push to branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## Coding Standards

- Follow PEP 8
- Add docstrings to all functions and classes
- Write tests for new features
- Keep functions small and focused
- Use type hints

## Testing

- Write unit tests for all new code
- Maintain >80% code coverage
- Run `pytest` before submitting PR

## Documentation

- Update API documentation for endpoint changes
- Add examples for new features
- Update README if needed

## Pull Request Process

1. Update documentation
2. Add tests
3. Ensure all tests pass
4. Request review from maintainers
5. Address review feedback
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
