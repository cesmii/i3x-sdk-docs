---
sidebar_position: 1
---

# Introduction to CESMII and i3X

## What is CESMII?

**CESMII - The Smart Manufacturing Institute** is a public-private partnership and Manufacturing USA institute founded in 2016 in partnership with the U.S. Department of Energy's Office of Energy Efficiency and Renewable Energy. As the national institute focused on smart manufacturing, CESMII accelerates the adoption of advanced manufacturing technologies through research, development, and deployment of smart manufacturing solutions.

### Mission and Vision

CESMII's mission is to radically impact manufacturing performance through measurable improvements in:
- Quality
- Throughput
- Costs and profitability
- Safety
- Asset reliability
- Energy productivity

The institute works to democratize smart manufacturing, making advanced technologies accessible to manufacturers of all sizes across the United States manufacturing ecosystem.

## CESMII's Strategic Pillars

### New and Emerging Technology Development

CESMII drives innovation in enabling technologies for smart manufacturing:
- Advanced sensors
- Data analytics and modeling
- Industrial IoT platforms
- Automation and controls
- Artificial intelligence and machine learning

### Education & Workforce Development

CESMII democratizes smart manufacturing knowledge through:
- Training programs and certifications
- Curriculum development
- YouTube training videos
- Webinars and workshops
- Industry partnerships

### Digital Transformation

Supporting manufacturers in implementing smart manufacturing solutions:
- Normalizes data across diverse protocols
- Enforces reusable information models
- Provides guaranteed API contracts for application development
- Enables rapid, cost-effective deployment of smart manufacturing 

## CESMII's Technology Imperatives

In the pursuit of digital transformation, CESMII is vendor and technology agnostic, but defines three imperatives that must be applied to industrial data and information infrastructure in order for to be considered "smart":

### 1. Smart Manufacturing Profiles (SM Profiles)

The **Smart Manufacturing Profile™** concept requires standardized information models that describe manufacturing data sources and processes and information transactions between systems.

#### What are SM Profiles?

SM Profiles are typically implemented as OPC UA Information Model type definitions that provide:
- **Semantic Data Definitions**: Standardized descriptions of manufacturing assets
- **Runtime Data Structure**: How operational data is organized
- **Behavioral Contracts**: Expected interactions and capabilities

#### Benefits of SM Profiles

- **Interoperability**: Data from different vendors can be understood uniformly
- **Portability**: Applications written once work across multiple platforms
- **Semantic Understanding**: Data comes with meaning and context
- **Reduced Integration Costs**: Standard interfaces eliminate custom integration work

#### SM Profile Ecosystem

- **100+ Companion Specifications**: Created in partnership with VDMA and OPC Foundation
- **Cloud Library**: Free, open-source repository at uacloudlibrary.opcfoundation.org
- **Profile Designer**: Tools for creating and publishing SM Profiles
- **Marketplace**: Platform for discovering and sharing profiles at marketplace.cesmii.org

#### Other Approaches

- While OPC UA Information Models are typically delivered in a machine readable Nodeset format, other implementations have also been successful using JSON Schema, JSON-LD or a combination.
- Similarily, new innovations have demonstrated the ease of applying published Companion Specifications and member-contributed Nodesets in JSON for use in MQTT, or other event-based transports.

### 2. Smart Manufacturing Platforms

Another name for a SM Profile is a Class or Type definition. Since the late 60s, Information Technology systems have used Object Orientation to create reliable data structures. In most programming environments, these Objects are derived from a Type or Class definition. In relational database systems, pre-established structures have a different name: Schemas. Modern Operational Technology platforms can use any word for these concepts that they like, but must follow this pattern of establishing contracts for data (SM Profiles) and using those contracts to govern instances of the data (Objects).

Once data is contractually governed and made available as Objects, a Smart Platform should be able to persist relationships between these Objects.

#### Hierarchy

Industrial standards like ISA-95 are often interpreted as requiring an Asset Hierarchy showing how Asset objects are organized within an Enterprise. While this may be the beginning of a contextual model, hierarchical asset relationships are not the only kind of relationships that are required for a Smart Platform. In fact, ISA-95 specifies multiple kinds of relationships that are often not leveraged in contemporary information platforms.

Unified Namespace (UNS) approaches that use MQTT are often constrained by the hierarchical nature of a MQTT topic name. The / separation is frequently used to imply equipment relationships. Again, this is a *start* but must not be the *end* of capturing context. 

#### Knowledge Graphs

A popular term for capturing these additional relationships is a Knowledge Graph. It starts by providing a mechanism to declare and persist those connections. While many of the platforms available today organize objects hierarchically, very few solutions provide a way to describe non-hierarchical "edges" between objects ("nodes").

