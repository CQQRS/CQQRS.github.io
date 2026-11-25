# CQQRS API Client Library

A type-safe TypeScript client library for the CQQRS API. This library provides a modern, promise-based interface to interact with the CQQRS API endpoints.

## Features

- 🎯 **Type-Safe**: Full TypeScript support with interfaces for all API responses
- ⚡ **Lightweight**: Zero external dependencies
- 🔄 **Promise-Based**: Async/await support
- 🛡️ **Error Handling**: Custom `HttpError` class with detailed error information
- ⏱️ **Timeout Support**: Configurable request timeouts
- 🎨 **Clean API**: Intuitive, fluent interface

## Installation

The client is included in the `classes` directory of the CQQRS project.

```typescript
import { CqqrsApiClient, createCqqrsClient } from './classes/CqqrsApiClient';
```

## Quick Start

### Basic Usage

```typescript
import { createCqqrsClient } from './classes/CqqrsApiClient';

// Create a client with default configuration
const client = createCqqrsClient();

// Get all reports for a specific edition
const reports = await client.reports.getAll(2026, 44);

// Get a specific report by callsign
const report = await client.reports.getByCallsign(2026, 44, 'W5XYZ');

// Get all members
const members = await client.members.getAll();

// Get a specific member
const member = await client.members.get('W5XYZ');
```

### Custom Configuration

```typescript
const client = createCqqrsClient({
  baseUrl: 'https://custom-domain.com/api',
  apiVersion: 'v1',
  timeout: 60000, // 60 seconds
});
```

## API Reference

### Reports

#### `reports.getAll(year: number, week: number): Promise<ReportEntry[]>`

Retrieves all reports for a specific year and week.

```typescript
try {
  const reports = await client.reports.getAll(2026, 44);
  console.log(`Found ${reports.length} reports`);
  reports.forEach(report => {
    console.log(report.callsign);
  });
} catch (error) {
  if (error instanceof HttpError) {
    console.error(`API Error ${error.status}: ${error.message}`);
  }
}
```

#### `reports.getByCallsign(year: number, week: number, callsign: string): Promise<ReportEntry>`

Retrieves a specific report by callsign.

```typescript
const report = await client.reports.getByCallsign(2026, 44, 'W5XYZ');
console.log(report);
```

**Throws**: `HttpError` with status 404 if the report is not found.

#### `reports.getImage(year: number, week: number, imageName: string): Promise<Blob>`

Retrieves an image from a report.

```typescript
const imageBlob = await client.reports.getImage(2026, 44, 'photo.jpg');
const url = URL.createObjectURL(imageBlob);
document.getElementById('report-image').src = url;
```

**Throws**: `HttpError` with status 404 if the image is not found.

### Members

#### `members.getAll(): Promise<Member[]>`

Retrieves all members.

```typescript
const members = await client.members.getAll();
members.forEach(member => {
  console.log(`${member.callsign}: ${member.name}`);
});
```

#### `members.get(callsign: string): Promise<Member>`

Retrieves a specific member by callsign.

```typescript
const member = await client.members.get('W5XYZ');
console.log(member.name);
```

**Throws**: `HttpError` with status 404 if the member is not found.

#### `members.getAvatar(callsign: string): Promise<Blob>`

Retrieves a member's avatar image.

```typescript
const avatarBlob = await client.members.getAvatar('W5XYZ');
const url = URL.createObjectURL(avatarBlob);

const img = new Image();
img.src = url;
document.body.appendChild(img);
```

**Throws**: `HttpError` with status 404 if the avatar is not found.

#### `members.uploadAvatar(callsign: string, imageFile: File): Promise<UploadAvatarResponse>`

Uploads or updates a member's avatar. The image must be in JPEG format.

```typescript
// Using a file input
const fileInput = document.getElementById('avatar-input') as HTMLInputElement;
const file = fileInput.files?.[0];

if (file) {
  try {
    const result = await client.members.uploadAvatar('W5XYZ', file);
    console.log('Avatar uploaded:', result.url);
  } catch (error) {
    if (error instanceof HttpError) {
      if (error.status === 400) {
        console.error('File must be a JPEG image');
      }
    }
  }
}
```

