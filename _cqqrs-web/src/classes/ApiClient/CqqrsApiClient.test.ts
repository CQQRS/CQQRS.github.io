/**
 * Unit tests for the CQQRS API Client
 * 
 * These tests verify the client's functionality and error handling.
 * Run with: `bun test CqqrsApiClient.test.ts`
 */

import { describe, it, expect, beforeEach, afterEach, mock } from 'bun:test';
import {
  CqqrsApiClient,
  HttpError,
  createCqqrsClient,
  type ReportEntry,
  type Member,
  type UploadAvatarResponse,
  type UpsertMembersResponse,
} from './CqqrsApiClient';

// Mock fetch globally
let fetchMock: ReturnType<typeof mock>;

beforeEach(() => {
  fetchMock = mock();
  global.fetch = fetchMock as any;
});

afterEach(() => {
  fetchMock.mockClear();
});

describe('CqqrsApiClient', () => {
  describe('initialization', () => {
    it('should create client with default config', () => {
      const client = new CqqrsApiClient();
      expect(client).toBeDefined();
      expect(client.reports).toBeDefined();
      expect(client.members).toBeDefined();
    });

    it('should create client with custom config', () => {
      const client = new CqqrsApiClient({
        baseUrl: 'http://localhost:3000/api',
        apiVersion: 'v2',
        timeout: 60000,
      });
      expect(client).toBeDefined();
    });

    it('should create client with factory function', () => {
      const client = createCqqrsClient({
        baseUrl: 'http://localhost:3000/api',
      });
      expect(client).toBeDefined();
    });
  });

  describe('reports.getAll', () => {
    it('should fetch all reports for a year and week', async () => {
      const mockData: ReportEntry[] = [
        { callsign: 'W5ABC' },
        { callsign: 'W5XYZ' },
      ];

      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: async () => mockData,
      } as any);

      const client = new CqqrsApiClient();
      const result = await client.reports.getAll(2026, 44);

      expect(result).toEqual(mockData);
    });

    it('should handle JSON response correctly', async () => {
      const mockData = [{ callsign: 'W5ABC' }];

      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: async () => mockData,
      } as any);

      const client = new CqqrsApiClient();
      const result = await client.reports.getAll(2026, 44);

      expect(result).toEqual(mockData);
    });
  });

  describe('reports.getByCallsign', () => {
    it('should fetch a specific report by callsign', async () => {
      const mockData: ReportEntry = {
        callsign: 'W5ABC',
        someField: 'someValue',
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: async () => mockData,
      } as any);

      const client = new CqqrsApiClient();
      const result = await client.reports.getByCallsign(2026, 44, 'W5ABC');

      expect(result).toEqual(mockData);
      expect(result.callsign).toBe('W5ABC');
    });

    it('should throw HttpError 404 when report not found', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 404,
        headers: new Map([['content-type', 'application/json']]),
        json: async () => ({ error: 'Not found' }),
      } as any);

      const client = new CqqrsApiClient();

      try {
        await client.reports.getByCallsign(2026, 44, 'INVALID');
        expect.unreachable();
      } catch (error) {
        expect(error).toBeInstanceOf(HttpError);
        if (error instanceof HttpError) {
          expect(error.status).toBe(404);
        }
      }
    });

    it('should encode callsign in URL', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: async () => ({ callsign: 'W5 ABC' }),
      } as any);

      const client = new CqqrsApiClient();
      await client.reports.getByCallsign(2026, 44, 'W5 ABC');

      expect(fetchMock).toHaveBeenCalled();
      const url = fetchMock.mock.calls[0]?.[0] as string;
      expect(url).toContain('W5%20ABC');
    });
  });

  describe('members.getAll', () => {
    it('should fetch all members', async () => {
      const mockData: Member[] = [
        { callsign: 'W5ABC' },
        { callsign: 'W5XYZ' },
      ];

      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: async () => mockData,
      } as any);

      const client = new CqqrsApiClient();
      const result = await client.members.getAll();

      expect(result).toEqual(mockData);
      expect(result.length).toBe(2);
    });
  });

  describe('members.get', () => {
    it('should fetch a specific member', async () => {
      const mockData: Member = {
        callsign: 'W5ABC',
        name: 'John Doe',
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: async () => mockData,
      } as any);

      const client = new CqqrsApiClient();
      const result = await client.members.get('W5ABC');

      expect(result).toEqual(mockData);
      expect(result.name).toBe('John Doe');
    });

    it('should throw HttpError 404 when member not found', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 404,
        headers: new Map([['content-type', 'application/json']]),
        json: async () => ({ error: 'Not found' }),
      } as any);

      const client = new CqqrsApiClient();

      try {
        await client.members.get('INVALID');
        expect.unreachable();
      } catch (error) {
        expect(error).toBeInstanceOf(HttpError);
        if (error instanceof HttpError) {
          expect(error.status).toBe(404);
        }
      }
    });
  });

  describe('members.upsert', () => {
    it('should upsert members', async () => {
      const membersData: Member[] = [
        { callsign: 'W5ABC', name: 'John Doe' },
        { callsign: 'K0XYZ', name: 'Jane Smith' },
      ];

      const mockResponse = {
        status: 'Success',
        created: 1,
        updated: 1,
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 201,
        headers: new Map([['content-type', 'application/json']]),
        json: async () => mockResponse,
      } as any);

      const client = new CqqrsApiClient();
      const result = await client.members.upsert(membersData);

      expect(result.status).toBe('Success');
      expect(result).toEqual(mockResponse);
    });

    it('should send POST request to /members/', async () => {
      const membersData: Member[] = [
        { callsign: 'W5ABC', name: 'John Doe' },
      ];

      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 201,
        headers: new Map([['content-type', 'application/json']]),
        json: async () => ({ status: 'Success' }),
      } as any);

      const client = new CqqrsApiClient();
      await client.members.upsert(membersData);

      const call = fetchMock.mock.calls[0];
      const url = call?.[0] as string;
      const options = call?.[1] as RequestInit;

      expect(url).toContain('/v1/members/');
      expect(options.method).toBe('POST');
      expect(options.headers).toEqual({
        'Content-Type': 'application/json',
      });
    });

    it('should throw HttpError on upsert failure', async () => {
      const membersData: Member[] = [
        { callsign: 'W5ABC', name: 'John Doe' },
      ];

      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: new Map([['content-type', 'application/json']]),
        json: async () => ({ error: 'Invalid member data' }),
      } as any);

      const client = new CqqrsApiClient();

      try {
        await client.members.upsert(membersData);
        expect.unreachable();
      } catch (error) {
        expect(error).toBeInstanceOf(HttpError);
        if (error instanceof HttpError) {
          expect(error.status).toBe(400);
        }
      }
    });
  });

  describe('error handling', () => {
    it('should create HttpError with status and message', () => {
      const error = new HttpError(404, 'Not found');
      expect(error.status).toBe(404);
      expect(error.message).toBe('Not found');
      expect(error).toBeInstanceOf(Error);
    });

    it('should include response data in HttpError', () => {
      const responseData = { error: 'Invalid request' };
      const error = new HttpError(400, 'Bad request', responseData);
      expect(error.responseData).toEqual(responseData);
    });

    it('should throw HttpError on server error', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 500,
        headers: new Map([['content-type', 'application/json']]),
        json: async () => ({ error: 'Internal server error' }),
      } as any);

      const client = new CqqrsApiClient();

      try {
        await client.members.getAll();
        expect.unreachable();
      } catch (error) {
        expect(error).toBeInstanceOf(HttpError);
        if (error instanceof HttpError) {
          expect(error.status).toBe(500);
        }
      }
    });

    it('should handle JSON error responses', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: new Map([['content-type', 'application/json']]),
        json: async () => ({ error: 'Validation failed' }),
      } as any);

      const client = new CqqrsApiClient();

      try {
        await client.members.getAll();
        expect.unreachable();
      } catch (error) {
        expect(error).toBeInstanceOf(HttpError);
        if (error instanceof HttpError) {
          expect(error.message).toContain('Validation failed');
        }
      }
    });
  });

  describe('request method', () => {
    it('should send correct HTTP method', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: async () => ({}),
      } as any);

      const client = new CqqrsApiClient();
      await client.members.getAll();

      const call = fetchMock.mock.calls[0];
      const options = call?.[1] as RequestInit;
      expect(options.method).toBe('GET');
    });

    it('should include Content-Type header', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: async () => ({}),
      } as any);

      const client = new CqqrsApiClient();
      await client.members.getAll();

      const call = fetchMock.mock.calls[0];
      const options = call?.[1] as RequestInit;
      expect(options.headers).toBeDefined();
    });

    it('should construct correct URL', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: async () => ({}),
      } as any);

      const client = new CqqrsApiClient({
        baseUrl: 'http://localhost:3000/api',
        apiVersion: 'v1',
      });
      await client.members.getAll();

      const url = fetchMock.mock.calls[0]?.[0] as string;
      expect(url).toContain('http://localhost:3000/api');
      expect(url).toContain('/v1/members');
    });
  });

  describe('timeout handling', () => {
    it('should use default timeout of 30 seconds', () => {
      const client = new CqqrsApiClient();
      expect(client['timeout']).toBe(30000);
    });

    it('should respect custom timeout', () => {
      const client = new CqqrsApiClient({ timeout: 60000 });
      expect(client['timeout']).toBe(60000);
    });
  });

  describe('response handling', () => {
    it('should handle 204 No Content', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 204,
        headers: new Map(),
      } as any);

      const client = new CqqrsApiClient();
      const result = await (client as any).request('GET', '/test');

      expect(result.status).toBe(204);
      expect(result.data).toBeNull();
    });

    it('should extract response headers', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map([
          ['content-type', 'application/json'],
          ['etag', '"abc123"'],
        ]),
        json: async () => ({}),
      } as any);

      const client = new CqqrsApiClient();
      const result = await (client as any).request('GET', '/test');

      expect(result.headers['etag']).toBe('"abc123"');
    });
  });
});
