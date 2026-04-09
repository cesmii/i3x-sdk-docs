# Requirements

## Implementation Requirements

### Core Capabilities

Your implementation MUST support:

#### 1. Health Check and Discovery

- **Server Info**: Expose `GET /info` with no authentication required. Returns spec version, server metadata, and capabilities. Used as a health check and for client capability discovery.

#### 2. Object Management

- **Object Types**: Provide schemas for object types based on OPC UA Information Models
- **Object Discovery**: Expose available manufacturing objects (equipment, processes, etc.)
- **Hierarchical Relationships**: Support parent-child relationships via `parentId`
- **Compositional Relationships**: Support `isComposition` flag for component hierarchies

#### 3. Data Access

- **Current Values**: Retrieve the latest values for object attributes via `POST /objects/value`
- **Data Quality**: Include quality indicators with all data points (one of: `Good`, `GoodNoData`, `Bad`, `Uncertain`)
- **Bulk Operations**: All query endpoints accept arrays of `elementIds`

#### 4. Authentication & Authorization

- **Token-based Access**: Secure API access with token-based authentication
- **Encryption**: HTTPS only in production; TLS 1.2 or higher recommended
- **Info Exempt**: `GET /info` must be accessible without authentication

#### 5. Response Format

All responses must use the standard envelope:

```json
{ "success": true, "result": <data> }
```
or
```json
{ "success": false, "error": { "code": <http-status>, "message": "<description>" } }
```

Bulk operations return:
```json
{
  "success": true,
  "results": [
    { "success": true, "elementId": "...", "result": <data>, "error": null },
    { "success": false, "elementId": "...", "result": null, "error": { "code": 404, "message": "..." } }
  ]
}
```

The top-level `success` is false if any item fails. Results match request order and size.

#### 6. Performance & Scalability

- **Performance**: Maintain performant responses, implementing pagination or truncation only where necessary
- **Concurrent Connections**: Handle multiple simultaneous client connections

### Optional Capabilities

Your implementation MAY support (advertise in `GET /info` capabilities):

- **Historical Data** (`capabilities.query.history`): Query time-series data with time range filters via `POST /objects/history`
- **Write Current Values** (`capabilities.update.current`): Accept `PUT /objects/{elementId}/value`
- **Write Historical Values** (`capabilities.update.history`): Accept `PUT /objects/{elementId}/history`
- **Streaming Subscriptions** (`capabilities.subscribe.stream`): SSE streaming via `POST /subscriptions/stream`
- **Graph Relationships**: Relationships beyond hierarchical and compositional

## API Specification Compliance

### RESTful Endpoint Structure

```
Base URL: https://your-platform.example.com/v1/

Info:
  GET    /info                         # Server info and capabilities (no auth)

Explore Endpoints:
  GET    /namespaces                   # List all namespaces
  GET    /objecttypes                  # List object type schemas
  POST   /objecttypes/query            # Query types by elementId(s)
  GET    /relationshiptypes            # List relationship types
  POST   /relationshiptypes/query      # Query relationship types by elementId(s)
  GET    /objects                      # List all objects
  POST   /objects/list                 # Get objects by elementId(s)
  POST   /objects/related              # Get related objects

Query Endpoints:
  POST   /objects/value                # Get current values for object(s)
  POST   /objects/history              # Get historical values with time range  [optional]
  GET    /objects/{elementId}/history  # Get historical values for one object   [optional]

Update Endpoints:
  PUT    /objects/{elementId}/value    # Update object's current value          [optional]
  PUT    /objects/{elementId}/history  # Update historical values               [optional]

Subscription Endpoints:
  POST   /subscriptions                # Create new subscription               [optional]
  POST   /subscriptions/list           # Retrieve subscription details         [optional]
  POST   /subscriptions/delete         # Delete subscriptions by ID            [optional]
  POST   /subscriptions/register       # Add monitored objects                 [optional]
  POST   /subscriptions/unregister     # Remove monitored objects              [optional]
  POST   /subscriptions/stream         # Open SSE stream                       [optional]
  POST   /subscriptions/sync           # Poll with sequence acknowledgment     [optional]
```

