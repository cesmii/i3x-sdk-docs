# Security

## Authentication & Authorization

### JWT Token Management

```python
import jwt
from datetime import datetime, timedelta
from functools import wraps

class JWTManager:
    """JWT token management"""
    
    def __init__(self, secret_key: str, expiry_hours: int = 24):
        self.secret_key = secret_key
        self.expiry_hours = expiry_hours
        self.algorithm = 'HS256'
    
    def create_token(self, user_id: str, roles: List[str]) -> str:
        """Create a new JWT token"""
        payload = {
            'user_id': user_id,
            'roles': roles,
            'exp': datetime.utcnow() + timedelta(hours=self.expiry_hours),
            'iat': datetime.utcnow()
        }
        return jwt.encode(payload, self.secret_key, algorithm=self.algorithm)
    
    def verify_token(self, token: str) -> dict:
        """Verify and decode JWT token"""
        try:
            return jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
        except jwt.ExpiredSignatureError:
            raise ValueError('Token has expired')
        except jwt.InvalidTokenError:
            raise ValueError('Invalid token')
```

### Role-Based Access Control (RBAC)

```python
from enum import Enum

class Permission(Enum):
    ENTITY_READ = 'entity:read'
    ENTITY_CREATE = 'entity:create'
    ENTITY_UPDATE = 'entity:update'
    ENTITY_DELETE = 'entity:delete'
    DATA_READ = 'data:read'
    DATA_WRITE = 'data:write'
    ADMIN = 'admin:*'

class Role(Enum):
    VIEWER = 'viewer'
    OPERATOR = 'operator'
    ADMIN = 'admin'

ROLE_PERMISSIONS = {
    Role.VIEWER: [
        Permission.ENTITY_READ,
        Permission.DATA_READ
    ],
    Role.OPERATOR: [
        Permission.ENTITY_READ,
        Permission.ENTITY_CREATE,
        Permission.ENTITY_UPDATE,
        Permission.DATA_READ,
        Permission.DATA_WRITE
    ],
    Role.ADMIN: [Permission.ADMIN]
}

def has_permission(user_roles: List[str], required_permission: Permission) -> bool:
    """Check if user has required permission"""
    for role_name in user_roles:
        try:
            role = Role(role_name)
            permissions = ROLE_PERMISSIONS.get(role, [])
            
            if Permission.ADMIN in permissions:
                return True
            
            if required_permission in permissions:
                return True
        except ValueError:
            continue
    
    return False
```

## Input Validation

### Schema Validation

```python
from marshmallow import Schema, fields, validate, ValidationError, validates_schema

class EntitySchema(Schema):
    """Schema for entity validation"""
    type = fields.Str(
        required=True,
        validate=validate.Length(min=1, max=100)
    )
    displayName = fields.Str(
        required=True,
        validate=validate.Length(min=1, max=255)
    )
    namespace = fields.Str(
        validate=validate.Regexp(r'^urn:[\w\-]+:[\w\-]+$')
    )
    description = fields.Str(
        validate=validate.Length(max=1000)
    )
    attributes = fields.Dict()
    parentId = fields.Str()
    
    @validates_schema
    def validate_attributes(self, data, **kwargs):
        """Custom validation for attributes"""
        if 'attributes' in data:
            attrs = data['attributes']
            
            # Limit number of attributes
            if len(attrs) > 100:
                raise ValidationError('Too many attributes (max 100)')
            
            # Validate attribute values
            for key, value in attrs.items():
                if not isinstance(key, str) or len(key) > 100:
                    raise ValidationError(f'Invalid attribute key: {key}')
                
                if isinstance(value, str) and len(value) > 10000:
                    raise ValidationError(f'Attribute value too long: {key}')

entity_schema = EntitySchema()

def validate_entity(data: dict) -> dict:
    """Validate entity data"""
    try:
        return entity_schema.load(data)
    except ValidationError as e:
        raise ValueError(f"Validation failed: {e.messages}")
```

### SQL Injection Prevention

```python
# ✅ Good - Parameterized queries
def get_entities_safe(entity_type: str):
    query = "SELECT * FROM entities WHERE type = ?"
    cursor.execute(query, (entity_type,))
    return cursor.fetchall()

# ✅ Good - ORM (SQLAlchemy)
def get_entities_orm(entity_type: str):
    return session.query(Entity).filter(Entity.type == entity_type).all()

# ❌ Bad - String concatenation
def get_entities_unsafe(entity_type: str):
    query = f"SELECT * FROM entities WHERE type = '{entity_type}'"
    cursor.execute(query)
    return cursor.fetchall()
```

### XSS Prevention

```python
from markupsafe import escape

def sanitize_input(text: str) -> str:
    """Sanitize user input to prevent XSS"""
    return escape(text)

# Use in API responses
@app.route('/objects/list', methods=['POST'])
def get_object(element_id: str):
    obj = repo.get_object(element_id)
    
    # Sanitize display values
    if entity:
        entity['displayName'] = sanitize_input(entity['displayName'])
        entity['description'] = sanitize_input(entity.get('description', ''))
    
    return jsonify(entity), 200
```

## CORS Configuration

