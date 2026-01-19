# Performance Optimization

## Database Query Optimization

### Caching Strategy

```python
from datetime import datetime, timedelta
from typing import Optional, List, Dict
import redis

class OptimizedDataRepository:
    """Optimized data access with caching and connection pooling"""
    
    def __init__(self, connection_pool, redis_client):
        self.pool = connection_pool
        self.redis = redis_client
        self.cache_ttl = 60  # seconds
    
    def get_entity_cached(self, entity_id: str) -> Optional[Dict]:
        """Get entity with Redis caching"""
        cache_key = f"entity:{entity_id}"
        
        # Check Redis cache
        cached = self.redis.get(cache_key)
        if cached:
            return json.loads(cached)
        
        # Query database
        with self.pool.get_connection() as conn:
            entity = self._query_entity(conn, entity_id)
        
        # Update cache
        if entity:
            self.redis.setex(
                cache_key,
                self.cache_ttl,
                json.dumps(entity)
            )
        
        return entity
    
    def batch_get_entities(self, entity_ids: List[str]) -> List[Dict]:
        """Batch retrieve multiple entities efficiently"""
        with self.pool.get_connection() as conn:
            cursor = conn.cursor()
            placeholders = ','.join(['?'] * len(entity_ids))
            query = f"SELECT * FROM entities WHERE id IN ({placeholders})"
            cursor.execute(query, entity_ids)
            return cursor.fetchall()
    
    def invalidate_cache(self, entity_id: str):
        """Invalidate cache for an entity"""
        cache_key = f"entity:{entity_id}"
        self.redis.delete(cache_key)
```

### Connection Pooling

```python
from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool

# Create engine with connection pooling
engine = create_engine(
    'postgresql://user:pass@localhost:5432/manufacturing',
    poolclass=QueuePool,
    pool_size=20,          # Number of permanent connections
    max_overflow=10,       # Additional connections when needed
    pool_timeout=30,       # Timeout waiting for connection
    pool_recycle=3600,     # Recycle connections after 1 hour
    pool_pre_ping=True     # Verify connections before using
)
```

### Query Optimization

```python
def get_entities_optimized(filters: Dict, limit: int, offset: int) -> List[Dict]:
    """Optimized entity query with indexes"""
    
    # Use parameterized queries
    query = """
        SELECT e.*, 
               COUNT(*) OVER() as total_count
        FROM entities e
        WHERE 1=1
    """
    params = []
    
    # Add filters
    if 'type' in filters:
        query += " AND e.type = ?"
        params.append(filters['type'])
    
    if 'namespace' in filters:
        query += " AND e.namespace = ?"
        params.append(filters['namespace'])
    
    # Add ordering and pagination
    query += " ORDER BY e.created DESC LIMIT ? OFFSET ?"
    params.extend([limit, offset])
    
    # Execute query
    with engine.connect() as conn:
        result = conn.execute(query, params)
        return result.fetchall()
```

## Pagination Best Practices

### Offset-Based Pagination

```python
@app.route('/api/v1/entities', methods=['GET'])
def list_entities_offset():
    """Standard offset-based pagination"""
    limit = min(int(request.args.get('limit', 100)), 1000)
    offset = int(request.args.get('offset', 0))
    
    entities, total = repo.get_entities_with_count(limit, offset)
    
    return jsonify({
        'items': entities,
        'pagination': {
            'limit': limit,
            'offset': offset,
            'total': total,
            'hasMore': offset + len(entities) < total
        }
    }), 200
```

### Cursor-Based Pagination (Recommended for Large Datasets)

```python
import base64
import json

@app.route('/api/v1/entities', methods=['GET'])
def list_entities_cursor():
    """Cursor-based pagination for better performance"""
    limit = min(int(request.args.get('limit', 100)), 1000)
    cursor = request.args.get('cursor')
    
    # Decode cursor
    last_id = None
    last_timestamp = None
    if cursor:
        try:
            cursor_data = json.loads(base64.b64decode(cursor))
            last_id = cursor_data.get('id')
            last_timestamp = cursor_data.get('timestamp')
        except:
            return jsonify({'error': 'Invalid cursor'}), 400
    
    # Query with cursor
    entities = repo.get_entities_after_cursor(
        last_id, last_timestamp, limit + 1
    )
    
    # Determine if there are more results
    has_more = len(entities) > limit
    if has_more:
        entities = entities[:limit]
    
    # Create next cursor
    next_cursor = None
    if has_more and entities:
        last_entity = entities[-1]
        cursor_data = {
            'id': last_entity['id'],
            'timestamp': last_entity['created']
        }
        next_cursor = base64.b64encode(
            json.dumps(cursor_data).encode()
        ).decode()
    
    return jsonify({
        'items': entities,
        'pagination': {
            'limit': limit,
            'hasMore': has_more,
            'nextCursor': next_cursor
        }
    }), 200
```

