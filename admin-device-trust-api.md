# Admin Device & IP Trust API Documentation

This document outlines the endpoints available for the Admin Device & IP Trust feature. These endpoints allow the admin frontend to manage pending device login requests and manually manage the IP blocklist.

**Base URL**: `/admin/auth/device-trust`  
**Authentication**: All endpoints require an active, authenticated admin token.

---

## 1. Pending Requests

### Get Pending Requests

Retrieves a list of all currently pending device login approval requests.

- **Endpoint**: `GET /pending-requests`
- **Query Parameters**: None (defaults to returning all pending requests sorted by newest first).
- **Response**:
  ```json
  {
    "status": "success",
    "message": "Pending device approval requests retrieved",
    "data": [
      {
        "_id": "64abcdef1234567890abcdef",
        "adminId": {
          "_id": "64abcdef1234567890abcdee",
          "firstName": "John",
          "lastName": "Doe",
          "email": "john.doe@example.com"
        },
        "deviceId": "dev_123456789",
        "requestedIp": "192.168.1.50",
        "userAgent": "Mozilla/5.0...",
        "status": "pending",
        "expiresAt": "2026-07-23T16:40:20.000Z",
        "createdAt": "2026-07-23T14:40:20.000Z"
      }
    ]
  }
  ```

### Approve Request

Approves a pending device login request, granting the user's device and IP access to their account.

- **Endpoint**: `POST /requests/:requestId/approve`
- **URL Parameters**:
  - `requestId`: The `_id` of the pending `AdminDeviceApprovalRequest`.
- **Request Body**: None.
- **Response**:
  ```json
  {
    "status": "success",
    "message": "Device request approved successfully",
    "data": null
  }
  ```

### Deny Request

Denies a pending device login request. Optionally blocks the IP address globally from accessing the admin panel.

- **Endpoint**: `POST /requests/:requestId/deny`
- **URL Parameters**:
  - `requestId`: The `_id` of the pending `AdminDeviceApprovalRequest`.
- **Request Body**:
  ```json
  {
    "action": "deny",
    "blockIp": true, // Optional: Set to true to globally block this IP
    "reason": "Suspicious login attempt from unknown location" // Optional
  }
  ```
- **Response**:
  ```json
  {
    "status": "success",
    "message": "Device request denied successfully",
    "data": null
  }
  ```

---

## 2. Manual IP Blocklist Management

### Get Blocked IPs

Retrieves the paginated list of all globally blocked IPs/CIDRs.

- **Endpoint**: `GET /blocked-ips`
- **Query Parameters**:
  - `page`: (Optional) Page number, defaults to 1.
  - `limit`: (Optional) Number of results per page, defaults to 10.
- **Response**:
  ```json
  {
    "status": "success",
    "message": "Blocked IPs retrieved successfully",
    "data": {
      "data": [
        {
          "_id": "64abcdef1234567890abcdef",
          "cidr": "203.0.113.0/24",
          "reason": "Repeated failed login attempts",
          "blockedBy": {
            "_id": "64abcdef1234567890abcdee",
            "firstName": "Jane",
            "lastName": "Smith",
            "email": "jane@example.com"
          },
          "createdAt": "2026-07-23T14:40:20.000Z"
        }
      ],
      "total": 1
    }
  }
  ```

### Add IP to Blocklist

Manually adds an IP address or CIDR range to the global blocklist.

- **Endpoint**: `POST /blocked-ips`
- **Request Body**:
  ```json
  {
    "cidr": "198.51.100.14/32", // Required: Must be a valid CIDR notation. For single IPs, append /32 (IPv4) or /128 (IPv6)
    "reason": "Known malicious proxy" // Optional
  }
  ```
- **Response**:
  ```json
  {
    "status": "success",
    "message": "IP added to blocklist successfully",
    "data": null
  }
  ```

### Remove IP from Blocklist

Removes an IP address or CIDR range from the global blocklist.

- **Endpoint**: `DELETE /blocked-ips/:cidr`
- **URL Parameters**:
  - `cidr`: The exact CIDR string to remove. **Note:** This must be URL-encoded (e.g., `198.51.100.14%2F32`).
- **Response**:
  ```json
  {
    "status": "success",
    "message": "IP removed from blocklist successfully",
    "data": null
  }
  ```
