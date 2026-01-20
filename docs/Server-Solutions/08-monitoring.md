# Monitoring and Observability

## Logging

### Structured Logging Setup

```python
import logging
import json
from logging.handlers import RotatingFileHandler
from datetime import datetime

class JSONFormatter(logging.Formatter):
    """Custom JSON formatter for structured logging"""
    
    def format(self, record):
        log_data = {
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'level': record.levelname,
            'logger': record.name,
            'message': record.getMessage(),
            'module': record.module,
            'function': record.funcName,
            'line': record.lineno
        }
        
        # Add extra fields if present
        if hasattr(record, 'user_id'):
            log_data['user_id'] = record.user_id
        if hasattr(record, 'request_id'):
            log_data['request_id'] = record.request_id
        if hasattr(record, 'duration_ms'):
            log_data['duration_ms'] = record.duration_ms
        
        # Add exception info if present
        if record.exc_info:
            log_data['exception'] = self.formatException(record.exc_info)
        
        return json.dumps(log_data)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger('cm_information_api')

# Add rotating file handler with JSON formatting
handler = RotatingFileHandler(
    'api.log',
    maxBytes=10485760,  # 10MB
    backupCount=10
)
handler.setFormatter(JSONFormatter())
logger.addHandler(handler)
```

### Request Logging Middleware

```python
import time
import uuid
from flask import request, g

@app.before_request
def before_request():
    """Log incoming requests"""
    g.request_id = str(uuid.uuid4())
    g.start_time = time.time()
    
    logger.info(
        f"Request started: {request.method} {request.path}",
        extra={
            'request_id': g.request_id,
            'method': request.method,
            'path': request.path,
            'ip': request.remote_addr,
            'user_agent': request.headers.get('User-Agent'),
            'user_id': getattr(request, 'current_user', {}).get('id')
        }
    )

@app.after_request
def after_request(response):
    """Log completed requests"""
    duration_ms = (time.time() - g.start_time) * 1000
    
    logger.info(
        f"Request completed: {request.method} {request.path}",
        extra={
            'request_id': g.request_id,
            'status_code': response.status_code,
            'duration_ms': duration_ms,
            'response_size': response.content_length
        }
    )
    
    # Add request ID to response headers
    response.headers['X-Request-ID'] = g.request_id
    
    return response
```

## Metrics

### Prometheus Integration

```python
from prometheus_client import Counter, Histogram, Gauge, generate_latest
from prometheus_flask_exporter import PrometheusMetrics

# Initialize Prometheus metrics
metrics = PrometheusMetrics(app)

# Custom metrics
entity_requests = Counter(
    'entity_requests_total',
    'Total entity requests',
    ['method', 'endpoint', 'status']
)

data_points_written = Counter(
    'data_points_written_total',
    'Total data points written',
    ['entity_type']
)

request_duration = Histogram(
    'request_duration_seconds',
    'Request duration in seconds',
    ['method', 'endpoint']
)

active_connections = Gauge(
    'active_database_connections',
    'Number of active database connections'
)

cache_hits = Counter(
    'cache_hits_total',
    'Total cache hits',
    ['cache_type']
)

cache_misses = Counter(
    'cache_misses_total',
    'Total cache misses',
    ['cache_type']
)

# Expose metrics endpoint
@app.route('/metrics')
def metrics_endpoint():
    """Prometheus metrics endpoint"""
    return generate_latest(), 200, {'Content-Type': 'text/plain; charset=utf-8'}
```

### Application Metrics

```python
def track_entity_request(method: str, endpoint: str, status_code: int):
    """Track entity request metrics"""
    entity_requests.labels(
        method=method,
        endpoint=endpoint,
        status=str(status_code)
    ).inc()

def track_data_write(entity_type: str, count: int):
    """Track data point writes"""
    data_points_written.labels(entity_type=entity_type).inc(count)

def track_cache_access(cache_type: str, hit: bool):
    """Track cache hits/misses"""
    if hit:
        cache_hits.labels(cache_type=cache_type).inc()
    else:
        cache_misses.labels(cache_type=cache_type).inc()

# Usage in endpoints
@app.route('/objects/list', methods=['GET'])
def get_entity(entity_id: str):
    try:
        entity = repo.get_entity_cached(entity_id)
        track_entity_request('GET', 'entities', 200)
        return jsonify(entity), 200
    except Exception as e:
        track_entity_request('GET', 'entities', 500)
        raise
```

## Application Performance Monitoring (APM)

### New Relic Integration

