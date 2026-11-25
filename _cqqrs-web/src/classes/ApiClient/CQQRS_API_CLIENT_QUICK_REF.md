# CQQRS API Client - Quick Reference

## Installation & Setup

```typescript
import { createCqqrsClient } from './classes/CqqrsApiClient';

const client = createCqqrsClient();
```

## Basic API Endpoints

### Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| `getAll(year, week)` | `GET /reports/{year}/{week}` | Get all reports for an edition |
| `getByCallsign(year, week, callsign)` | `GET /reports/{year}/{week}/{callsign}` | Get a specific report |
| `getImage(year, week, imageName)` | `GET /reports/{year}/{week}/images/{imageName}` | Get report image |

### Members

| Method | Endpoint | Description |
|--------|----------|-------------|
| `getAll()` | `GET /members/` | Get all members |
| `get(callsign)` | `GET /members/{callsign}` | Get a specific member |
| `getAvatar(callsign)` | `GET /members/{callsign}/avitar` | Get member avatar |
| `uploadAvatar(callsign, file)` | `POST /members/{callsign}/avitar` | Upload member avatar |
| `upsert(members)` | `POST /members/` | Create or update multiple members |

## Common Patterns

### Fetch Data

```typescript
// Reports
const reports = await client.reports.getAll(2026, 44);
const report = await client.reports.getByCallsign(2026, 44, 'W5XYZ');

// Members
const members = await client.members.getAll();
const member = await client.members.get('W5XYZ');
```

### Handle Images

```typescript
// Get image blob
const imageBlob = await client.reports.getImage(2026, 44, 'photo.jpg');
const url = URL.createObjectURL(imageBlob);

// Use in HTML
document.getElementById('image').src = url;
```

### Error Handling

```typescript
import { HttpError } from './classes/CqqrsApiClient';

try {
  const member = await client.members.get('W5XYZ');
} catch (error) {
  if (error instanceof HttpError) {
    console.error(`Error ${error.status}: ${error.message}`);
  }
}
```

### Upload Files

```typescript
const fileInput = document.getElementById('file-input') as HTMLInputElement;
const file = fileInput.files?.[0];

if (file) {
  const result = await client.members.uploadAvatar('W5XYZ', file);
  console.log('Avatar URL:', result.url);
}
```

### Parallel Requests

```typescript
const [members, reports] = await Promise.all([
  client.members.getAll(),
  client.reports.getAll(2026, 44),
]);
```

## Configuration

```typescript
const client = createCqqrsClient({
  baseUrl: 'https://custom-domain.com/api',    // Custom base URL
  apiVersion: 'v1',                               // API version
  timeout: 60000,                                 // Request timeout in ms
});
```

## Common HTTP Status Codes

| Status | Meaning |
|--------|---------|
| 200 | Success - Data returned |
| 304 | Not Modified - Use cached data |
| 400 | Bad Request - Invalid parameters |
| 404 | Not Found - Resource doesn't exist |
| 500 | Server Error - Try again later |

## TypeScript Types

```typescript
interface ReportEntry {
  callsign: string;
  [key: string]: unknown;
}

interface Member {
  callsign: string;
  [key: string]: unknown;
}

interface UploadAvatarResponse {
  status: string;
  url: string;
}

interface UpsertMembersResponse {
  status?: string;
  [key: string]: unknown;
}

class HttpError extends Error {
  status: number;
  responseData?: unknown;
}
```

## Tips & Best Practices

✅ **Always use type-safe error handling**
```typescript
if (error instanceof HttpError) {
  // Handle API error
}
```

✅ **Use `encodeURIComponent()` for special characters in callsigns**
- Already handled by the client library

✅ **Cache image blobs with `URL.createObjectURL()`**
```typescript
const url = URL.createObjectURL(blob);
// Use url for display
// Don't forget to revoke when done: URL.revokeObjectURL(url);
```

