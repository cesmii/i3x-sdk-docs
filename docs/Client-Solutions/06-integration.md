# Integration Patterns

## Integration Patterns

### React/JavaScript Applications

```javascript
import { useEffect, useState } from 'react';

const useManufacturingData = (entityId) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getAuthToken();
        const entityData = await readEntityData(token, entityId);
        setData(entityData);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Set up polling or WebSocket subscription
    const interval = setInterval(fetchData, 30000); // Poll every 30 seconds
    
    return () => clearInterval(interval);
  }, [entityId]);
  
  return { data, loading, error };
};
```

### Python Applications

```python
import requests
from typing import Dict, List, Optional
from datetime import datetime, timedelta

class CMInformationAPIClient:
    def __init__(self, base_url: str, credentials: Dict[str, str]):
        self.base_url = base_url
        self.token = self._authenticate(credentials)
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {self.token}',
            'Content-Type': 'application/json'
        })
    
    def _authenticate(self, credentials: Dict[str, str]) -> str:
        response = requests.post(
            f'{self.base_url}/auth/token',
            json=credentials
        )
        response.raise_for_status()
        return response.json()['access_token']
    
    def get_entities(self, filter_params: Optional[Dict] = None) -> List[Dict]:
        response = self.session.get(
            f'{self.base_url}/api/entities',
            params=filter_params
        )
        response.raise_for_status()
        return response.json()
    
    def get_entity_data(
        self, 
        entity_id: str, 
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None
    ) -> Dict:
        params = {}
        if start_time:
            params['startTime'] = start_time.isoformat()
        if end_time:
            params['endTime'] = end_time.isoformat()
        
        response = self.session.get(
            f'{self.base_url}/api/entities/{entity_id}/data',
            params=params
        )
        response.raise_for_status()
        return response.json()

# Usage example
client = CMInformationAPIClient(
    'https://i3x.cesmii.net',
    {'username': 'user', 'password': 'pass'}
)

entities = client.get_entities()
data = client.get_entity_data(
    entities[0]['id'],
    start_time=datetime.now() - timedelta(hours=1)
)
```

