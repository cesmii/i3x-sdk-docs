---
sidebar_position: 1
---

# i3X: Industrial Information Interface eXchange

## What is i3X?

i3X is a **vendor-agnostic REST API specification** for accessing contextualized manufacturing data. Developed by CESMII, it provides a standardized interface that enables applications to work across different manufacturing information platforms—Historians, MES, MOM, EMI systems, and MQTT/Sparkplug-B brokers—without vendor lock-in.

**The Core Problem:** Manufacturing data exists across fragmented, vendor-specific systems. Building applications requires custom integrations for each platform, preventing portability and ecosystem growth.

**The i3X Solution:** A common API layer that abstracts platform implementations, similar to how POSIX standardized computing interfaces. Write once, deploy against any compliant platform.

## Key Concepts

| Concept | Description |
|---------|-------------|
| **Namespace** | Logical scope grouping related types and instances (identified by URI) |
| **ObjectType** | Schema definition for a class of objects (machines, sensors, orders) |
| **Object** | An instance with attributes, values, and hierarchical organization |
| **RelationshipType** | Connection definition between objects (HasParent, HasComponent, custom) |
| **ElementId** | Unique string identifier for any element in the address space |
| **VQT** | Value-Quality-Timestamp structure for all data values |

## API Operations

**Explore** — Discover the data model
- `GET /namespaces` — List available namespaces
- `GET /objecttypes` — Get type schemas (filterable by namespace)
- `GET /objects` — List instances (filterable by TypeId)
- `POST /objects/related` — Traverse relationships between objects

**Query** — Read current and historical data
- `POST /objects/value` — Get last known values (with optional depth for composition)
- `POST /objects/history` — Retrieve time-series data within a range

**Update** — Write data back to the platform
- `PUT /objects/{elementId}/value` — Update current value
- `PUT /objects/{elementId}/history` — Modify historical records

**Subscribe** — Real-time data streaming
- `POST /subscriptions` — Create subscription (QoS 0: streaming, QoS 2: guaranteed delivery)
- `GET /subscriptions/{id}/stream` — Server-Sent Events for live updates
- `POST /subscriptions/{id}/sync` — Pull queued updates for QoS 2

## Data Model

Objects are hierarchically organized with composition support:

```
Namespace (URI)
└── ObjectType (schema)
    └── Object (instance)
        ├── Attributes (metadata: DisplayName, ParentId, NamespaceURI)
        └── Values (VQT: value, quality, timestamp)
            └── Child Objects (composition, controllable via maxDepth)
```

Relationships enable flexible connections: organizational hierarchy (HasParent/HasChildren), composition (HasComponent/ComponentOf), and custom relationships for supply chains, equipment trains, and qualifications.

## Quick Start

**Demo Environment:** `https://i3x.cesmii.net`
- API Documentation: `https://i3x.cesmii.net/docs` (Swagger UI)
- OpenAPI Spec: `https://i3x.cesmii.net/openapi.json`

**Basic Discovery Pattern:**
1. `GET /namespaces` → Identify available data scopes
2. `GET /objecttypes?namespaceUri={ns}` → Understand the type schema
3. `GET /objects?typeId={type}` → List instances of interest
4. `POST /objects/value` with ElementIds → Retrieve current values

## Developer Audiences

| Audience | Goal | Documentation |
|----------|------|---------------|
| **Client Developers** | Build applications consuming i3X APIs | Authentication, core concepts, usage patterns, best practices |
| **Server Developers** | Implement i3X on your platform | Requirements, data models, implementation patterns, compliance testing |

## RFC

This API is being built by the community following an Internet RFC-style process. For more background, please review the RFC on GitHub.

**RFC Document:** [github.com/cesmii/i3X](https://github.com/cesmii/i3X)


## Design Principles

1. **Portability** — Applications work across any compliant implementation
2. **Simplicity** — RESTful JSON API with intuitive resource hierarchy
3. **Composition** — Native support for nested structures with depth control
4. **Temporal Awareness** — First-class support for time-series and historical data
5. **Quality Metadata** — OPC UA-compatible quality indicators on all values
6. **Technology Agnostic** — Complements OPC UA, UNS/MQTT, and proprietary APIs
