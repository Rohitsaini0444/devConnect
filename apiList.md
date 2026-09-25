# DevConnect API Reference

All routes are relative to the API server base URL. Authenticated routes require the `token` HTTP-only cookie set at signup or login.

## Authentication

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/auth/signup` | No | Create an account and sign in. Expects `firstName`, `lastName`, `email`, and `password`. |
| `POST` | `/auth/login` | No | Sign in with `email` and `password`. |
| `POST` | `/auth/logout` | No | Clear the authentication cookie. |

## Profile

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/profile/view` | Yes | Get the signed-in user's profile. |
| `POST` | `/profile/edit` | Yes | Update the signed-in user's profile fields. |
| `PATCH` | `/profile/password` | Yes | Change the password using `oldPassword` and `newPassword`. |
| `POST` | `/profile/photo/upload-url` | Yes | Request a short-lived S3 upload URL. Expects an image `contentType`; returns `uploadUrl`, `key`, and `photoUrl`. |

## Connection Requests

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/request/send/:status/:userId` | Yes | Send a connection action to a user. `status` is `interested` or `ignored`. |
| `POST` | `/request/review/:status/:requestId` | Yes | Accept or reject a received request. `status` is `accepted` or `rejected`. |

## Users

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/user/requests/received` | Yes | List pending connection requests received by the signed-in user. |
| `GET` | `/user/connections` | Yes | List the signed-in user's accepted connections. |
| `GET` | `/user/feed` | Yes | Get suggested profiles, excluding the signed-in user and users with an existing request or connection. Supports `page` and `limit` query parameters (defaults: `1` and `10`; maximum limit: `50`). |

## Payments

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/payment/create` | Yes | Create a Razorpay order. Expects `amount` and `currency`; `membershipType` is optional. |
| `POST` | `/payment/webhook` | Yes | Receive a Razorpay webhook notification and validate its signature. |
| `GET` | `/payment/premium/verify` | Yes | Check whether the signed-in user has premium membership. |

## Notes

- `:status`, `:userId`, and `:requestId` are URL path parameters.
- The payment router is mounted behind authentication, so `/payment/webhook` currently also requires the `token` cookie.