A Smart Platform is one that can currently, in the product or through its ecosystem, or has a roadmap to, provide a user experience that allows these relationships to be expressed. While a machine may "belong" to a line, it also has a relationship to an material provider that does not "belong" to the line. While a machine may send material to another machine, it also has a relationship with a human operator that is not a "child" of that machine.

Graphs can capture other knowledge as well: expressing cause-and-effect relationships between events not directly upstream of a process unit, referencing known failure modes with other like equipment, or identify correlation between supply chain disruption and quality. Smart Platforms store, or provide access, to this information to enable both humans and AI systems to identify correlation, make predictions, and enact better decisions.

### 3. Open APIs

Modern software includes open, documented APIs for access to the data stored within the platform. While many industrial information platforms expose APIs, some require additional licensing or provide documentation only to active customers. In other industries, such practices would be considered absurd -- the application platforms in our everyday lives, like PC operating systems, Mobile Platforms (iOS and Android) and even the World Wide Web are built on published programmers interfaces, many of which governed by standards bodies.

Smart Platform expose a modern API, like REST or GraphQL, and make the documentation readily available. But even when those best practices are followed, industrial information access is fractured by a multi-vendor ecosystem that was not designed for interoperability. The third SM Imperative is a call to all participants to work together to enable an ecosystem of application value that is not locked to a single vendor's platform.

That call was documented in 2024 as a RFC-style proposal from CESMII. It was answered by multiple vendors, manufacturers, and end-users and became the I3X iniative.

#### What is i3X?

**i3X** (pronounced "i-three-X") is an open specification for a **Contextualized Manufacturing Information API** - a common API for accessing manufacturing data. It works against a Contextual Manufacturing Information Platform (CMIP) - a single, or a combination of, Type-safe, organized operational data systems.

#### The Problem

The manufacturing industry suffers from API fragmentation:
- Multiple proprietary APIs from different vendors
- No standardization across platforms
- Applications locked to specific platforms
- High integration costs
- Limited application portability

#### The Solution

The **i3X API** provides:
- **Common Interface**: Standard set of server primitives
- **Platform Independence**: Works across diverse manufacturing systems
- **Application Portability**: Write once, deploy anywhere
- **Reduced Complexity**: Standardized contracts simplify development

#### Key Features

1. **RESTful Design**: Modern, web-standard API architecture
2. **Object Orientation**: Flexible representation of manufacturing assets
3. **Time-Series Data**: Efficient access to historical and real-time data
4. **SM Profile Support**: Native support for Smart Manufacturing Profiles
5. **Standard Authentication**: OAuth, JWT, and API key support
6. **Comprehensive Documentation**: OpenAPI/Swagger specifications

#### i3X Endpoints

- **Base URL**: `https://i3x.cesmii.net`
- **API Documentation**: `https://i3x.cesmii.net/docs`
- **OpenAPI Specification**: Interactive Swagger UI for exploring endpoints

#### What You Can Do with i3X

- **Explore the API**: Test endpoints and understand request/response formats
- **Develop Applications**: Build and test client applications against real data
- **Validate Concepts**: Prototype ideas before production deployment
- **Learn Best Practices**: See how a compliant implementation works

#### CESMII Resources vs. Production Platforms

Important distinctions:

| Aspect | CESMII | Production Platforms |
|--------|--------|---------------------|
| Purpose | Demo & testing | Real manufacturing operations |
| Data | Sample/test data | Actual production data |
| Availability | Best effort | High availability SLAs |
| Security | Development level | Enterprise-grade |
| Performance | Shared resources | Dedicated resources |
| Support | Community support | Commercial support |


## How CESMII, SM Profiles, i3X, and the API Work Together

```
┌─────────────────────────────────────────────────────┐
│  CESMII - The Organization                          │
│  Mission: Accelerate Smart Manufacturing Adoption   │
└─────────────────────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌──────────────┐ ┌─────────────┐ ┌──────────────┐
│ SM Profiles  │ │  I3x API    │ │     CMIP     │
│              │ │             │ │   Platform   │
│ Information  │ │ Standard    │ │              │
│   Models     │ │ & Docs      │ │ Sample Data  │
│              │ │             │ │ Sources      |     
└──────────────┘ └─────────────┘ └──────────────┘
        |               |               |
        │          Interface            │
        │               ▼               │
        │        ┌─────────────┐        │
        │        │     i3X     │        │
        │        │             │        │
        │        │   Demo &    │        │
        └───────▶│  Reference  │◀───────┘
                 │    Server   │
                 └─────────────┘
                        │
                        ▼
                 ┌─────────────┐
                 │ Application │
                 │ Developers  │
                 └─────────────┘
```

### The Flow

1. **SM Profiles** define what manufacturing data looks like
3. **i3X API** defines how to access that data
4. **Applications** use the API to access contextualized manufacturing data
5. **Commcerial platforms** implement the Profiles and API for production use

## The Vision: An App Ecosystem for Manufacturing

