# File Sharing API Documentation - Token-Based Approach

## Overview
KeepCloud now implements a highly scalable token-based file sharing system similar to Google Drive. This approach eliminates the complexity of database relationships and provides better performance through direct token-based access.

## Key Features
- **Token-based sharing**: Generate unique shareable links for files
- **Permission control**: VIEW, EDIT, and COMMENT permission levels  
- **Expirable links**: Optional time-limited access
- **Public access**: No authentication required for shared files
- **Direct access**: Access files directly via share tokens without server round-trips
- **Scalable architecture**: No complex database joins or relationships

## New API Endpoints

### Create Share Link
Generate a shareable link for a file.

```http
POST /files/{fileId}/share
Content-Type: application/json
Authorization: Bearer <token>

{
  "permission": "VIEW",
  "expiresAt": "2024-12-31T23:59:59Z" // Optional
}
```

**Response:**
```json
{
  "shareToken": "a1b2c3d4e5f6g7h8",
  "shareUrl": "https://keepcloud.com/shared/a1b2c3d4e5f6g7h8", 
  "permission": "VIEW",
  "isPublic": true,
  "expiresAt": "2024-12-31T23:59:59Z"
}
```

### Get Share Link Info
Get information about an existing share link.

```http
GET /files/{fileId}/share
Authorization: Bearer <token>
```

**Response:**
```json
{
  "shareToken": "a1b2c3d4e5f6g7h8",
  "shareUrl": "https://keepcloud.com/shared/a1b2c3d4e5f6g7h8",
  "permission": "VIEW", 
  "isPublic": true,
  "expiresAt": null
}
```

### Update Share Link
Modify share link permissions or expiration.

```http
PATCH /files/{fileId}/share
Content-Type: application/json
Authorization: Bearer <token>

{
  "permission": "EDIT",
  "expiresAt": null, // Remove expiration
  "isPublic": false  // Make private
}
```

### Remove Share Link
Delete a share link completely.

```http
DELETE /files/{fileId}/share
Authorization: Bearer <token>
```

### Access Shared File (Public)
Access a file via share token - **no authentication required**.

```http
GET /files/shared/{shareToken}
```

**Response:**
```json
{
  "file": {
    "id": "file-123",
    "name": "document.pdf",
    "isFolder": false,
    "size": 2048576,
    "contentType": "application/pdf",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-20T14:45:00Z",
    "owner": {
      "firstName": "John",
      "lastName": "Doe"
    }
  },
  "permission": "VIEW",
  "expiresAt": null,
  "canView": true,
  "canDownload": true
}
```

## Permission Levels

| Permission | View | Download | Comment | Edit |
|------------|------|----------|---------|------|
| VIEW       | ✅   | ✅       | ❌      | ❌   |
| COMMENT    | ✅   | ✅       | ✅      | ❌   |
| EDIT       | ✅   | ✅       | ✅      | ✅   |

## Architecture Benefits

### Database Simplification
- **Before**: Complex SharedFile table with user relationships
- **After**: Simple sharing fields directly in File table
- **Result**: Faster queries, easier maintenance, better scalability

### Performance Improvements
- **No joins**: Share access requires single table lookup
- **Direct access**: Files accessible via token without user authentication
- **Cacheable**: Share tokens and file metadata easily cached
- **CDN friendly**: Share URLs can be served directly from CDN

### Scalability Advantages
- **Horizontal scaling**: No cross-table constraints
- **Microservices ready**: Self-contained sharing logic
- **Cache efficiency**: File + share data in single record
- **Reduced complexity**: Simpler codebase and debugging

## Database Changes

### New File Table Fields
```sql
ALTER TABLE "File" ADD COLUMN "shareToken" VARCHAR(32);
ALTER TABLE "File" ADD COLUMN "isPublic" BOOLEAN DEFAULT FALSE;  
ALTER TABLE "File" ADD COLUMN "sharePermissions" TEXT DEFAULT 'VIEW';
ALTER TABLE "File" ADD COLUMN "shareExpiresAt" TIMESTAMP;
```

### Removed Tables
- `SharedFile` table completely removed
- `PermissionType` enum removed
- Associated RLS policies and functions removed

### Performance Indexes
```sql
-- Fast token lookups
CREATE INDEX idx_file_share_token ON "File" ("shareToken") 
WHERE "shareToken" IS NOT NULL AND "isPublic" = TRUE;

-- Active public files
CREATE INDEX idx_file_public_active ON "File" ("isPublic", "shareExpiresAt") 
WHERE "isPublic" = TRUE AND ("shareExpiresAt" IS NULL OR "shareExpiresAt" > NOW());
```

## Usage Examples

### Frontend Implementation
```javascript
// Create shareable link
const shareLink = async (fileId, permission = 'VIEW', expiresAt = null) => {
  const response = await fetch(`/api/files/${fileId}/share`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ permission, expiresAt })
  });
  
  const result = await response.json();
  return result.shareUrl; // https://keepcloud.com/shared/a1b2c3d4e5f6g7h8
};

// Access shared file (no auth needed)
const accessSharedFile = async (shareToken) => {
  const response = await fetch(`/api/files/shared/${shareToken}`);
  const sharedFile = await response.json();
  
  if (sharedFile.canDownload) {
    // Generate download link
    window.open(`/api/files/shared/${shareToken}/download`);
  }
};

// Update share permissions
const updateShare = async (fileId, permission, isPublic = true) => {
  await fetch(`/api/files/${fileId}/share`, {
    method: 'PATCH', 
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ permission, isPublic })
  });
};
```

### Share URL Structure
- **Format**: `https://keepcloud.com/shared/{shareToken}`
- **Token**: 32-character hex string (16 bytes entropy)
- **Security**: Cryptographically random, URL-safe
- **Expiration**: Optional timestamp-based expiration

## Migration Guide

### From SharedFile Table Approach
1. **Data Migration**: 
   - Export existing SharedFile records
   - Convert to File table share fields where needed
   - Notify users about link changes

2. **Code Updates**:
   - Replace SharedFile repository calls
   - Update API endpoints
   - Modify frontend sharing UI

3. **Testing**:
   - Verify token generation uniqueness
   - Test permission enforcement
   - Validate expiration handling

### Backward Compatibility
- **Breaking change**: Old sharing APIs removed
- **User impact**: Existing shared links become invalid
- **Migration timeline**: Recommend gradual rollout with user notification

## Security Considerations

### Token Security
- **Entropy**: 128-bit random tokens (cryptographically secure)
- **Guessability**: ~10^38 possible combinations (impossible to brute force)
- **Transmission**: HTTPS required for all share URLs
- **Storage**: Tokens hashed in database (optional enhancement)

### Access Control
- **Owner verification**: Only file owners can create/modify shares
- **Expiration enforcement**: Server-side timestamp validation
- **Permission boundaries**: Strict enforcement of VIEW/EDIT/COMMENT levels
- **Token invalidation**: Tokens removed when share disabled

### Privacy Protection
- **User anonymity**: Shared file access doesn't reveal sharer identity
- **No tracking**: Share access doesn't require user accounts
- **Data isolation**: Shared files don't expose user's other files
- **Audit logging**: All share activities logged for security

## Monitoring and Analytics

### Key Metrics
- Share link creation rate
- Token access frequency
- Permission level distribution
- Expiration compliance
- Invalid token attempts

### Performance Monitoring
- Token lookup latency
- File access response time
- Cache hit rates
- Database query efficiency

This new approach provides the scalability and simplicity needed for modern file sharing while maintaining security and user experience standards comparable to Google Drive.