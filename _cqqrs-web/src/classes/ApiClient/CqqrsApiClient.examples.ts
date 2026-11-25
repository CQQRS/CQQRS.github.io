/**
 * Example usage of the CQQRS API Client
 * 
 * These examples demonstrate common use cases for the API client.
 */

import { createCqqrsClient, HttpError } from './CqqrsApiClient';

/**
 * Example 1: Fetch and display all members
 */
export async function exampleGetAllMembers() {
  const client = createCqqrsClient();

  try {
    const members = await client.members.getAll();
    console.log('All members:');
    members.forEach(member => {
      console.log(`- ${member.callsign}`);
    });
    return members;
  } catch (error) {
    if (error instanceof HttpError) {
      console.error(`Error fetching members: ${error.message}`);
    } else {
      console.error('Unexpected error:', error);
    }
  }
}

/**
 * Example 2: Fetch a specific member and their avatar
 */
export async function exampleGetMemberWithAvatar(callsign: string) {
  const client = createCqqrsClient();

  try {
    // Get member details
    const member = await client.members.get(callsign);
    console.log(`Member: ${member.callsign}`);
    console.log(member);

    // Get member avatar
    try {
      const avatarBlob = await client.members.getAvatar(callsign);
      const url = URL.createObjectURL(avatarBlob);
      console.log(`Avatar URL: ${url}`);

      // Display in image element
      const img = document.getElementById('member-avatar') as HTMLImageElement;
      if (img) {
        img.src = url;
        img.alt = `Avatar for ${callsign}`;
      }

      return { member, avatarUrl: url };
    } catch (avatarError) {
      if (avatarError instanceof HttpError && avatarError.status === 404) {
        console.warn(`No avatar found for ${callsign}`);
      } else {
        throw avatarError;
      }
    }
  } catch (error) {
    if (error instanceof HttpError) {
      if (error.status === 404) {
        console.error(`Member ${callsign} not found`);
      } else {
        console.error(`Error: ${error.message}`);
      }
    } else {
      console.error('Unexpected error:', error);
    }
  }
}

/**
 * Example 3: Upload a member avatar
 */
export async function exampleUploadAvatar(
  callsign: string,
  file: File
): Promise<string | null> {
  const client = createCqqrsClient();

  try {
    // Validate file type
    if (!file.type.startsWith('image/jpeg')) {
      console.error('File must be a JPEG image');
      return null;
    }

    console.log(`Uploading avatar for ${callsign}...`);
    const result = await client.members.uploadAvatar(callsign, file);

    console.log('Avatar uploaded successfully!');
    console.log(`New URL: ${result.url}`);

    return result.url;
  } catch (error) {
    if (error instanceof HttpError) {
      if (error.status === 400) {
        console.error(`Validation error: ${error.message}`);
      } else if (error.status === 500) {
        console.error('Server error during upload');
      } else {
        console.error(`Upload failed: ${error.message}`);
      }
    } else {
      console.error('Unexpected error:', error);
    }
    return null;
  }
}

/**
 * Example 4: Fetch reports for a specific edition
 */
export async function exampleGetReports(year: number, week: number) {
  const client = createCqqrsClient();

  try {
    console.log(`Fetching reports for ${year} week ${week}...`);
    const reports = await client.reports.getAll(year, week);

    console.log(`Found ${reports.length} reports:`);
    reports.forEach(report => {
      console.log(`- ${report.callsign}`);
    });

    return reports;
  } catch (error) {
    if (error instanceof HttpError) {
      console.error(`Error fetching reports: ${error.message}`);
    } else {
      console.error('Unexpected error:', error);
    }
  }
}

/**
 * Example 5: Fetch a specific report by callsign
 */
export async function exampleGetReportByCallsign(
  year: number,
  week: number,
  callsign: string
) {
  const client = createCqqrsClient();

  try {
    const report = await client.reports.getByCallsign(year, week, callsign);
    console.log(`Report for ${callsign}:`);
    console.log(report);
    return report;
  } catch (error) {
    if (error instanceof HttpError) {
      if (error.status === 404) {
        console.error(`Report not found for ${callsign}`);
      } else {
        console.error(`Error: ${error.message}`);
      }
    } else {
      console.error('Unexpected error:', error);
    }
  }
}

