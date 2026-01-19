# Testing

## Unit Testing

### Basic Unit Tests

```python
import pytest
from unittest.mock import Mock, patch
import json

class TestEntityAPI:
    
    @pytest.fixture
    def client(self):
        app.config['TESTING'] = True
        with app.test_client() as client:
            yield client
    
    @pytest.fixture
    def mock_repo(self):
        with patch('your_module.repo') as mock:
            yield mock
    
    @pytest.fixture
    def auth_headers(self):
        return {'Authorization': 'Bearer test-token-123'}
    
    def test_get_entity_success(self, client, mock_repo, auth_headers):
        """Test successful entity retrieval"""
        mock_entity = {
            'id': 'test-entity-1',
            'type': 'Equipment',
            'displayName': 'Test Equipment'
        }
        mock_repo.get_entity.return_value = mock_entity
        
        response = client.get(
            '/api/v1/entities/test-entity-1',
            headers=auth_headers
        )
        
        assert response.status_code == 200
        assert response.json['id'] == 'test-entity-1'
    
    def test_get_entity_not_found(self, client, mock_repo, auth_headers):
        """Test entity not found scenario"""
        mock_repo.get_entity.return_value = None
        
        response = client.get(
            '/api/v1/entities/nonexistent',
            headers=auth_headers
        )
        
        assert response.status_code == 404
        assert 'error' in response.json
    
    def test_list_entities_pagination(self, client, mock_repo, auth_headers):
        """Test entity list pagination"""
        mock_entities = [
            {'id': f'entity-{i}', 'displayName': f'Entity {i}'}
            for i in range(10)
        ]
        mock_repo.list_entities.return_value = mock_entities
        
        response = client.get(
            '/api/v1/entities?limit=10&offset=0',
            headers=auth_headers
        )
        
        assert response.status_code == 200
        assert len(response.json['items']) == 10
        assert 'pagination' in response.json
    
    def test_create_entity_success(self, client, mock_repo, auth_headers):
        """Test entity creation"""
        new_entity = {
            'type': 'Equipment',
            'displayName': 'New Equipment'
        }
        
        mock_repo.create_entity.return_value = {
            'id': 'new-entity-1',
            **new_entity
        }
        
        response = client.post(
            '/api/v1/entities',
            json=new_entity,
            headers=auth_headers
        )
        
        assert response.status_code == 201
        assert response.json['id'] == 'new-entity-1'
    
    def test_create_entity_validation_error(self, client, mock_repo, auth_headers):
        """Test entity creation with validation error"""
        invalid_entity = {
            # Missing required 'type' field
            'displayName': 'Invalid Equipment'
        }
        
        response = client.post(
            '/api/v1/entities',
            json=invalid_entity,
            headers=auth_headers
        )
        
        assert response.status_code == 422
        assert 'error' in response.json
```

### Data Access Layer Tests

```python
class TestDataRepository:
    
    @pytest.fixture
    def db_connection(self):
        # Create test database connection
        conn = create_test_db()
        yield conn
        conn.close()
    
    @pytest.fixture
    def data_repo(self, db_connection):
        return DataRepository(db_connection)
    
    def test_get_time_series_data(self, data_repo):
        """Test retrieving time-series data"""
        entity_id = 'test-entity-1'
        data_point_id = 'temperature'
        start_time = datetime(2025, 1, 1, 0, 0, 0)
        end_time = datetime(2025, 1, 1, 23, 59, 59)
        
        data = data_repo.get_time_series_data(
            entity_id, data_point_id, start_time, end_time
        )
        
        assert data is not None
        assert 'dataPoints' in data
        assert len(data['dataPoints']) > 0
    
    def test_write_time_series_data(self, data_repo):
        """Test writing time-series data"""
        entity_id = 'test-entity-1'
        data_point_id = 'temperature'
        values = [
            {'timestamp': '2025-01-15T12:00:00Z', 'value': 25.5, 'quality': 'Good'},
            {'timestamp': '2025-01-15T12:01:00Z', 'value': 25.7, 'quality': 'Good'}
        ]
        
        success = data_repo.write_time_series_data(
            entity_id, data_point_id, values
        )
        
        assert success is True
```

