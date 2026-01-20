# Resources and Support

## Resources and Support

### Official Resources

- **RFC Documentation**: https://github.com/cesmii/API
- **API Endpoint**: https://i3x.cesmii.net
- **API Documentation**: https://i3x.cesmii.net/docs
- **GitHub Issues**: https://github.com/cesmii/API/issues

### Related Projects

- **CESMII Smart Manufacturing Platform**: https://github.com/cesmii/GraphQL-API
- **SM Profiles**: https://github.com/cesmii/SMProfiles
- **OPC UA Cloud Library**: https://uacloudlibrary.opcfoundation.org

### Community Support

- **Email**: rfc@cesmii.org
- **Developer Support**: devops@cesmii.org
- **CESMII Website**: https://www.cesmii.org

## Versioning and Compatibility

i3X follows semantic versioning. When integrating with the API:

1. Specify the API version in your requests (if supported)
2. Monitor deprecation notices in API responses
3. Test against new API versions in a development environment before upgrading production

```javascript
// Example: Specifying API version
const response = await fetch('https://i3x.cesmii.net/objects', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/vnd.cesmii.v1+json'
  }
});
```

## Conclusion

The CESMII Contextualized Manufacturing Information API provides a powerful, standardized interface for building manufacturing applications. By following the patterns and best practices outlined in this guide, you can create robust, maintainable client applications that leverage the full potential of contextualized manufacturing data.

For the most up-to-date information and detailed API specifications, always refer to the official documentation at https://i3x.cesmii.net/docs and the RFC at https://github.com/cesmii/API.