**Throws**: 
- `HttpError` with status 400 if the file is not a JPEG image
- `HttpError` with status 400 if no file is provided
- `HttpError` with status 500 if the upload fails on the server

#### `members.upsert(members: Member[]): Promise<UpsertMembersResponse>`

Creates or updates multiple members in bulk. This is useful for syncing member data from an external source.

```typescript
const membersToUpdate = [
  { callsign: 'W5XYZ', name: 'John Doe', email: 'john@example.com' },
  { callsign: 'K0ABC', name: 'Jane Smith', email: 'jane@example.com' },
];

try {
  const result = await client.members.upsert(membersToUpdate);
  console.log('Members updated:', result.status);
} catch (error) {
  if (error instanceof HttpError) {
    console.error(`Failed to upsert members: ${error.message}`);
  }
}
```

**Throws**: `HttpError` with status 400 if the member data is invalid

## Types

### `ReportEntry`

```typescript
interface ReportEntry {
  callsign: string;
  [key: string]: unknown;
}
```

A single report entry containing at minimum a `callsign` field.

### `Member`

```typescript
interface Member {
  callsign: string;
  [key: string]: unknown;
}
```

A member object containing at minimum a `callsign` field.

### `UploadAvatarResponse`

```typescript
interface UploadAvatarResponse {
  status: string;
  url: string;
}
```

Response from a successful avatar upload.

### `UpsertMembersResponse`

```typescript
interface UpsertMembersResponse {
  status?: string;
  [key: string]: unknown;
}
```

Response from a successful bulk member upsert operation. Contains a status field and may include additional fields such as counts of created and updated members.

### `HttpError`

```typescript
class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public responseData?: unknown
  )
}
```

Custom error class for HTTP errors. Extends the standard `Error` class.

## Error Handling

The client uses a custom `HttpError` class for all HTTP errors:

```typescript
import { CqqrsApiClient, HttpError } from './classes/CqqrsApiClient';

const client = new CqqrsApiClient();

try {
  const report = await client.reports.getByCallsign(2026, 44, 'INVALID');
} catch (error) {
  if (error instanceof HttpError) {
    console.error(`HTTP ${error.status}: ${error.message}`);
    console.log('Response data:', error.responseData);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

### Common Status Codes

| Status | Meaning | Handling |
|--------|---------|----------|
| 200 | Success | Data is available |
| 304 | Not Modified | Use cached data |
| 400 | Bad Request | Invalid parameters or malformed request |
| 404 | Not Found | Resource does not exist |
| 500 | Server Error | Server-side error |
| Timeout | Request Timeout | Request exceeded configured timeout |

## Examples

### Complete Member Management Example

```typescript
import { createCqqrsClient, HttpError } from './classes/CqqrsApiClient';

async function manageMember() {
  const client = createCqqrsClient();
  
  try {
    // Get all members
    console.log('Fetching all members...');
    const allMembers = await client.members.getAll();
    console.log(`Found ${allMembers.length} members`);
    
    // Get specific member
    const targetCallsign = 'W5XYZ';
    console.log(`\nFetching member: ${targetCallsign}`);
    const member = await client.members.get(targetCallsign);
    console.log(member);
    
    // Get member avatar
    console.log(`\nFetching avatar for ${targetCallsign}`);
    const avatarBlob = await client.members.getAvatar(targetCallsign);
    console.log(`Avatar size: ${avatarBlob.size} bytes`);
    
  } catch (error) {
    if (error instanceof HttpError) {
      console.error(`API Error ${error.status}: ${error.message}`);
    } else {
      console.error('Unexpected error:', error);
    }
  }
}

manageMember();
```

### Reports with Images Example

```typescript
import { createCqqrsClient, HttpError } from './classes/CqqrsApiClient';

