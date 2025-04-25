# **@tsdiapi/prisma-rest**

A TSDIAPI plugin that provides dynamic REST API access to your Prisma models with built-in security controls.

## 📌 About

This is a **TSDIAPI** plugin that provides a single dynamic endpoint to access your Prisma models through REST API. It includes built-in security features and access control.

🔗 **TSDIAPI CLI:** [@tsdiapi/cli](https://www.npmjs.com/package/@tsdiapi/cli)

---

## 📦 Installation

You can install this plugin using npm:

```bash
tsdiapi add @tsdiapi/prisma-rest
```

Then, register the plugin in your TSDIAPI project:

```typescript
import { createApp } from "@tsdiapi/server";
import createPlugin from "@tsdiapi/prisma-rest";

createApp({
  plugins: [createPlugin({ enabled: true })],
});
```

---

## 🚀 Features

- 🔄 **Dynamic Endpoint** - Single endpoint for all Prisma operations
- 🔒 **JWT Authentication** - Built-in JWT guard support
- 🌐 **IP Restrictions** - Control access based on IP addresses
- 🎯 **Method Control** - Enable/disable specific Prisma methods
- 🏷️ **Model Selection** - Choose which models to expose through the API

---

## 🔧 Configuration

This plugin can be configured through environment variables or during initialization:

```typescript
createPlugin({
  enabled: true
});
```

### Configuration Options

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| PRISMA_REST_ENABLED | boolean | true | Enable/disable the REST API |
| PRISMA_REST_METHODS | string | "*" | Comma-separated list of allowed Prisma methods |
| PRISMA_REST_MODELS | string | "*" | Comma-separated list of models to expose |
| PRISMA_REST_ALLOWED_IPS | string | "127.0.0.1,::1" | Comma-separated list of allowed IP addresses |
| PRISMA_REST_GUARD | string | "admin" | Guard name for JWT authentication |

---

## 📌 How to Use

The plugin provides a single dynamic endpoint:

```typescript
POST /api/v1/prisma/:method/:model
```

### Example Usage:

```typescript
// Create a new user
POST /api/v1/prisma/create/user
{
  "name": "John Doe",
  "email": "john@example.com"
}

// Find users
POST /api/v1/prisma/findMany/user
{
  "where": {
    "email": "john@example.com"
  }
}

// Update user
POST /api/v1/prisma/update/user
{
  "where": {
    "id": 1
  },
  "data": {
    "name": "John Smith"
  }
}
```

### Authentication
All requests require JWT authentication with the specified guard.

### Error Responses
- 400: Invalid method, model, or request data
- 403: IP not allowed or authentication failed
- 500: Server error

---

## 🔗 Related Plugins

You can find more **TSDIAPI** plugins here:  
🔗 [Available Plugins](https://www.npmjs.com/search?q=%40tsdiapi)

---

## 👨‍💻 Contributing

Contributions are always welcome! If you have ideas for improving this plugin, feel free to open a pull request.

**Author:** unbywyd  
**GitHub Repository:** [https://github.com/unbywyd/tsdiapi-prisma-rest](https://github.com/unbywyd/tsdiapi-prisma-rest)

📧 **Contact:** unbywyd@gmail.com

🚀 Happy coding with **TSDIAPI**! 🎉
