---
sidebar_position: 2
---

# Frequently Asked Questions

## General

### What is i3X?

i3X (Industrial Information Interoperability eXchange) is an open, vendor-agnostic REST API specification for accessing contextualized manufacturing data. It defines a common interface that application developers can code against once and deploy against any compliant manufacturing platform — without rewriting integrations for each vendor.

Think of it as doing for industrial software what web browsers did for the internet: a standardized contract that lets applications run on top of any compatible backend.

### Who created i3X?

i3X is coordinated by [CESMII](https://www.cesmii.org), a U.S. Department of Energy-funded smart manufacturing institute. The working group includes HighByte, GE Appliances, Georgia-Pacific, Rockwell Automation, Inductive Automation, AWS, Microsoft, Siemens, and ThinkIQ, among others.

### Is i3X free to use?

Yes. The specification is open source under the MIT license. The GitHub repository, OpenAPI specification, demo server, i3X Explorer tool, and Python client library are all freely available.

### What problem does i3X solve?

Manufacturing software stacks are fragmented. A typical facility runs historians, MES systems, quality platforms, and maintenance tools from different vendors — each with its own proprietary API. This forces application developers to write custom integrations for every platform combination, making apps non-portable and driving up integration costs for everyone.

i3X defines a single, stable API surface so an application written against it can run on any compliant platform without modification.

### How is i3X related to MQTT or Sparkplug/B?

MQTT is primarily concerned with the movement of event-based data. Sparkplug/B provides a common structure (namespace) for device data over MQTT.

i3X is primarily concerned with the discovery of the intended structure of data, the relationships between structured instances, and the current and historical values of data. MQTT has no mechanism for discovery (querying), structural declaration (types), or history. Implementing i3X with MQTT can only partially fulfill the requirements of the interface, meaning that implementations must co-ordinate complementary data sources, unifying the data structures and keys, to fully realise i3X.

In other words, i3X can use MQTT, but MQTT alone is not enough for i3X. This common API raises the minimum bar for information access.

### How is i3X related to OPC UA and the OPC UA Web API?

A thorough OPC UA implementation provides more type-safety, better type definitions, more explicit relationship types, structured events (alarms) and history, and security and access considerations, all over a standard interface that supports binary communication -- and with the Web API, REST-style communication. In other words, OPC UA provides more capabilities than i3X -- but at a higher level of complexity, and with more challenges to implement.

i3X aims to provide a simplified interface that can be bound to an OPC UA server as one of the options for a back-end data source. However i3X does not *require* OPC UA. As such, it allows an implementation to have some of the key features of OPC UA, without the requirements of a full OPC UA server implementation.

### What is the current status of i3X?

i3X is in **pre-release Alpha** (as of early 2026). API signatures are largely stable, but response structures may change through Q1 2026. It is suitable for prototyping, development, and evaluation. The public demo server at [https://i3x.cesmii.net](https://i3x.cesmii.net) is available for testing.

### How do I report a bug or request a feature?

Open an issue on the [GitHub repository](https://github.com/cesmii/api/issues). For non-GitHub feedback, email [rfc@cesmii.org](mailto:rfc@cesmii.org).

### How do I get involved in the working group?

Review the contributing guidelines in `Contributing.md` in the [GitHub repo](https://github.com/cesmii/api). For broader involvement with the CESMII initiative, visit [www.cesmii.org](https://www.cesmii.org).

### Where can I find the formal specification?

The RFC specification document is a work in progress, developed publicly in the [cesmii/api GitHub repository](https://github.com/cesmii/api). The live OpenAPI specification with interactive docs is at [https://i3x.cesmii.net/docs](https://i3x.cesmii.net/docs).

### Where can I find more information?

- **Quick Start**: [quickstart.md](quickstart.md)
- **i3X Home**: [https://www.i3x.dev](https://www.i3x.dev)
- **GitHub**: [https://github.com/cesmii/api](https://github.com/cesmii/api)
- **CESMII**: [https://www.cesmii.org](https://www.cesmii.org)