/**
 * Example 6: Fetch and display a report image
 */
export async function exampleGetReportImage(
  year: number,
  week: number,
  imageName: string
) {
  const client = createCqqrsClient();

  try {
    const imageBlob = await client.reports.getImage(year, week, imageName);
    const url = URL.createObjectURL(imageBlob);

    console.log(`Image loaded: ${imageName}`);

    // Display in image element
    const img = document.getElementById('report-image') as HTMLImageElement;
    if (img) {
      img.src = url;
      img.alt = imageName;
    }

    return url;
  } catch (error) {
    if (error instanceof HttpError) {
      if (error.status === 404) {
        console.error(`Image not found: ${imageName}`);
      } else {
        console.error(`Error: ${error.message}`);
      }
    } else {
      console.error('Unexpected error:', error);
    }
  }
}

/**
 * Example 7: Fetch multiple reports in parallel
 */
export async function exampleGetMultipleReports(
  year: number,
  weeks: number[]
): Promise<Record<number, unknown[]> | null> {
  const client = createCqqrsClient();

  try {
    // Fetch all reports in parallel
    const promises = weeks.map(week =>
      client.reports.getAll(year, week).catch(error => {
        console.warn(`Failed to fetch week ${week}:`, error.message);
        return [];
      })
    );

    const results = await Promise.all(promises);

    // Combine results
    const reportsByWeek: Record<number, unknown[]> = {};
    weeks.forEach((week, index) => {
      reportsByWeek[week] = results[index];
    });

    console.log('Reports fetched:', reportsByWeek);
    return reportsByWeek;
  } catch (error) {
    console.error('Error fetching reports:', error);
    return null;
  }
}

/**
 * Example 8: Handle file input for avatar upload
 */
export function setupAvatarUploadHandler(callsign: string) {
  const fileInput = document.getElementById(
    'avatar-input'
  ) as HTMLInputElement | null;
  const uploadBtn = document.getElementById('upload-btn') as HTMLButtonElement | null;

  if (!fileInput || !uploadBtn) {
    console.warn('File input or upload button not found');
    return;
  }

  uploadBtn.addEventListener('click', async () => {
    const file = fileInput.files?.[0];
    if (!file) {
      alert('Please select a file');
      return;
    }

    uploadBtn.disabled = true;
    uploadBtn.textContent = 'Uploading...';

    try {
      const url = await exampleUploadAvatar(callsign, file);
      if (url) {
        alert('Avatar uploaded successfully!');
        fileInput.value = '';
      }
    } finally {
      uploadBtn.disabled = false;
      uploadBtn.textContent = 'Upload';
    }
  });
}

/**
 * Example 9: Custom configuration example
 */
export async function exampleCustomConfiguration() {
  // Create a client with custom settings
  const client = createCqqrsClient({
    baseUrl: 'http://localhost:3000/api',
    apiVersion: 'v1',
    timeout: 60000, // 60 seconds
  });

  try {
    const members = await client.members.getAll();
    console.log('Members from custom server:', members);
  } catch (error) {
    console.error('Failed to connect to custom server:', error);
  }
}

/**
 * Example 10: Error handling best practices
 */
export async function exampleErrorHandling() {
  const client = createCqqrsClient();

  try {
    const report = await client.reports.getByCallsign(2026, 44, 'NONEXISTENT');
  } catch (error) {
    // Specific error handling
    if (error instanceof HttpError) {
      switch (error.status) {
        case 400:
          console.error('Bad request - check your parameters');
          break;
        case 404:
          console.error('Resource not found');
          break;
        case 500:
          console.error('Server error - try again later');
          break;
        default:
          console.error(`HTTP ${error.status}: ${error.message}`);
      }

      // Log response data for debugging
      if (error.responseData) {
        console.debug('Response data:', error.responseData);
      }
    } else if (error instanceof Error) {
      // Handle network errors, timeouts, etc.
      console.error('Network or timeout error:', error.message);
    } else {
      console.error('Unknown error:', error);
    }
  }
}
