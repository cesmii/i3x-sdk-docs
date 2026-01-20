# Deployment

## Container Deployment (Docker)

### Dockerfile

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Set environment variables
ENV FLASK_APP=api.py
ENV FLASK_ENV=production
ENV PYTHONUNBUFFERED=1

# Create non-root user
RUN useradd -m -u 1000 apiuser && \
    chown -R apiuser:apiuser /app
USER apiuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/health')"

# Run with gunicorn for production
CMD ["gunicorn", \
     "--bind", "0.0.0.0:8000", \
     "--workers", "4", \
     "--worker-class", "gthread", \
     "--threads", "2", \
     "--timeout", "60", \
     "--access-logfile", "-", \
     "--error-logfile", "-", \
     "api:app"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/manufacturing
      - REDIS_URL=redis://redis:6379/0
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped
  
  db:
    image: postgres:14
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=manufacturing
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user"]
      interval: 10s
      timeout: 5s
      retries: 5
  
  redis:
    image: redis:7
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
  redis_data:
```

## Kubernetes Deployment

### Deployment Manifest

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cm-information-api
  labels:
    app: cm-information-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: cm-information-api
  template:
    metadata:
      labels:
        app: cm-information-api
    spec:
      containers:
      - name: api
        image: your-registry/cm-information-api:latest
        ports:
        - containerPort: 8000
          name: http
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: api-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: api-secrets
              key: redis-url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: api-secrets
              key: jwt-secret
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /ready
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3
---
apiVersion: v1
kind: Service
metadata:
  name: cm-information-api
spec:
  selector:
    app: cm-information-api
  ports:
  - port: 80
    targetPort: 8000
    protocol: TCP
    name: http
  type: LoadBalancer
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: cm-information-api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: cm-information-api
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### ConfigMap

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: api-config
data:
  FLASK_ENV: "production"
  LOG_LEVEL: "INFO"
  CACHE_TTL: "60"
  MAX_PAGE_SIZE: "1000"
```

### Secrets

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: api-secrets
type: Opaque
stringData:
  database-url: postgresql://user:password@db-host:5432/manufacturing
  redis-url: redis://redis-host:6379/0
  jwt-secret: your-secret-key-here
```

## Health Checks

### Health Endpoint

```python
@app.route('/health', methods=['GET'])
def health_check():
    """Basic health check for load balancers"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat()
    }), 200
```

### Readiness Endpoint

```python
@app.route('/ready', methods=['GET'])
def readiness_check():
    """Comprehensive readiness check"""
    checks = {}
    all_ready = True
    
    # Check database
    try:
        repo.health_check()
        checks['database'] = {'status': 'ready'}
    except Exception as e:
        checks['database'] = {'status': 'not ready', 'error': str(e)}
        all_ready = False
    
    # Check Redis
    try:
        redis_client.ping()
        checks['redis'] = {'status': 'ready'}
    except Exception as e:
        checks['redis'] = {'status': 'not ready', 'error': str(e)}
        all_ready = False
    
    # Check external services
    try:
        # Add any external service checks
        checks['external'] = {'status': 'ready'}
    except Exception as e:
        checks['external'] = {'status': 'not ready', 'error': str(e)}
        all_ready = False
    
    status_code = 200 if all_ready else 503
    
    return jsonify({
        'status': 'ready' if all_ready else 'not ready',
        'checks': checks,
        'timestamp': datetime.utcnow().isoformat()
    }), status_code
```

## Environment Configuration

### Environment Variables

```python
import os

class Config:
    """Application configuration"""
    
    # Flask
    FLASK_ENV = os.getenv('FLASK_ENV', 'production')
    SECRET_KEY = os.getenv('SECRET_KEY', 'change-me-in-production')
    
    # Database
    DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://localhost/manufacturing')
    DATABASE_POOL_SIZE = int(os.getenv('DATABASE_POOL_SIZE', '20'))
    DATABASE_MAX_OVERFLOW = int(os.getenv('DATABASE_MAX_OVERFLOW', '10'))
    
    # Redis
    REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
    CACHE_TTL = int(os.getenv('CACHE_TTL', '60'))
    
    # Authentication
    JWT_SECRET = os.getenv('JWT_SECRET', 'change-me-in-production')
    JWT_EXPIRY_HOURS = int(os.getenv('JWT_EXPIRY_HOURS', '24'))
    
    # API
    MAX_PAGE_SIZE = int(os.getenv('MAX_PAGE_SIZE', '1000'))
    RATE_LIMIT = os.getenv('RATE_LIMIT', '1000 per hour')
    
    # Logging
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    LOG_FORMAT = os.getenv('LOG_FORMAT', 'json')

config = Config()
```

## Production Gunicorn Configuration

```python
# gunicorn.conf.py
import multiprocessing

# Server socket
bind = "0.0.0.0:8000"
backlog = 2048

# Worker processes
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "gthread"
threads = 2
worker_connections = 1000
max_requests = 10000
max_requests_jitter = 1000
timeout = 60
keepalive = 5

# Logging
accesslog = "-"
errorlog = "-"
loglevel = "info"
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" %(D)s'

# Process naming
proc_name = "cm-information-api"

# Server mechanics
daemon = False
pidfile = None
umask = 0
user = None
group = None
tmp_upload_dir = None

# SSL (if needed)
# keyfile = "/path/to/key.pem"
# certfile = "/path/to/cert.pem"
```

## Nginx Reverse Proxy

```nginx
upstream api_servers {
    least_conn;
    server api1:8000;
    server api2:8000;
    server api3:8000;
}

server {
    listen 80;
    server_name api.example.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.example.com;
    
    # SSL configuration
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # Security headers
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Logging
    access_log /var/log/nginx/api_access.log;
    error_log /var/log/nginx/api_error.log;
    
    # Proxy settings
    location /api/ {
        proxy_pass http://api_servers;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffering
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
        proxy_busy_buffers_size 8k;
        
        # Connection pooling
        proxy_http_version 1.1;
        proxy_set_header Connection "";
    }
    
    # Health check endpoint (bypass proxy)
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

## Database Migrations

### Alembic Setup

```python
# alembic/env.py
from alembic import context
from sqlalchemy import engine_from_config, pool
from app.models import Base

config = context.config
target_metadata = Base.metadata

def run_migrations_online():
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()

run_migrations_online()
```

```bash
# Create migration
alembic revision --autogenerate -m "Add entity table"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Secrets properly managed
- [ ] Database migrations applied
- [ ] Health checks working
- [ ] SSL certificates configured
- [ ] Monitoring and logging set up
- [ ] Rate limiting configured
- [ ] CORS settings configured
- [ ] Backups configured
- [ ] Disaster recovery plan in place
- [ ] Load testing completed
- [ ] Security scan completed
- [ ] Documentation updated