async function getReportWithImages(year: number, week: number, callsign: string) {
  const client = createCqqrsClient();
  
  try {
    // Get the report
    const report = await client.reports.getByCallsign(year, week, callsign);
    console.log('Report:', report);
    
    // Try to get associated image (if exists)
    try {
      const imageBlob = await client.reports.getImage(year, week, `${callsign}.jpg`);
      const url = URL.createObjectURL(imageBlob);
      console.log('Image URL:', url);
    } catch (error) {
      if (error instanceof HttpError && error.status === 404) {
        console.log('No image available for this report');
      } else {
        throw error;
      }
    }
    
  } catch (error) {
    if (error instanceof HttpError) {
      console.error(`Failed to fetch report: ${error.message}`);
    } else {
      console.error('Unexpected error:', error);
    }
  }
}

getReportWithImages(2026, 44, 'W5XYZ');
```

### Avatar Upload Example

```typescript
import { createCqqrsClient, HttpError } from './classes/CqqrsApiClient';

async function handleAvatarUpload(
  callsign: string,
  fileInputElement: HTMLInputElement
) {
  const client = createCqqrsClient();
  const file = fileInputElement.files?.[0];
  
  if (!file) {
    alert('Please select a file');
    return;
  }
  
  try {
    console.log(`Uploading avatar for ${callsign}...`);
    const result = await client.members.uploadAvatar(callsign, file);
    
    console.log('Upload successful!');
    console.log('New avatar URL:', result.url);
    
    // Display the new avatar
    const img = new Image();
    img.src = result.url;
    document.getElementById('avatar-preview').appendChild(img);
    
  } catch (error) {
    if (error instanceof HttpError) {
      if (error.status === 400) {
        alert('Error: ' + error.message);
      } else if (error.status === 500) {
        alert('Server error uploading avatar');
      } else {
        alert(`Upload failed: ${error.message}`);
      }
    } else {
      alert('Unexpected error during upload');
    }
  }
}

// Usage in HTML
document.getElementById('upload-btn').addEventListener('click', () => {
  handleAvatarUpload('W5XYZ', document.getElementById('file-input'));
});
```

## Configuration Options

### `CqqrsApiConfig`

```typescript
interface CqqrsApiConfig {
  baseUrl?: string;      // Default: 'https://conryclan.com/projects/cqqrsnet/api'
  apiVersion?: string;   // Default: 'v1'
  timeout?: number;      // Default: 30000 (milliseconds)
}
```

## Performance Considerations

- **Caching**: The API uses ETags for caching. The server will return 304 Not Modified for unchanged resources.
- **Timeout**: Default timeout is 30 seconds. Adjust based on your network conditions.
- **Image Size**: Large image files may take longer to fetch. Consider showing a loading indicator.
- **Batch Operations**: For multiple requests, consider batching them with `Promise.all()`.

```typescript
// Good: Parallel requests
const [reports, members] = await Promise.all([
  client.reports.getAll(2026, 44),
  client.members.getAll(),
]);
```

## Browser Compatibility

This client library requires:
- ES2015+ (modern JavaScript)
- Fetch API support
- Promise support
- FormData support (for file uploads)

Browsers:
- Chrome 40+
- Firefox 39+
- Safari 10.1+
- Edge 14+

## Troubleshooting

### "Network request failed"
- Check your internet connection
- Verify the `baseUrl` is correct
- Check that the API server is running and accessible

### "CORS Error"
- The server must be configured to allow cross-origin requests from your domain
- Check the server's CORS configuration

### "Timeout"
- The request took longer than the configured timeout
- Try increasing the timeout value: `createCqqrsClient({ timeout: 60000 })`
- Check your network connection

### "File must be a JPEG image"
- Only JPEG images are accepted for avatar uploads
- Convert your image to JPEG format before uploading

## Contributing

To improve this client library, please:

1. Add more comprehensive type definitions
2. Add helper methods for common operations
3. Improve error handling and messages
4. Add request/response interceptors
5. Add request retry logic

## License

Same license as the CQQRS project.
