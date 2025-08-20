# File Sharing API Documentation

## Overview
The KeepCloud file sharing system has been redesigned with a simplified, scalable approach similar to Google Drive. The complex PostgreSQL Row Level Security (RLS) has been replaced with application-level user filtering for better performance and maintainability.

## Key Features
- Share files with other users by email or user ID
- Three permission levels: VIEW, EDIT, COMMENT
- Proper access control for all file operations
- Scalable architecture without RLS complexity
- User-level filtering across all endpoints

## API Endpoints

### Share a File with Another User

#### By User ID
```http
POST /files/{fileId}/share
Content-Type: application/json
Authorization: Bearer <token>

{
  "userId": "user-123",
  "permission": "VIEW"
}
```

#### By Email Address
```http
POST /files/share
Content-Type: application/json
Authorization: Bearer <token>

{
  "fileId": "file-456",
  "sharedWithEmail": "user@example.com",
  "permission": "EDIT"
}
```

### Get Files Shared With Me
```http
GET /files/shared-with-me
Authorization: Bearer <token>
```

```http
GET /storage/shared-with-me?page=1&pageSize=20&order=asc
Authorization: Bearer <token>
```

### Get All Shares for a File
```http
GET /files/{fileId}/shares
Authorization: Bearer <token>
```

### Update Share Permissions
```http
PATCH /files/shares/{shareId}
Content-Type: application/json
Authorization: Bearer <token>

{
  "permission": "EDIT"
}
```

### Remove File Share
```http
DELETE /files/shares/{shareId}
Authorization: Bearer <token>
```

## Permission Levels

- **VIEW**: Can view and download the file
- **EDIT**: Can modify the file (includes VIEW permissions)
- **COMMENT**: Can add comments to the file (includes VIEW permissions)

## Security Model

### Application-Level Filtering
All file operations now include proper user access checks:

1. **File Ownership**: Users can perform any operation on files they own
2. **Shared Access**: Users can access files shared with them based on permission level
3. **Access Verification**: Every file operation verifies user access before proceeding

### User Access Check
The system automatically checks if a user has access to a file by:
1. Checking if the user owns the file
2. Checking if the file is shared with the user
3. Verifying the appropriate permission level for the requested operation

## Database Changes

### RLS Removal
- Disabled Row Level Security on all tables
- Removed complex RLS policies and helper functions
- Added performance indexes for application-level filtering

### Simplified Architecture
- Clean separation between owned and shared files
- Efficient querying with proper indexing
- Scalable approach suitable for large user bases

## Example Usage Scenarios

### Scenario 1: Share a document with a colleague
```javascript
// Share file with edit permission
const response = await fetch('/files/share', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({
    fileId: 'document-123',
    sharedWithEmail: 'colleague@company.com',
    permission: 'EDIT'
  })
});

const share = await response.json();
console.log('File shared:', share);
```

### Scenario 2: View files shared with you
```javascript
// Get all shared files
const response = await fetch('/storage/shared-with-me?page=1&pageSize=10', {
  headers: {
    'Authorization': 'Bearer ' + token
  }
});

const sharedFiles = await response.json();
console.log('Shared files:', sharedFiles.items);
```

### Scenario 3: Update sharing permissions
```javascript
// Change permission from VIEW to EDIT
const response = await fetch('/files/shares/share-456', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({
    permission: 'EDIT'
  })
});
```

## Error Handling

The API returns appropriate HTTP status codes:
- `200`: Success
- `201`: Created (for new shares)
- `404`: File not found or user lacks access
- `403`: Forbidden (insufficient permissions)
- `409`: Conflict (file already shared with user)
- `400`: Bad request (validation errors)

## Migration from RLS
Existing installations can migrate by running the new database migration that:
1. Disables RLS on all tables
2. Drops RLS policies and functions
3. Adds performance indexes
4. Maintains all existing data integrity

This approach provides better performance, easier debugging, and more straightforward security model while maintaining the same functionality.