---
sidebar_position: 2
---

# Frequently Asked Questions

## General

### What is i3X?

i3X (Industrial Information Interoperability eXchange) is an open, vendor-agnostic REST API specification for accessing contextualized manufacturing data. It defines a common interface that application developers can code against once and deploy against any compliant manufacturing platform — without rewriting integrations for each vendor.

Think of it as doing for industrial software what web browsers did for the internet: a standardized contract that lets applications run on top of any compatible backend.

### Who created i3X?

i3X is coordinated by [CESMII](https://www.cesmii.org) (Clean Energy Smart Manufacturing Innovation Institute), a U.S. Department of Energy-funded smart manufacturing institute. The working group includes HighByte, GE Appliances, Georgia-Pacific, Rockwell Automation, Inductive Automation, AWS, Microsoft, Siemens, and ThinkIQ, among others.

### Is i3X free to use?

Yes. The specification is open source under the MIT license. The GitHub repository, OpenAPI specification, demo server, i3X Explorer tool, and Python client library are all freely available.

### What problem does i3X solve?

Manufacturing software stacks are fragmented. A typical facility runs historians, MES systems, quality platforms, and maintenance tools from different vendors — each with its own proprietary API. This forces application developers to write custom integrations for every platform combination, making apps non-portable and driving up integration costs for everyone.

i3X defines a single, stable API surface so an application written against it can run on any compliant platform without modification.

### What is the current status of i3X?

i3X is in **pre-release Alpha** (as of early 2026). API signatures are largely stable, but response structures may change through Q1 2026. It is suitable for prototyping, development, and evaluation. The public demo server at [https://i3x.cesmii.net](https://i3x.cesmii.net) is available for testing.

---

## Getting Started

### How do I try i3X without setting anything up?

A public demo server with sample manufacturing data is available at [https://i3x.cesmii.net](https://i3x.cesmii.net). You can:

- Browse the interactive Swagger API docs at [https://i3x.cesmii.net/docs](https://i3x.cesmii.net/docs)
- Download [i3X Explorer](https://acetechnologies.net/i3X/) and connect it to `https://i3x.cesmii.net`

No account or credentials required.

### Is there a GUI tool for exploring an i3X server?

Yes. **i3X Explorer** is a free, cross-platform desktop client built by ACE Technologies. It lets you browse namespaces, object types, hierarchies, and live/historical values from any compliant i3X server. Download it at [https://acetechnologies.net/i3X/](https://acetechnologies.net/i3X/).

### Is there a Python library for building clients?

Yes. Install `i3x-client` from PyPI:

```bash
pip install i3x-client
```

```python
import i3x

client = i3x.Client("https://i3x.cesmii.net")
client.connect()

namespaces = client.get_namespaces()
value = client.get_value("element-id-1")
print(value.data[0].value, value.data[0].quality)

client.disconnect()
```

See the [PyPI project page](https://pypi.org/project/i3x-client/) and [source code](https://github.com/cesmii/python-i3x-client) for full documentation.

### How do I run my own i3X server?

Clone the repo and run the included demo server (requires Python 3):

```bash
git clone https://github.com/cesmii/i3X.git
cd i3x/demo/server
cp config.mqtt.json config.json
./setup.sh       # Mac/Linux/WSL
# or
./setup.ps1      # Windows PowerShell
```

The server starts on `http://localhost:8080`. See the [Quick Start](quickstart.md) for a full walkthrough.

---

## Core Concepts

### What is a Namespace?

A Namespace is a logical scope that groups related ObjectTypes and Objects, identified by a URI. It functions similarly to a namespace in programming — preventing name collisions and providing organizational context for a set of related manufacturing concepts.

### What is an ObjectType?

An ObjectType is a schema definition for a class of manufacturing things — a pump, a temperature sensor, a production order. ObjectTypes are based on OPC UA Information Models and define the structure that Object instances must conform to.

### What is an Object?

An Object is an instance of an ObjectType — an actual pump, an actual sensor reading, an actual order on the shop floor. Objects have a unique `elementId`, live within a namespace, and can have parent/child relationships with other objects.

### What is a VQT?

VQT stands for **Value-Quality-Timestamp**. It is the standard structure used to represent data point readings in i3X. Every value returned from the API includes:

- `value` — the actual data
- `quality` — an indicator of data reliability (good, bad, uncertain)
- `timestamp` — when the value was recorded

### What are the three types of relationships?

| Type | Description | Example |
|------|-------------|---------|
| **Hierarchical** | Organizational parent/child structure | Plant → Area → Line → Machine |
| **Composition** | How a complex object is assembled from parts (each part has its own ObjectType) | Pump composed of Motor + Impeller + Seal |
| **Graph** | Any other named relationship between objects | `CanFeed`, `MonitoredBy`, `SuppliedBy` |

Hierarchical and Composition relationships are required; Graph relationships are optional and platform-dependent.

### What is an ElementId?

An `elementId` is the unique string identifier for any element in the address space — whether it's a namespace, type, object, or relationship type. Use it to refer to specific elements across API calls.

### What are Smart Manufacturing Profiles (SM Profiles)?

SM Profiles are OPC UA Information Model type definitions that describe manufacturing equipment in a standardized, semantically rich way — including identification metadata, runtime data structure, and behavioral contracts. Applications that understand a given SM Profile can work with any object that implements it, across any compliant platform.

---

## API Operations

### What can I do with the i3X API?

The API supports four categories of operations:

**Explore** — Discover the data model
- List namespaces, object types, relationship types, and objects
- Traverse relationships between objects

**Query** — Read data
- Get current (last-known) values for one or more objects
- Retrieve time-series history within a time range
- Support for depth-controlled traversal of compositional hierarchies

**Update** — Write data (where the platform permits)
- Update current values
- Modify historical records

**Subscribe** — Real-time streaming
- Create subscriptions with QoS 0 (streaming via Server-Sent Events) or QoS 2 (guaranteed delivery with pull sync)
- Register/unregister specific objects to monitor

### Does i3X support real-time data streaming?

Yes. The subscription system supports two modes:

- **QoS 0 (streaming)**: Connect to the SSE stream endpoint (`GET /subscriptions/{id}/stream`) for continuous real-time updates
- **QoS 2 (guaranteed delivery)**: Updates are queued server-side and pulled via `POST /subscriptions/{id}/sync`

### Does i3X support writing data back to the platform?

Yes, where the underlying platform permits it. `PUT /objects/{elementId}/value` updates a current value; `PUT /objects/{elementId}/history` modifies historical records. Support for write operations is implementation-dependent.

---

## For Client Developers

### Can I write one app and deploy it against any i3X server?

That is the primary goal of i3X. Any application written against the i3X specification should work against any compliant server implementation without modification. Platform-specific features (write support, specific relationship types) may vary, but the core data model and query operations are standardized.

### What languages does i3X support?

The specification itself is language-agnostic — it's a REST API over HTTP. Any language capable of making HTTP requests can consume an i3X server. A Python client library (`i3x-client`) is officially available. The OpenAPI specification at [https://i3x.cesmii.net/docs](https://i3x.cesmii.net/docs) can be used to generate client stubs for most languages.

### How does authentication work?

Authentication is implementation-dependent, but the API specification supports standard patterns including Bearer token authentication and OAuth 2.0. Consult the specific server's documentation for its auth requirements. The public demo server at `https://i3x.cesmii.net` does not require authentication.

### Where can I see real API requests and responses?

i3X Explorer has a built-in **Developer Tools** button that shows all network requests and responses between the client and server — useful for understanding the exact API shapes. You can also explore the Swagger UI at [https://i3x.cesmii.net/docs](https://i3x.cesmii.net/docs) and execute live calls.

---

## For Server Developers (Implementers)

### What types of platforms can implement i3X?

i3X is designed for implementation by:

- Historians (OSI Pi, Rockwell, etc.)
- Manufacturing Execution Systems (MES)
- Manufacturing Operations Management (MOM) systems
- Enterprise Manufacturing Intelligence (EMI) platforms
- Data brokers and MQTT/Sparkplug-B servers
- Smart Manufacturing Innovation Platforms (SMIP)
- Custom manufacturing information systems

### What is required to be a compliant i3X server?

A compliant implementation must support:

- **Object management**: Expose objects, object types, namespaces, and relationship types; support hierarchical and compositional relationships
- **Data access**: Return current values (with quality and timestamp) and historical time-series data; support aggregations and time range filtering
- **Subscriptions**: Support SSE streaming (QoS 0) and/or queued sync (QoS 2)
- **Authentication**: Secure API access with token-based authentication and role-based access control
- **HTTP compliance**: Proper status codes, pagination, JSON responses, ISO 8601 timestamps

See the [Server Developer Guide](Server-Developers/00-overview.md) and the [Requirements](Server-Developers/01-requirements.md) page for the full compliance checklist.

### Are write operations required?

No. Write operations (`PUT /objects/{elementId}/value` and `PUT /objects/{elementId}/history`) are part of the specification but not all platforms support bidirectional data flow. Implement them where your underlying data store permits.

### Is there a reference server implementation to look at?

Yes. The demo server in the [i3X GitHub repo](https://github.com/cesmii/i3X) (`/demo/server`) is a working Python reference implementation with an MQTT adapter. It's a good starting point for understanding the expected behavior of a compliant server.

---

## Community & Contribution

### How do I report a bug or request a feature?

Open an issue on the [GitHub repository](https://github.com/cesmii/api/issues). For non-GitHub feedback, email [rfc@cesmii.org](mailto:rfc@cesmii.org).

### How do I get involved in the working group?

Review the contributing guidelines in `Contributing.md` in the [GitHub repo](https://github.com/cesmii/api). For broader involvement with the CESMII initiative, visit [www.cesmii.org](https://www.cesmii.org).

### Where can I find the formal specification?

The RFC specification document is maintained in the [cesmii/api GitHub repository](https://github.com/cesmii/api). The live OpenAPI specification with interactive docs is at [https://i3x.cesmii.net/docs](https://i3x.cesmii.net/docs).

### Where can I find more documentation?

- **Quick Start**: [quickstart.md](quickstart.md)
- **Client Developer Guide**: [Client-Developers/00-overview.md](Client-Developers/00-overview.md)
- **Server Developer Guide**: [Server-Developers/00-overview.md](Server-Developers/00-overview.md)
- **Demo Server**: [https://i3x.cesmii.net](https://i3x.cesmii.net)
- **GitHub**: [https://github.com/cesmii/api](https://github.com/cesmii/api)
- **i3X Explorer**: [https://acetechnologies.net/i3X/](https://acetechnologies.net/i3X/)
