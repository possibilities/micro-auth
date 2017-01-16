# Micro auth

### Summary

Minimal authentication API built on Zeit's [Micro](https://github.com/zeit/micro).

[![CircleCI](https://circleci.com/gh/possibilities/micro-auth.svg?style=svg)](https://circleci.com/gh/possibilities/micro-auth)

### Usage

```
AUTHENTICATION_SECRET_KEY=secret123 npm start
```

### Configuration

The app is configured via environment variables (see usage above). Possible values:

#### `AUTHENTICATION_SECRET_KEY` | required

The key used to encode [JWTs](https://jwt.io) returned from the service

#### `AUTHENTICATION_API_PORT` | optional, default 3000

The api app will bind to this port
