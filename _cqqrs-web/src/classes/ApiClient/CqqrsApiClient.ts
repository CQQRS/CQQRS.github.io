/**
 * CQQRS API Client Library
 * Type-safe TypeScript client for the CQQRS API
 */

import { ApiReportToReportConvertor } from "../ApiReportToReportConvertor";
import { IApiReport } from "../IApiReport";
import { MemberEntry } from "../MemberDirectory";
import { Report } from "../Report";



export interface Member {
	callsign: string;
	[key: string]: unknown;
}

export interface IMemberEntry {
	callsign: string;
	name: string;
	qth: string;
	grid: string;
	reported: number[];
	lastActive: string;
}

export interface ApiResponse<T> {
	status: number;
	data: T;
	headers: Record<string, string>;
}

export interface UploadAvatarResponse {
	status: string;
	url: string;
}

export interface UpsertMembersResponse {
	status?: string;
	[key: string]: unknown;
}

/**
 * Configuration options for the API client
 */
export interface CqqrsApiConfig {
	baseUrl?: string;
	apiVersion?: string;
	timeout?: number;
}

/**
 * CQQRS API Client
 * 
 * Provides a type-safe interface to the CQQRS API endpoints.
 * 
 * @example
 * ```typescript
 * const client = new CqqrsApiClient();
 * const reports = await client.reports.getAll(2026, 44);
 * const member = await client.members.get('W5XYZ');
 * ```
 */
export class CqqrsApiClient {
	private baseUrl: string;
	private apiVersion: string;
	private timeout: number;

	readonly reports: ReportsApi;
	readonly members: MembersApi;

	constructor(config: CqqrsApiConfig = {}) {
		this.baseUrl = config.baseUrl || 'https://conryclan.com/projects/cqqrsnet/api';
		this.apiVersion = config.apiVersion || 'v1';
		this.timeout = config.timeout || 30000;

		this.reports = new ReportsApi(this);
		this.members = new MembersApi(this);
	}

	/**
	 * Performs a fetch request with timeout and error handling
	 * @internal
	 */
	async request<T>(
		method: 'GET' | 'POST' | 'PUT' | 'DELETE',
		endpoint: string,
		options: RequestInit & { data?: unknown } = {}
	): Promise<ApiResponse<T>> {
		const url = `${this.baseUrl}/${this.apiVersion}${endpoint}`;
		const { data, ...fetchOptions } = options;

		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), this.timeout);

		try {
			const response = await fetch(url, {
				method,
				signal: controller.signal,
				headers: {
					'Content-Type': 'application/json',
					...options.headers,
				},
				body: data ? JSON.stringify(data) : undefined,
				...fetchOptions,
			});

			const headers: Record<string, string> = {};
			response.headers.forEach((value, key) => {
				headers[key] = value;
			});

			let responseData: T;

			if (response.status === 204) {
				responseData = null as T;
			} else if (response.headers.get('content-type')?.includes('application/json')) {
				responseData = await response.json();
			} else {
				responseData = (await response.text()) as T;
			}

			if (!response.ok) {
				throw new HttpError(
					response.status,
					typeof responseData === 'object' && responseData !== null && 'error' in responseData
						? (responseData as Record<string, unknown>).error
						: `HTTP ${response.status}`,
					responseData
				);
			}

			return {
				status: response.status,
				data: responseData,
				headers,
			};
		} finally {
			clearTimeout(timeoutId);
		}
	}
}

/**
 * HTTP Error class
 */
export class HttpError extends Error {
	constructor(
		public status: number,
		message: unknown,
		public responseData?: unknown
	) {
		super(typeof message === 'string' ? message : JSON.stringify(message));
		this.name = 'HttpError';
	}
}

/**
 * Reports API endpoints
 */
class ReportsApi {
	constructor(private client: CqqrsApiClient) { }

	/**
	 * Get all reports for a specific year and week
	 * 
	 * @param year - The year of the requested report
	 * @param week - The week-of-year of the requested report
	 * @returns Array of report entries
	 * 
	 * @example
	 * ```typescript
	 * const reports = await client.reports.getAll(2026, 44);
	 * ```
	 */
	async getAll(year: number, week: number): Promise<Report[]> {
		const { data } = await this.client.request<IApiReport[]>(
			'GET',
			`/reports/${year}/${week}`
		);
		return data.map( v=> 
			new ApiReportToReportConvertor(v).report
		);
	}

	/**
	 * Get a specific report by callsign
	 * 
	 * @param year - The year of the requested report
	 * @param week - The week-of-year of the requested report
	 * @param callsign - The callsign of the report to retrieve
	 * @returns The report entry for the specified callsign
	 * @throws {HttpError} If the report is not found (404)
	 * 
	 * @example
	 * ```typescript
	 * const report = await client.reports.getByCallsign(2026, 44, 'W5XYZ');
	 * ```
	 */
	async getByCallsign(year: number, week: number, callsign: string): Promise<Report> {
		const { data } = await this.client.request<IApiReport>(
			'GET',
			`/reports/${year}/${week}/${encodeURIComponent(callsign)}`
		);
		return new ApiReportToReportConvertor(data).report;
	}

