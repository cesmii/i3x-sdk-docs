# Testing Your Client Application

## Testing Your Client Application

### Unit Testing with Mock API

```javascript
// mockApiClient.js
export const createMockClient = () => ({
  getEntities: jest.fn().mockResolvedValue([
    { id: '1', type: 'Machine', displayName: 'Machine A' }
  ]),
  
  getEntityData: jest.fn().mockResolvedValue({
    entityId: '1',
    dataPoints: [
      { timestamp: '2025-01-15T12:00:00Z', value: 100 }
    ]
  })
});

// test.spec.js
import { createMockClient } from './mockApiClient';

test('should fetch entities successfully', async () => {
  const client = createMockClient();
  const entities = await client.getEntities();
  
  expect(entities).toHaveLength(1);
  expect(entities[0].displayName).toBe('Machine A');
});
```

### Integration Testing

```javascript
describe('CM Information API Integration', () => {
  let client;
  let testEntityId;
  
  beforeAll(async () => {
    client = new CMInformationAPIClient({
      baseUrl: process.env.TEST_API_URL,
      credentials: {
        username: process.env.TEST_USERNAME,
        password: process.env.TEST_PASSWORD
      }
    });
    
    // Create a test entity
    const response = await client.createEntity({
      type: 'TestEntity',
      displayName: 'Integration Test Entity'
    });
    testEntityId = response.id;
  });
  
  afterAll(async () => {
    // Clean up test entity
    await client.deleteEntity(testEntityId);
  });
  
  test('should read entity data', async () => {
    const data = await client.getEntityData(testEntityId);
    expect(data).toBeDefined();
    expect(data.entityId).toBe(testEntityId);
  });
});
```