Note: Subscription management uses flat POST endpoints with `subscriptionId` in the request body — **not** per-subscription URL paths.

### HTTP Methods and Semantics

- **GET**: Retrieve resources (read-only)
- **POST**: Create resources or execute query/action operations
- **PUT**: Update a resource (idempotent)

### Standard HTTP Status Codes

```
2xx Success:
  200 OK              - Successful request
  206 Partial Content - Depth limit reached; partial results returned

4xx Client Errors:
  400 Bad Request     - Invalid request syntax or parameters
  401 Unauthorized    - Missing or invalid authentication
  403 Forbidden       - Insufficient permissions
  404 Not Found       - ElementId does not exist

5xx Server Errors:
  500 Internal Error  - Unexpected server error
  501 Not Implemented - Requested optional feature is not supported
```

**Important**: Return HTTP 206 (not 200) when `maxDepth` recursion is cut short by server limits. Return HTTP 501 for any optional endpoint not implemented, not HTTP 404.

## Compliance Checklist

### Required: Info & Discovery
- [ ] Server info endpoint (`GET /info`) — no auth required
- [ ] Returns `specVersion`, `serverVersion`, `serverName`, `capabilities`

### Required: Object Management
- [ ] List all objects (`GET /objects`)
- [ ] Retrieve objects by elementId (`POST /objects/list`)
- [ ] List object types (`GET /objecttypes`)
- [ ] Query object types by elementId (`POST /objecttypes/query`)
- [ ] Get related objects (`POST /objects/related`)
- [ ] Support hierarchical relationships via `parentId`
- [ ] Support compositional relationships via `isComposition`
- [ ] List namespaces (`GET /namespaces`)
- [ ] List relationship types (`GET /relationshiptypes`)
- [ ] Query relationship types by elementId (`POST /relationshiptypes/query`)

### Required: Data Access
- [ ] Get current values (`POST /objects/value`)
- [ ] Include `isComposition` in value responses
- [ ] Include `quality` (one of: Good, GoodNoData, Bad, Uncertain) and `timestamp`
- [ ] Support `maxDepth` for compositional hierarchies
- [ ] Return HTTP 206 when depth limit is server-imposed

### Required: Response Format
- [ ] All responses wrapped in `{success, result}` or `{success, error}` envelope
- [ ] Bulk responses use `{success, results: [{success, elementId, result, error}]}`
- [ ] Error format: `{success: false, error: {code, message}}`
- [ ] Use correct HTTP status codes

### Required: Authentication
- [ ] Implement token-based authentication
- [ ] Require HTTPS in production
- [ ] `GET /info` accessible without authentication
- [ ] Return 401/403 for auth failures

### Optional: Historical Data
- [ ] Query historical values (`POST /objects/history`)
- [ ] Query single-object history (`GET /objects/{elementId}/history`)
- [ ] Update historical values (`PUT /objects/{elementId}/history`)

### Optional: Value Updates
- [ ] Update current value (`PUT /objects/{elementId}/value`)

### Optional: Subscriptions
- [ ] Create subscription (`POST /subscriptions`) with `clientId`, `displayName`
- [ ] List subscriptions (`POST /subscriptions/list`)
- [ ] Delete subscriptions (`POST /subscriptions/delete`)
- [ ] Register monitored objects (`POST /subscriptions/register`)
- [ ] Unregister monitored objects (`POST /subscriptions/unregister`)
- [ ] SSE streaming (`POST /subscriptions/stream`)
- [ ] Sync with sequence numbers (`POST /subscriptions/sync`)

## Versioning Strategy

The i3X API uses semantic versioning. The URL version (`/v1`) only changes for breaking API modifications. Non-breaking additions do not require a version increment.

Advertise the spec version your implementation targets via `GET /info`:

```json
{
  "specVersion": "1.0",
  "serverVersion": "your-server-version",
  "serverName": "Your Platform Name",
  "capabilities": { ... }
}
```