## Data Aggregation Optimization

### In-Database Aggregation

```python
def get_aggregated_data_sql(
    entity_id: str,
    data_point_id: str,
    start_time: datetime,
    end_time: datetime,
    aggregation: str,
    interval_seconds: int
) -> List[Dict]:
    """Perform aggregation in database for better performance"""
    
    # PostgreSQL example with time_bucket
    query = """
        SELECT 
            time_bucket(%(interval)s, timestamp) AS bucket,
            {} AS value,
            COUNT(*) AS count
        FROM time_series_data
        WHERE entity_id = %(entity_id)s
          AND data_point_id = %(data_point_id)s
          AND timestamp >= %(start_time)s
          AND timestamp <= %(end_time)s
          AND quality = 'Good'
        GROUP BY bucket
        ORDER BY bucket
    """
    
    # Choose aggregation function
    if aggregation == 'avg':
        agg_func = 'AVG(value)'
    elif aggregation == 'min':
        agg_func = 'MIN(value)'
    elif aggregation == 'max':
        agg_func = 'MAX(value)'
    elif aggregation == 'sum':
        agg_func = 'SUM(value)'
    else:
        agg_func = 'AVG(value)'
    
    query = query.format(agg_func)
    
    params = {
        'interval': f'{interval_seconds} seconds',
        'entity_id': entity_id,
        'data_point_id': data_point_id,
        'start_time': start_time,
        'end_time': end_time
    }
    
    with engine.connect() as conn:
        result = conn.execute(query, params)
        return [dict(row) for row in result]
```

### Application-Level Aggregation

```python
class AggregationEngine:
    """Efficient time-series aggregation in application"""
    
    def aggregate_time_series(
        self,
        data_points: List[Dict],
        method: str,
        interval_seconds: int
    ) -> List[Dict]:
        """Aggregate data points using specified method and interval"""
        
        if method == 'none':
            return data_points
        
        aggregated = []
        current_bucket = []
        bucket_start = None
        
        for point in sorted(data_points, key=lambda x: x['timestamp']):
            point_time = datetime.fromisoformat(point['timestamp'])
            
            if bucket_start is None:
                bucket_start = self._bucket_start_time(point_time, interval_seconds)
            
            bucket_end = bucket_start + timedelta(seconds=interval_seconds)
            
            if point_time >= bucket_end:
                if current_bucket:
                    aggregated.append(
                        self._compute_aggregate(current_bucket, method, bucket_start)
                    )
                bucket_start = self._bucket_start_time(point_time, interval_seconds)
                current_bucket = [point]
            else:
                current_bucket.append(point)
        
        if current_bucket:
            aggregated.append(
                self._compute_aggregate(current_bucket, method, bucket_start)
            )
        
        return aggregated
    
    def _bucket_start_time(self, timestamp: datetime, interval: int) -> datetime:
        """Round down to bucket start time"""
        epoch = datetime(1970, 1, 1, tzinfo=timestamp.tzinfo)
        seconds_since_epoch = (timestamp - epoch).total_seconds()
        bucket_seconds = (seconds_since_epoch // interval) * interval
        return epoch + timedelta(seconds=bucket_seconds)
    
    def _compute_aggregate(
        self,
        points: List[Dict],
        method: str,
        timestamp: datetime
    ) -> Dict:
        """Compute aggregate value for bucket"""
        values = [p['value'] for p in points if p['quality'] == 'Good']
        
        if not values:
            return {
                'timestamp': timestamp.isoformat(),
                'value': None,
                'quality': 'Bad',
                'count': 0
            }
        
        if method == 'avg':
            agg_value = sum(values) / len(values)
        elif method == 'min':
            agg_value = min(values)
        elif method == 'max':
            agg_value = max(values)
        elif method == 'sum':
            agg_value = sum(values)
        elif method == 'count':
            agg_value = len(values)
        else:
            raise ValueError(f"Unsupported aggregation method: {method}")
        
        return {
            'timestamp': timestamp.isoformat(),
            'value': agg_value,
            'quality': 'Good',
            'count': len(values)
        }
```

## Response Compression

```python
from flask_compress import Compress

# Enable response compression
compress = Compress()
compress.init_app(app)

# Configure compression
app.config['COMPRESS_MIMETYPES'] = [
    'application/json',
    'text/html',
    'text/css',
    'text/xml',
    'application/javascript'
]
app.config['COMPRESS_LEVEL'] = 6  # 1-9, higher = more compression
app.config['COMPRESS_MIN_SIZE'] = 500  # Minimum response size to compress
```