CESMII envisions a future where manufacturing applications work like smartphone apps:

### The Analogy

Just as iOS and Android provide common APIs that enable rich app ecosystems:
- **Apple/Android** → Platform vendors (historians, MES, etc.)
- **App Store** → CESMII Marketplace
- **APIs** → i3X API
- **Apps** → Manufacturing applications (analytics, ML, visualization)
- **Users** → Manufacturers benefiting from innovation

### The Benefits

- **Innovation**: Easier for developers to create manufacturing applications
- **Choice**: Manufacturers can select from diverse applications
- **Portability**: Applications work across different platforms
- **Competition**: Drives better solutions and lower costs
- **Accessibility**: Makes advanced technology available to all manufacturers

## Current Status and Roadmap

### Current State (2025)

- **RFC Published**: i3X API specification available for review
- **i3X Operational**: Demo server available for testing
- **Working Group Active**: CESMII/VDMA collaboration ongoing
- **Community Engagement**: Public feedback and discussion period

### Near-Term Goals

- Finalize v1.0 API specification
- Expand reference implementations
- Grow developer community
- Demonstrate production use cases
- Increase SM Profile adoption

### Long-Term Vision

- Widespread API adoption across vendors
- Vibrant marketplace of portable applications
- Reduced integration costs industry-wide
- Accelerated smart manufacturing transformation
- Global standard for manufacturing information access

## Getting Started

### For Application Developers

1. **Explore i3X**: Visit https://i3x.cesmii.net/docs
2. **Read the API Documentation**: Review the CM i3X API specification
3. **Try Sample Requests**: Use the Swagger UI to test endpoints
4. **Build an Application**: Create a client using the standardized API
5. **Join the Community**: Provide feedback via GitHub issues

### For Platform Vendors

1. **Review the RFC**: Read the specification at https://github.com/cesmii/API
2. **Study i3X**: Examine the reference implementation
3. **Implement the API**: Build server endpoints following the specification
4. **Test Compliance**: Validate against the API requirements
5. **Contribute Feedback**: Join the working group discussions

### For Manufacturers

1. **Learn About SM Profiles**: Understand how information models benefit your operations
2. **Explore CESMII Resources**: Visit cesmii.org for training and funding opportunities
3. **Engage with SMICs**: Connect with regional Smart Manufacturing Innovation Centers
4. **Pilot Projects**: Start with small-scale implementations
5. **Scale Adoption**: Expand successful pilots across facilities

## Key Resources

### CESMII Resources

- **Main Website**: https://www.cesmii.org
- **Marketplace**: https://marketplace.cesmii.org
- **Profile Designer**: https://profiles.cesmii.org
- **YouTube Channel**: https://www.youtube.com/@CESMII_SM

### API & Technical Resources

- **i3X Demo Server**: https://i3x.cesmii.net
- **API RFC**: https://github.com/cesmii/API
- **SM Profiles**: https://github.com/cesmii/SMProfiles
- **GraphQL API (Legacy)**: https://github.com/cesmii/GraphQL-API

### Standards & Specifications

- **OPC UA Cloud Library**: https://uacloudlibrary.opcfoundation.org
- **OPC Foundation**: https://opcfoundation.org
- **VDMA**: https://www.vdma.org

### Community & Support

- **RFC Feedback**: rfc@cesmii.org
- **Developer Support**: devops@cesmii.org
- **General Inquiries**: info@cesmii.org
- **GitHub Discussions**: https://github.com/cesmii/API/discussions

## How to Get Involved

### Provide Feedback

- Review the RFC at https://github.com/cesmii/API
- Submit issues and suggestions on GitHub
- Participate in discussions
- Email feedback to rfc@cesmii.org

### Contribute

- Implement the API in your platform
- Build applications using the API
- Create SM Profiles for your equipment
- Share use cases and best practices
- Join the working group

### Learn More

- Attend CESMII webinars and events
- Watch training videos on YouTube
- Visit a regional SMIC
- Apply for project funding
- Join as a CESMII member

## Conclusion

CESMII and i3X represent a collaborative effort to solve one of manufacturing's biggest challenges: data fragmentation and lack of interoperability. By providing standardized information models (SM Profiles) and a common API for accessing manufacturing data, CESMII is enabling a future where:

- Applications are portable across platforms
- Integration costs are dramatically reduced
- Innovation accelerates through ecosystem effects
- Smart manufacturing becomes accessible to all

The i3X demonstration server provides a hands-on way to explore this vision, test the API, and understand how standardized manufacturing information access can transform the industry.

Whether you're an application developer, platform vendor, or manufacturer, CESMII's work on SM Profiles and the i3X API offers a path toward greater interoperability, reduced costs, and accelerated digital transformation in manufacturing.

---

**Ready to get started?** Visit https://i3x.dev to explore the API, or head to https://www.cesmii.org to learn more about CESMII's mission and programs.