## Integration Testing

### API Integration Tests

```python
class TestEntityAPIIntegration:
    """Integration tests against real database"""
    
    @pytest.fixture(scope='class')
    def test_db(self):
        """Set up test database"""
        db = create_test_database()
        populate_test_data(db)
        yield db
        db.drop_all()
        db.close()
    
    @pytest.fixture
    def client(self, test_db):
        app.config['TESTING'] = True
        app.config['DATABASE_URI'] = test_db.uri
        with app.test_client() as client:
            yield client
    
    @pytest.fixture
    def auth_token(self, client):
        """Get authentication token"""
        response = client.post('/api/v1/auth/token', json={
            'username': 'test_user',
            'password': 'test_password'
        })
        return response.json['access_token']
    
    def test_full_entity_lifecycle(self, client, auth_token):
        """Test complete entity lifecycle"""
        headers = {'Authorization': f'Bearer {auth_token}'}
        
        # Create entity
        new_entity = {
            'type': 'Equipment',
            'displayName': 'Integration Test Equipment',
            'attributes': {
                'manufacturer': 'Test Corp',
                'model': 'TEST-100'
            }
        }
        
        create_response = client.post(
            '/api/v1/entities',
            json=new_entity,
            headers=headers
        )
        assert create_response.status_code == 201
        entity_id = create_response.json['id']
        
        # Retrieve entity
        get_response = client.get(
            f'/api/v1/entities/{entity_id}',
            headers=headers
        )
        assert get_response.status_code == 200
        assert get_response.json['displayName'] == new_entity['displayName']
        
        # Update entity
        update_data = {'displayName': 'Updated Equipment'}
        update_response = client.put(
            f'/api/v1/entities/{entity_id}',
            json=update_data,
            headers=headers
        )
        assert update_response.status_code == 200
        assert update_response.json['displayName'] == 'Updated Equipment'
        
        # Delete entity
        delete_response = client.delete(
            f'/api/v1/entities/{entity_id}',
            headers=headers
        )
        assert delete_response.status_code == 204
        
        # Verify deletion
        verify_response = client.get(
            f'/api/v1/entities/{entity_id}',
            headers=headers
        )
        assert verify_response.status_code == 404
    
    def test_time_series_data_workflow(self, client, auth_token):
        """Test time-series data read/write workflow"""
        headers = {'Authorization': f'Bearer {auth_token}'}
        entity_id = 'test-entity-with-data'
        
        # Write data
        write_data = {
            'dataPointId': 'temperature',
            'values': [
                {
                    'timestamp': '2025-01-15T12:00:00Z',
                    'value': 25.5,
                    'quality': 'Good'
                },
                {
                    'timestamp': '2025-01-15T12:01:00Z',
                    'value': 25.7,
                    'quality': 'Good'
                }
            ]
        }
        
        write_response = client.post(
            f'/api/v1/entities/{entity_id}/data',
            json=write_data,
            headers=headers
        )
        assert write_response.status_code == 201
        
        # Read data
        read_response = client.get(
            f'/api/v1/entities/{entity_id}/data?dataPoint=temperature&startTime=2025-01-15T00:00:00Z',
            headers=headers
        )
        assert read_response.status_code == 200
        assert len(read_response.json['dataPoints']) >= 2
```

## Performance Testing

### Load Testing with Locust

```python
from locust import HttpUser, task, between

class APIUser(HttpUser):
    wait_time = between(1, 3)
    
    def on_start(self):
        """Authenticate on start"""
        response = self.client.post('/api/v1/auth/token', json={
            'username': 'test_user',
            'password': 'test_password'
        })
        self.token = response.json()['access_token']
        self.headers = {'Authorization': f'Bearer {self.token}'}
    
    @task(3)
    def list_entities(self):
        """Test entity listing (most common operation)"""
        self.client.get(
            '/api/v1/entities?limit=100',
            headers=self.headers
        )
    
    @task(2)
    def get_entity(self):
        """Test single entity retrieval"""
        self.client.get(
            '/api/v1/entities/test-entity-1',
            headers=self.headers
        )
    
    @task(1)
    def get_entity_data(self):
        """Test time-series data retrieval"""
        self.client.get(
            '/api/v1/entities/test-entity-1/data?startTime=2025-01-15T00:00:00Z',
            headers=self.headers
        )
    
    @task(1)
    def create_entity(self):
        """Test entity creation"""
        self.client.post(
            '/api/v1/entities',
            json={
                'type': 'Equipment',
                'displayName': f'Load Test Entity {self.environment.runner.user_count}'
            },
            headers=self.headers
        )
```

