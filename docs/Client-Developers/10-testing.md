# Testing Your Client Application

## Testing Your Client Application

### Unit Testing with Mock API

```javascript
// mockApiClient.js
export const createMockClient = () => ({
  getObjects: jest.fn().mockResolvedValue([
    { elementId: '1', typeId: 'Machine', displayName: 'Machine A' }
  ]),

  getObjectValue: jest.fn().mockResolvedValue({
    elementId: '1',
    value: 100,
    timestamp: '2025-01-15T12:00:00Z',
    quality: 'Good'
  })
});

// test.spec.js
import { createMockClient } from './mockApiClient';

test('should fetch objects successfully', async () => {
  const client = createMockClient();
  const objects = await client.getObjects();

  expect(objects).toHaveLength(1);
  expect(objects[0].displayName).toBe('Machine A');
});
```

### Integration Testing

```javascript
describe('i3X API Integration', () => {
  let client;
  let testElementId;

  beforeAll(async () => {
    client = new I3XAPIClient({
      baseUrl: process.env.TEST_API_URL,
      credentials: {
        username: process.env.TEST_USERNAME,
        password: process.env.TEST_PASSWORD
      }
    });

    // Get a test object
    const objects = await client.getObjects();
    testElementId = objects[0].elementId;
  });

  test('should read object value', async () => {
    const value = await client.getObjectValue(testElementId);
    expect(value).toBeDefined();
    expect(value.elementId).toBe(testElementId);
  });
});
```

