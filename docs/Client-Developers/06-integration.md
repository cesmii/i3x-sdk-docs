# Integration Patterns

## Integration Patterns

### React/JavaScript Applications

```javascript
import { useEffect, useState } from 'react';

const useManufacturingData = (elementId) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getAuthToken();
        const objectValue = await getObjectValue(token, elementId);
        setData(objectValue);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up polling or SSE subscription
    const interval = setInterval(fetchData, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, [elementId]);

  return { data, loading, error };
};
```

### Python Applications

```python
import requests
from typing import Dict, List, Optional
from datetime import datetime, timedelta

class I3XAPIClient:
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

    def get_objects(self, type_id: Optional[str] = None) -> List[Dict]:
        params = {}
        if type_id:
            params['typeId'] = type_id
        response = self.session.get(
            f'{self.base_url}/objects',
            params=params
        )
        response.raise_for_status()
        return response.json()

    def get_object_value(
        self,
        element_id: str,
        max_depth: int = 1
    ) -> Dict:
        response = self.session.post(
            f'{self.base_url}/objects/value',
            json={
                'elementId': element_id,
                'maxDepth': max_depth
            }
        )
        response.raise_for_status()
        return response.json()

    def get_object_history(
        self,
        element_id: str,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None
    ) -> Dict:
        payload = {'elementId': element_id}
        if start_time:
            payload['startTime'] = start_time.isoformat() + 'Z'
        if end_time:
            payload['endTime'] = end_time.isoformat() + 'Z'

        response = self.session.post(
            f'{self.base_url}/objects/history',
            json=payload
        )
        response.raise_for_status()
        return response.json()

# Usage example
client = I3XAPIClient(
    'https://i3x.cesmii.net',
    {'username': 'user', 'password': 'pass'}
)

objects = client.get_objects()
value = client.get_object_value(objects[0]['elementId'])
history = client.get_object_history(
    objects[0]['elementId'],
    start_time=datetime.now() - timedelta(hours=1)
)
```