```python
import newrelic.agent

# Initialize New Relic
newrelic.agent.initialize('newrelic.ini')

# Wrap Flask app
app = newrelic.agent.WSGIApplicationWrapper(app)

# Custom transaction naming
@app.before_request
def set_transaction_name():
    newrelic.agent.set_transaction_name(
        f"{request.method}:{request.endpoint}"
    )

# Track custom metrics
def track_custom_metric(name: str, value: float):
    """Track custom metric in New Relic"""
    newrelic.agent.record_custom_metric(name, value)

# Track custom events
def track_custom_event(event_type: str, params: dict):
    """Track custom event in New Relic"""
    newrelic.agent.record_custom_event(event_type, params)
```

### DataDog Integration

```python
from ddtrace import tracer, patch_all
from ddtrace.contrib.flask import TraceMiddleware

# Patch all supported libraries
patch_all()

# Initialize DataDog tracing
traced_app = TraceMiddleware(app, tracer, service='cm-information-api')

# Custom spans
@tracer.wrap(service='cm-information-api', resource='get_entity')
def get_entity_traced(entity_id: str):
    with tracer.trace('repository.get_entity') as span:
        span.set_tag('entity.id', entity_id)
        entity = repo.get_entity(entity_id)
        span.set_tag('entity.type', entity.get('type'))
    return entity
```

## Error Tracking

### Sentry Integration

```python
import sentry_sdk
from sentry_sdk.integrations.flask import FlaskIntegration

sentry_sdk.init(
    dsn="https://your-dsn@sentry.io/project-id",
    integrations=[FlaskIntegration()],
    traces_sample_rate=0.1,  # 10% of transactions
    profiles_sample_rate=0.1,  # 10% of profiling
    environment=os.getenv('ENVIRONMENT', 'production'),
    release=os.getenv('VERSION', 'unknown')
)

# Custom error context
def capture_error_with_context(error: Exception, context: dict):
    """Capture error with additional context"""
    with sentry_sdk.push_scope() as scope:
        for key, value in context.items():
            scope.set_context(key, value)
        sentry_sdk.capture_exception(error)
```

## Log Aggregation

### ELK Stack (Elasticsearch, Logstash, Kibana)

```python
from logstash_formatter import LogstashFormatterV1

# Configure logstash handler
logstash_handler = logging.handlers.SocketHandler(
    'logstash-host',
    5000
)
logstash_handler.setFormatter(LogstashFormatterV1())
logger.addHandler(logstash_handler)
```

### Grafana Loki

```python
import logging_loki

handler = logging_loki.LokiHandler(
    url="http://loki:3100/loki/api/v1/push",
    tags={"application": "cm-information-api"},
    version="1",
)

logger.addHandler(handler)
```

## Alerting

### Alert Definitions

```yaml
# prometheus-alerts.yml
groups:
- name: api_alerts
  rules:
  - alert: HighErrorRate
    expr: rate(entity_requests_total{status=~"5.."}[5m]) > 0.05
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: High error rate detected
      description: "Error rate is {{ $value | humanizePercentage }}"
  
  - alert: SlowResponseTime
    expr: histogram_quantile(0.95, request_duration_seconds) > 2
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: Slow response time
      description: "95th percentile response time is {{ $value }}s"
  
  - alert: DatabaseConnectionIssue
    expr: active_database_connections == 0
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: No active database connections
      description: "Database appears to be down"
  
  - alert: LowCacheHitRate
    expr: rate(cache_hits_total[5m]) / (rate(cache_hits_total[5m]) + rate(cache_misses_total[5m])) < 0.5
    for: 10m
    labels:
      severity: info
    annotations:
      summary: Low cache hit rate
      description: "Cache hit rate is {{ $value | humanizePercentage }}"
```

## Dashboards

### Grafana Dashboard JSON

```json
{
  "dashboard": {
    "title": "i3X API",
    "panels": [
      {
        "title": "Request Rate",
        "targets": [
          {
            "expr": "rate(entity_requests_total[5m])"
          }
        ]
      },
      {
        "title": "Error Rate",
        "targets": [
          {
            "expr": "rate(entity_requests_total{status=~\"5..\"}[5m])"
          }
        ]
      },
      {
        "title": "Response Time (95th percentile)",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, request_duration_seconds)"
          }
        ]
      },
      {
        "title": "Active Database Connections",
        "targets": [
          {
            "expr": "active_database_connections"
          }
        ]
      }
    ]
  }
}
```

## Best Practices

1. **Use structured logging** (JSON format)
2. **Include request IDs** in all logs
3. **Track key business metrics** (entities created, data points written)
4. **Set up alerts** for error rates and slow responses
5. **Monitor resource usage** (CPU, memory, connections)
6. **Track cache performance**
7. **Use distributed tracing** for microservices
8. **Aggregate logs centrally**
9. **Create meaningful dashboards**
10. **Test alerting** before production