✅ **Batch multiple requests with `Promise.all()`**
```typescript
const results = await Promise.all([
  client.members.get('W5ABC'),
  client.members.get('W5XYZ'),
  client.members.get('W5DEF'),
]);
```

✅ **Increase timeout for slow connections**
```typescript
const client = createCqqrsClient({ timeout: 60000 }); // 60 seconds
```

❌ **Don't forget to handle 404 errors gracefully**
```typescript
try {
  const member = await client.members.get(callsign);
} catch (error) {
  if (error instanceof HttpError && error.status === 404) {
    console.log('Member not found');
  }
}
```

❌ **Don't send multiple sequential requests when parallel is possible**
```typescript
// Bad
const m1 = await client.members.get('W5ABC');
const m2 = await client.members.get('W5XYZ');

// Good
const [m1, m2] = await Promise.all([
  client.members.get('W5ABC'),
  client.members.get('W5XYZ'),
]);
```

## Full Examples

### Get Member Profile

```typescript
async function displayMemberProfile(callsign: string) {
  try {
    const member = await client.members.get(callsign);
    const avatarBlob = await client.members.getAvatar(callsign);
    
    document.getElementById('name').textContent = member.name;
    document.getElementById('avatar').src = URL.createObjectURL(avatarBlob);
  } catch (error) {
    console.error('Failed to load profile:', error);
  }
}
```

### List All Members With Avatars

```typescript
async function listMembers() {
  const members = await client.members.getAll();
  
  const memberList = await Promise.all(
    members.map(async (member) => {
      try {
        const avatarBlob = await client.members.getAvatar(member.callsign);
        return {
          ...member,
          avatarUrl: URL.createObjectURL(avatarBlob),
        };
      } catch {
        return { ...member, avatarUrl: null };
      }
    })
  );
  
  return memberList;
}
```

### Upload New Avatar

```typescript
async function handleAvatarUpload(callsign: string) {
  const input = document.getElementById('file-input') as HTMLInputElement;
  const file = input.files?.[0];
  
  if (!file) return;
  
  try {
    const result = await client.members.uploadAvatar(callsign, file);
    alert(`Avatar updated: ${result.url}`);
  } catch (error) {
    alert(`Upload failed: ${error instanceof HttpError ? error.message : 'Unknown error'}`);
  }
}
```

### Bulk Update Members

```typescript
async function updateMembers(membersList: Array<{ callsign: string; name: string; email: string }>) {
  try {
    const result = await client.members.upsert(membersList);
    console.log('Members updated:', result.status);
  } catch (error) {
    console.error(`Update failed: ${error instanceof HttpError ? error.message : 'Unknown error'}`);
  }
}
```

### Fetch Reports for Multiple Weeks

```typescript
async function getReportsForQuarter(year: number, startWeek: number) {
  const weeks = [startWeek, startWeek + 1, startWeek + 2, startWeek + 3];
  
  const quarterReports = await Promise.all(
    weeks.map(week => client.reports.getAll(year, week))
  );
  
  return Object.fromEntries(
    weeks.map((week, index) => [week, quarterReports[index]])
  );
}
```

## Troubleshooting

### "Cannot find module"
Make sure the import path is correct:
```typescript
import { createCqqrsClient } from './classes/CqqrsApiClient';
```

### "Network error" or "Timeout"
- Increase timeout: `createCqqrsClient({ timeout: 60000 })`
- Check internet connection
- Verify API server is running

### "CORS error"
- API must be configured to allow requests from your domain
- Contact API administrator if running locally

### "File must be JPEG"
- Only JPEG images accepted for avatars
- Convert image before uploading:
  ```typescript
  // Use an image conversion library or service
  const jpegFile = await convertToJpeg(originalFile);
  await client.members.uploadAvatar(callsign, jpegFile);
  ```

## Need More Help?

- Full documentation: See `CQQRS_API_CLIENT.md`
- Examples: See `CqqrsApiClient.examples.ts`
- Tests: See `CqqrsApiClient.test.ts`
- API spec: See `server/api/v1/api.md`