```python
from flask_cors import CORS

# Restrictive CORS configuration
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "https://app.example.com",
            "https://dashboard.example.com"
        ],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": [
            "Content-Type",
            "Authorization",
            "X-Request-ID"
        ],
        "expose_headers": [
            "X-Total-Count",
            "X-Request-ID"
        ],
        "max_age": 3600,
        "supports_credentials": True
    }
})
```

## Rate Limiting

```python
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["1000 per hour", "100 per minute"],
    storage_uri="redis://localhost:6379",
    strategy="fixed-window"
)

# Per-endpoint rate limits
@app.route('/objects', methods=['GET'])
@limiter.limit("200 per minute")
def list_entities():
    pass

@app.route('/objects', methods=['POST'])
@limiter.limit("50 per minute")
def create_entity():
    pass

# Custom key function for authenticated users
def get_user_id():
    user = getattr(request, 'current_user', None)
    if user:
        return user.get('id')
    return get_remote_address()

@app.route('/objects/<element_id>/value', methods=['PUT'])
@limiter.limit("1000 per hour", key_func=get_user_id)
def update_object_value(element_id: str):
    pass
```

## Secrets Management

### Environment Variables

```python
import os
from cryptography.fernet import Fernet

class SecretsManager:
    """Manage encrypted secrets"""
    
    def __init__(self):
        # Get encryption key from environment
        key = os.getenv('SECRETS_KEY')
        if not key:
            raise ValueError('SECRETS_KEY not set')
        
        self.cipher = Fernet(key.encode())
    
    def encrypt(self, value: str) -> str:
        """Encrypt a secret value"""
        return self.cipher.encrypt(value.encode()).decode()
    
    def decrypt(self, encrypted_value: str) -> str:
        """Decrypt a secret value"""
        return self.cipher.decrypt(encrypted_value.encode()).decode()

# Usage
secrets = SecretsManager()
db_password = secrets.decrypt(os.getenv('DB_PASSWORD_ENCRYPTED'))
```

## API Key Authentication

```python
import secrets

class APIKeyManager:
    """Manage API keys"""
    
    def generate_api_key(self) -> str:
        """Generate a new API key"""
        return secrets.token_urlsafe(32)
    
    def hash_api_key(self, api_key: str) -> str:
        """Hash an API key for storage"""
        import hashlib
        return hashlib.sha256(api_key.encode()).hexdigest()
    
    def verify_api_key(self, api_key: str, stored_hash: str) -> bool:
        """Verify an API key against stored hash"""
        return self.hash_api_key(api_key) == stored_hash

api_key_manager = APIKeyManager()

@app.before_request
def check_api_key():
    """Check API key on each request"""
    if request.path.startswith('/api/'):
        api_key = request.headers.get('X-API-Key')
        
        if not api_key:
            return jsonify({'error': 'API key required'}), 401
        
        # Verify API key
        stored_hash = get_api_key_hash_from_db(api_key)
        if not stored_hash or not api_key_manager.verify_api_key(api_key, stored_hash):
            return jsonify({'error': 'Invalid API key'}), 401
```

## Security Headers

```python
from flask_talisman import Talisman

# Configure security headers
Talisman(app,
    force_https=True,
    strict_transport_security=True,
    strict_transport_security_max_age=31536000,
    content_security_policy={
        'default-src': "'self'",
        'script-src': "'self'",
        'style-src': "'self'",
        'img-src': "'self' data:",
        'connect-src': "'self'"
    },
    session_cookie_secure=True,
    session_cookie_http_only=True,
    session_cookie_samesite='Lax',
    x_content_type_options=True,
    x_frame_options='DENY',
    x_xss_protection=True
)
```

## Audit Logging

```python
class AuditLogger:
    """Log security-relevant events"""
    
    def log_authentication(self, user_id: str, success: bool, ip: str):
        """Log authentication attempt"""
        logger.info(
            f"Authentication {'succeeded' if success else 'failed'}",
            extra={
                'event_type': 'authentication',
                'user_id': user_id,
                'success': success,
                'ip_address': ip,
                'timestamp': datetime.utcnow().isoformat()
            }
        )
    
    def log_authorization_failure(self, user_id: str, resource: str, action: str):
        """Log authorization failure"""
        logger.warning(
            f"Authorization denied: {user_id} attempted {action} on {resource}",
            extra={
                'event_type': 'authorization_denied',
                'user_id': user_id,
                'resource': resource,
                'action': action,
                'timestamp': datetime.utcnow().isoformat()
            }
        )
    
    def log_data_access(self, user_id: str, entity_id: str, action: str):
        """Log data access"""
        logger.info(
            f"Data access: {user_id} {action} {entity_id}",
            extra={
                'event_type': 'data_access',
                'user_id': user_id,
                'entity_id': entity_id,
                'action': action,
                'timestamp': datetime.utcnow().isoformat()
            }
        )

audit_logger = AuditLogger()
```

## Best Practices Checklist

- [ ] Use HTTPS everywhere
- [ ] Implement proper authentication (JWT or OAuth)
- [ ] Enforce role-based access control
- [ ] Validate and sanitize all inputs
- [ ] Use parameterized queries
- [ ] Configure CORS restrictively
- [ ] Implement rate limiting
- [ ] Set security headers
- [ ] Store secrets securely
- [ ] Log security events
- [ ] Keep dependencies updated
- [ ] Run security scans regularly
- [ ] Implement API key rotation
- [ ] Use strong password policies
- [ ] Enable audit logging
