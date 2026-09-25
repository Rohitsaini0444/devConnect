# devConnect

devConnect is a developer networking API. Users can create profiles, discover other developers, send and review connection requests, and access premium membership features.

## Features

- Account registration, login, and logout
- Profile viewing, editing, password changes, and profile photo uploads
- Paginated developer feed and accepted connections
- Connection requests with `interested`, `ignored`, `accepted`, and `rejected` states
- Razorpay order creation and premium membership verification
- Optional welcome emails and scheduled weekly signup reports

## Requirements

- Node.js 18 or newer
- MongoDB

## Install and Run

```bash
npm install
npm start
```

For local development with automatic reloads:

```bash
npm run dev
```

The API listens on port `3000` by default. Set `PORT` to use another port. The server connects to MongoDB before it begins listening.

## Environment

Use [`.env.example`](.env.example) as the reference for environment variables, and keep local secrets out of source control.

## API Reference

See [apiList.md](apiList.md) for the complete endpoint list, authentication requirements, parameters, and short descriptions.

## License

ISC
