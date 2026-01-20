# Client Developer Guide - Overview

## Overview

The i3X API provides a standardized interface for accessing and manipulating manufacturing data across diverse platforms. This guide is designed for application developers building clients that consume the API to create analytics, visualizations, notifications, and machine learning applications.

## Purpose and Scope

i3x aims to solve the fragmentation problem in manufacturing information systems by providing a common set of server primitives that enable application portability across different platform implementations. This means you can write your application once and deploy it against any platform that implements this API specification.

### Key Benefits for Client Developers

- **Platform Independence**: Build applications that work across multiple manufacturing information platforms
- **Standardized Interface**: Consistent API contracts reduce integration complexity
- **Contextualized Data**: Access to properly structured and contextualized manufacturing data
- **Application Portability**: Deploy the same application across different manufacturing environments

## Architecture Context

i3X operates within the application layer of the manufacturing technology stack:

```
┌─────────────────────────────────────┐
│   Applications (Your Client)        │
│   - Analytics                       │
│   - Visualization                   │
│   - ML/AI                           │
│   - Notifications                   │
└─────────────────────────────────────┘
              ↓ ↑
┌─────────────────────────────────────┐
│   i3X API                           │
└─────────────────────────────────────┘
              ↓ ↑
┌─────────────────────────────────────┐
│   Platform Layer                    │
│   (Historian/MES/MOM/EMI/Broker)    │
└─────────────────────────────────────┘
```

The API assumes that data has already been contextualized by underlying platform functions, making it ready for consumption by applications. If a combination of platforms is used, the API assumes those packages are using a Unified Namespace.

## Getting Started

### Demo Environment

A public prototype endpoint is available for testing and development:

- **Base URL**: `https://i3x.cesmii.net`
- **Documentation**: `https://i3x.cesmii.net/docs`

### Prerequisites

Before you begin developing against the i3X, ensure you have:

1. Understanding of RESTful API principles
2. Familiarity with manufacturing data concepts
3. Knowledge of OPC UA Information Models (recommended)
4. Understanding of Smart Manufacturing Profiles (SM Profiles)

## Documentation Structure

This client developer guide is organized into the following categories:

1. **[Authentication](01-authentication.md)** - Authentication flows and token management
2. **[Core Concepts](02-core-concepts.md)** - SM Profiles and contextualized data
3. **[API Usage](03-api-usage.md)** - Common operations and usage patterns
4. **[Data Models](04-data-models.md)** - Object model and time-series data structures
5. **[Best Practices](05-best-practices.md)** - Error handling, caching, and rate limiting
6. **[Integration](06-integration.md)** - Framework-specific integration patterns
7. **[Performance](07-performance.md)** - Optimization techniques
8. **[Troubleshooting](08-troubleshooting.md)** - Common issues and solutions
9. **[Security](09-security.md)** - Security best practices
10. **[Testing](10-testing.md)** - Testing strategies
11. **[Resources](11-resources.md)** - Community support and references

## Quick Links

- **Demo Server**: https://i3x.cesmii.net
- **API Documentation**: https://i3x.cesmii.net/docs
- **RFC Specification**: https://github.com/cesmii/API
- **Community Email**: rfc@cesmii.org