	/**
	 * Get an image from a report
	 * 
	 * @param year - The year of the report
	 * @param week - The week-of-year of the report
	 * @param imageName - The name of the image file
	 * @returns The image as a Blob
	 * @throws {HttpError} If the image is not found (404)
	 * 
	 * @example
	 * ```typescript
	 * const imageBlob = await client.reports.getImage(2026, 44, 'photo.jpg');
	 * const url = URL.createObjectURL(imageBlob);
	 * ```
	 */
	async getImage(year: number, week: number, imageName: string): Promise<Blob> {
		const url = `${this.client['baseUrl']}/${this.client['apiVersion']}/reports/${year}/${week}/images/${encodeURIComponent(imageName)}`;

		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), this.client['timeout']);

		try {
			const response = await fetch(url, {
				signal: controller.signal,
			});

			if (!response.ok) {
				throw new HttpError(response.status, `HTTP ${response.status}`);
			}

			return await response.blob();
		} finally {
			clearTimeout(timeoutId);
		}
	}
}

/**
 * Members API endpoints
 */
class MembersApi {
	constructor(private client: CqqrsApiClient) { }

	/**
	 * Get all members
	 * 
	 * @returns Array of all members
	 * 
	 * @example
	 * ```typescript
	 * const members = await client.members.getAll();
	 * ```
	 */
	async getAll(): Promise<MemberEntry[]> {
		const { data } = await this.client.request<IMemberEntry[]>('GET', '/members/');
		return data.map(v=>new MemberEntry(v.callsign, v.name, v.qth, v.grid, 
			v.reported, v.lastActive));
	}

	/**
	 * Get a specific member by callsign
	 * 
	 * @param callsign - The callsign of the member to retrieve
	 * @returns The member information
	 * @throws {HttpError} If the member is not found (404)
	 * 
	 * @example
	 * ```typescript
	 * const member = await client.members.get('W5XYZ');
	 * ```
	 */
	async get(callsign: string): Promise<Member> {
		const { data } = await this.client.request<Member>(
			'GET',
			`/members/${encodeURIComponent(callsign)}`
		);
		return data;
	}

	/**
	 * Get a member's avatar
	 * 
	 * @param callsign - The callsign of the member
	 * @returns The avatar image as a Blob
	 * @throws {HttpError} If the avatar is not found (404)
	 * 
	 * @example
	 * ```typescript
	 * const avatarBlob = await client.members.getAvatar('W5XYZ');
	 * const url = URL.createObjectURL(avatarBlob);
	 * document.getElementById('avatar').src = url;
	 * ```
	 */
	async getAvatar(callsign: string): Promise<Blob> {
		const url = `${this.client['baseUrl']}/${this.client['apiVersion']}/members/${encodeURIComponent(callsign)}/avitar`;

		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), this.client['timeout']);

		try {
			const response = await fetch(url, {
				signal: controller.signal,
			});

			if (!response.ok) {
				throw new HttpError(response.status, `HTTP ${response.status}`);
			}

			return await response.blob();
		} finally {
			clearTimeout(timeoutId);
		}
	}

	/**
	 * Upload or update a member's avatar
	 * 
	 * @param callsign - The callsign of the member
	 * @param imageFile - The image file to upload (must be JPEG)
	 * @returns Upload response with the new avatar URL
	 * @throws {HttpError} If the upload fails
	 * 
	 * @example
	 * ```typescript
	 * const fileInput = document.getElementById('avatar-input') as HTMLInputElement;
	 * const file = fileInput.files?.[0];
	 * if (file) {
	 *   const result = await client.members.uploadAvatar('W5XYZ', file);
	 *   console.log('Avatar updated:', result.url);
	 * }
	 * ```
	 */
	async uploadAvatar(callsign: string, imageFile: File): Promise<UploadAvatarResponse> {
		const formData = new FormData();
		formData.append('file', imageFile);

		const url = `${this.client['baseUrl']}/${this.client['apiVersion']}/members/${encodeURIComponent(callsign)}/avitar`;

		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), this.client['timeout']);

		try {
			const response = await fetch(url, {
				method: 'POST',
				signal: controller.signal,
				body: formData,
			});

			const data = await response.json();

			if (!response.ok) {
				throw new HttpError(
					response.status,
					typeof data === 'object' && data !== null && 'error' in data ? data.error : `HTTP ${response.status}`,
					data
				);
			}

			return data;
		} finally {
			clearTimeout(timeoutId);
		}
	}

	/**
	 * Create or update members in bulk
	 * 
	 * @param members - Array of member objects to upsert
	 * @returns Response indicating success of the upsert operation
	 * @throws {HttpError} If the upsert fails
	 * 
	 * @example
	 * ```typescript
	 * const members = [
	 *   { callsign: 'W5XYZ', name: 'John Doe', email: 'john@example.com' },
	 *   { callsign: 'K0ABC', name: 'Jane Smith', email: 'jane@example.com' }
	 * ];
	 * const result = await client.members.upsert(members);
	 * console.log('Members updated:', result);
	 * ```
	 */
	async upsert(members: MemberEntry[]): Promise<UpsertMembersResponse> {
		const { data } = await this.client.request<UpsertMembersResponse>(
			'POST',
			'/members/',
			{ data: members }
		);
		return data;
	}
}

/**
 * Factory function for creating a client with custom configuration
 * 
 * @example
 * ```typescript
 * const client = createCqqrsClient({
 *   baseUrl: 'http://localhost:3000/api',
 *   timeout: 60000
 * });
 * ```
 */
export function createCqqrsClient(config?: CqqrsApiConfig): CqqrsApiClient {
	return new CqqrsApiClient(config);
}