## Asynchronous Processing

### Background Tasks with Celery

```python
from celery import Celery
import time

celery = Celery(
    'manufacturing_api',
    broker='redis://localhost:6379/0',
    backend='redis://localhost:6379/1'
)

@celery.task
def process_bulk_data_import(file_path: str, entity_id: str):
    """Process large data import in background"""
    # Read and process data
    data_points = read_data_file(file_path)
    
    # Write in batches
    batch_size = 1000
    for i in range(0, len(data_points), batch_size):
        batch = data_points[i:i+batch_size]
        data_repo.write_batch(entity_id, batch)
        time.sleep(0.1)  # Prevent overwhelming the database
    
    return {'status': 'complete', 'imported': len(data_points)}

@app.route('/api/v1/entities/<entity_id>/import', methods=['POST'])
@require_auth
def import_entity_data(entity_id: str):
    """Start asynchronous data import"""
    file = request.files['file']
    file_path = save_upload(file)
    
    task = process_bulk_data_import.delay(file_path, entity_id)
    
    return jsonify({
        'taskId': task.id,
        'status': 'processing',
        'statusUrl': f'/api/v1/tasks/{task.id}'
    }), 202

@app.route('/api/v1/tasks/<task_id>', methods=['GET'])
@require_auth
def get_task_status(task_id: str):
    """Check status of background task"""
    task = process_bulk_data_import.AsyncResult(task_id)
    
    response = {
        'taskId': task_id,
        'status': task.state
    }
    
    if task.state == 'SUCCESS':
        response['result'] = task.result
    elif task.state == 'FAILURE':
        response['error'] = str(task.info)
    
    return jsonify(response), 200
```

## Database Indexing

### Essential Indexes

```sql
-- Entity lookup indexes
CREATE INDEX idx_entities_type ON entities(type);
CREATE INDEX idx_entities_namespace ON entities(namespace);
CREATE INDEX idx_entities_parent ON entities(parent_id);
CREATE INDEX idx_entities_created ON entities(created DESC);

-- Time-series data indexes
CREATE INDEX idx_timeseries_entity_time ON time_series_data(entity_id, timestamp DESC);
CREATE INDEX idx_timeseries_datapoint ON time_series_data(entity_id, data_point_id, timestamp DESC);
CREATE INDEX idx_timeseries_quality ON time_series_data(quality);

-- Composite indexes for common queries
CREATE INDEX idx_entities_type_namespace ON entities(type, namespace);
CREATE INDEX idx_timeseries_entity_datapoint_time ON time_series_data(entity_id, data_point_id, timestamp DESC);
```

## Load Balancing

### Multiple Server Instances

Use a load balancer (nginx, HAProxy) to distribute requests:

```nginx
upstream api_servers {
    least_conn;
    server api1.example.com:8000;
    server api2.example.com:8000;
    server api3.example.com:8000;
}

server {
    listen 80;
    server_name api.example.com;
    
    location /api/ {
        proxy_pass http://api_servers;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        
        # Connection pooling
        proxy_http_version 1.1;
        proxy_set_header Connection "";
    }
}
```

## Performance Monitoring

### Request Timing

```python
import time
from functools import wraps

def timing_decorator(f):
    """Decorator to measure endpoint performance"""
    @wraps(f)
    def wrapper(*args, **kwargs):
        start = time.time()
        result = f(*args, **kwargs)
        duration = time.time() - start
        
        # Log slow queries
        if duration > 1.0:
            app.logger.warning(
                f"Slow endpoint: {request.path} took {duration:.2f}s"
            )
        
        return result
    return wrapper

@app.route('/api/v1/entities', methods=['GET'])
@timing_decorator
def list_entities():
    # Implementation
    pass
```

### Query Performance Tracking

```python
def track_query_performance(query: str, duration: float):
    """Track database query performance"""
    # Log to monitoring system
    metrics.histogram('db.query.duration', duration, tags=[
        f'query:{query[:50]}...'
    ])
    
    # Alert on slow queries
    if duration > 5.0:
        app.logger.error(f"Slow query detected: {query} took {duration:.2f}s")
```

## Best Practices Summary

1. **Use Redis for caching** frequently accessed entities
2. **Implement cursor-based pagination** for large datasets
3. **Perform aggregations in the database** when possible
4. **Use connection pooling** for database connections
5. **Add appropriate indexes** for common query patterns
6. **Enable response compression** for JSON responses
7. **Use async processing** for long-running operations
8. **Monitor performance** and set up alerts for slow queries
9. **Load balance** across multiple server instances
10. **Cache expensive computations** with appropriate TTLs