Run load test:
```bash
locust -f load_test.py --host=https://api.example.com
```

### Stress Testing

```python
import concurrent.futures
import time
import requests

def make_request(endpoint: str, token: str):
    """Make a single API request"""
    start = time.time()
    try:
        response = requests.get(
            f'https://api.example.com{endpoint}',
            headers={'Authorization': f'Bearer {token}'}
        )
        duration = time.time() - start
        return {
            'status': response.status_code,
            'duration': duration,
            'success': response.status_code == 200
        }
    except Exception as e:
        return {
            'status': 0,
            'duration': time.time() - start,
            'success': False,
            'error': str(e)
        }

def stress_test(endpoint: str, num_requests: int, concurrency: int):
    """Stress test an endpoint"""
    token = get_auth_token()
    
    results = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=concurrency) as executor:
        futures = [
            executor.submit(make_request, endpoint, token)
            for _ in range(num_requests)
        ]
        
        for future in concurrent.futures.as_completed(futures):
            results.append(future.result())
    
    # Analyze results
    success_count = sum(1 for r in results if r['success'])
    avg_duration = sum(r['duration'] for r in results) / len(results)
    max_duration = max(r['duration'] for r in results)
    
    print(f"Success rate: {success_count/num_requests*100:.1f}%")
    print(f"Average duration: {avg_duration*1000:.2f}ms")
    print(f"Max duration: {max_duration*1000:.2f}ms")

# Run stress test
stress_test('/api/v1/entities', num_requests=1000, concurrency=100)
```

## Test Coverage

### Measuring Test Coverage

```bash
# Install coverage tool
pip install coverage

# Run tests with coverage
coverage run -m pytest tests/

# Generate report
coverage report

# Generate HTML report
coverage html
```

### Coverage Configuration

```ini
# .coveragerc
[run]
source = src
omit =
    */tests/*
    */migrations/*
    */venv/*

[report]
precision = 2
show_missing = True
skip_covered = False

[html]
directory = coverage_html
```

## Test Data Management

### Fixtures and Factories

```python
import factory
from datetime import datetime, timedelta

class EntityFactory(factory.Factory):
    class Meta:
        model = dict
    
    id = factory.Sequence(lambda n: f'entity-{n}')
    type = 'Equipment'
    displayName = factory.Sequence(lambda n: f'Equipment {n}')
    namespace = 'urn:test:namespace'
    created = factory.LazyFunction(datetime.utcnow)

class DataPointFactory(factory.Factory):
    class Meta:
        model = dict
    
    timestamp = factory.LazyFunction(lambda: datetime.utcnow().isoformat() + 'Z')
    value = factory.Faker('pyfloat', min_value=0, max_value=100)
    quality = 'Good'

# Usage in tests
def test_with_factory(client):
    entity = EntityFactory()
    data_points = [DataPointFactory() for _ in range(10)]
    
    # Use in test...
```

## Continuous Integration

### GitHub Actions Example

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          pip install pytest pytest-cov
      
      - name: Run tests
        run: |
          pytest --cov=src --cov-report=xml
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost/test_db
          REDIS_URL: redis://localhost:6379
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage.xml
```

## Best Practices

1. **Write tests first** (TDD approach)
2. **Test happy paths and error cases**
3. **Use fixtures** for common test data
4. **Mock external dependencies** in unit tests
5. **Test against real database** in integration tests
6. **Measure and maintain high coverage** (aim for 80%+)
7. **Run tests in CI/CD pipeline**
8. **Performance test** under realistic load
9. **Use factories** for test data generation
10. **Keep tests fast** and independent
