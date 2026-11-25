# CQQRS API Client - Integration Guide

This guide shows how to integrate the CQQRS API client with popular web frameworks.

## Table of Contents

- [React](#react)
- [Vue 3](#vue-3)
- [Svelte](#svelte)
- [Angular](#angular)
- [Plain TypeScript/JavaScript](#plain-typescriptjavascript)
- [Next.js](#nextjs)

---

## React

### Using Hooks

```typescript
// hooks/useCqqrsApi.ts
import { useEffect, useState } from 'react';
import { createCqqrsClient, HttpError, type Member } from '../classes/CqqrsApiClient';

const client = createCqqrsClient();

export function useMember(callsign: string) {
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    client.members
      .get(callsign)
      .then(setMember)
      .catch((err) => {
        if (err instanceof HttpError) {
          setError(`Error ${err.status}: ${err.message}`);
        } else {
          setError('Unknown error');
        }
      })
      .finally(() => setLoading(false));
  }, [callsign]);

  return { member, loading, error };
}

export function useAllMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    client.members
      .getAll()
      .then(setMembers)
      .catch((err) => {
        if (err instanceof HttpError) {
          setError(`Error ${err.status}: ${err.message}`);
        } else {
          setError('Unknown error');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return { members, loading, error };
}

export function useReports(year: number, week: number) {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    client.reports
      .getAll(year, week)
      .then(setReports)
      .catch((err) => {
        if (err instanceof HttpError) {
          setError(`Error ${err.status}: ${err.message}`);
        } else {
          setError('Unknown error');
        }
      })
      .finally(() => setLoading(false));
  }, [year, week]);

  return { reports, loading, error };
}
```

### Using Components

```typescript
// components/MemberCard.tsx
import React from 'react';
import { useMember } from '../hooks/useCqqrsApi';

interface Props {
  callsign: string;
}

export const MemberCard: React.FC<Props> = ({ callsign }) => {
  const { member, loading, error } = useMember(callsign);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!member) return <div>Not found</div>;

  return (
    <div className="card">
      <h3>{member.callsign}</h3>
      <p>{member.name}</p>
      {/* Additional member details */}
    </div>
  );
};
```

### File Upload in React

```typescript
// components/AvatarUpload.tsx
import React, { useState } from 'react';
import { createCqqrsClient, HttpError } from '../classes/CqqrsApiClient';

const client = createCqqrsClient();

interface Props {
  callsign: string;
  onSuccess?: (url: string) => void;
}

export const AvatarUpload: React.FC<Props> = ({ callsign, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const result = await client.members.uploadAvatar(callsign, file);
      onSuccess?.(result.url);
    } catch (err) {
      if (err instanceof HttpError) {
        setError(`Upload failed: ${err.message}`);
      } else {
        setError('Unknown error during upload');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/jpeg"
        onChange={handleFileChange}
        disabled={loading}
      />
      {error && <p className="error">{error}</p>}
      {loading && <p>Uploading...</p>}
    </div>
  );
};
```

---

## Vue 3

### Using Composables

```typescript
// composables/useCqqrsApi.ts
import { ref, onMounted } from 'vue';
import { createCqqrsClient, HttpError, type Member } from '../classes/CqqrsApiClient';

const client = createCqqrsClient();

export function useMember(callsign: string) {
  const member = ref<Member | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  onMounted(async () => {
    loading.value = true;
    try {
      member.value = await client.members.get(callsign);
    } catch (err) {
      if (err instanceof HttpError) {
        error.value = `Error ${err.status}: ${err.message}`;
      } else {
        error.value = 'Unknown error';
      }
    } finally {
      loading.value = false;
    }
  });

  return { member, loading, error };
}

export function useAllMembers() {
  const members = ref<Member[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  onMounted(async () => {
    loading.value = true;
    try {
      members.value = await client.members.getAll();
    } catch (err) {
      if (err instanceof HttpError) {
        error.value = `Error ${err.status}: ${err.message}`;
      } else {
        error.value = 'Unknown error';
      }
    } finally {
      loading.value = false;
    }
  });

  return { members, loading, error };
}
```

### Using Components

```typescript
<!-- components/MemberCard.vue -->
<script setup lang="ts">
import { useMember } from '../composables/useCqqrsApi';

interface Props {
  callsign: string;
}

const props = defineProps<Props>();
const { member, loading, error } = useMember(props.callsign);
</script>

<template>
  <div v-if="loading" class="loading">Loading...</div>
  <div v-else-if="error" class="error">{{ error }}</div>
  <div v-else-if="member" class="card">
    <h3>{{ member.callsign }}</h3>
    <p>{{ member.name }}</p>
  </div>
  <div v-else>Not found</div>
</template>

<style scoped>
.card {
  border: 1px solid #ccc;
  padding: 1rem;
  border-radius: 8px;
}
</style>
```

### File Upload in Vue

```typescript
<!-- components/AvatarUpload.vue -->
<script setup lang="ts">
import { ref } from 'vue';
import { createCqqrsClient, HttpError } from '../classes/CqqrsApiClient';

const client = createCqqrsClient();

interface Props {
  callsign: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{ success: [url: string] }>();

const loading = ref(false);
const error = ref<string | null>(null);

const handleFileChange = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  loading.value = true;
  error.value = null;

  try {
    const result = await client.members.uploadAvatar(props.callsign, file);
    emit('success', result.url);
  } catch (err) {
    if (err instanceof HttpError) {
      error.value = `Upload failed: ${err.message}`;
    } else {
      error.value = 'Unknown error during upload';
    }
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div>
    <input
      type="file"
      accept="image/jpeg"
      @change="handleFileChange"
      :disabled="loading"
    />
    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="loading">Uploading...</p>
  </div>
</template>
```

---

## Svelte

### Using Stores

```typescript
// stores/cqqrs.ts
import { writable, readable } from 'svelte/store';
import { createCqqrsClient, HttpError, type Member } from '../classes/CqqrsApiClient';

const client = createCqqrsClient();

export function createMemberStore(callsign: string) {
  const { subscribe, set } = writable<{
    member: Member | null;
    loading: boolean;
    error: string | null;
  }>({
    member: null,
    loading: true,
    error: null,
  });

  client.members
    .get(callsign)
    .then((member) => set({ member, loading: false, error: null }))
    .catch((err) => {
      const error =
        err instanceof HttpError ? `Error ${err.status}: ${err.message}` : 'Unknown error';
      set({ member: null, loading: false, error });
    });

  return { subscribe };
}

export function createMembersStore() {
  const { subscribe, set } = writable<{
    members: Member[];
    loading: boolean;
    error: string | null;
  }>({
    members: [],
    loading: true,
    error: null,
  });

  client.members
    .getAll()
    .then((members) => set({ members, loading: false, error: null }))
    .catch((err) => {
      const error =
        err instanceof HttpError ? `Error ${err.status}: ${err.message}` : 'Unknown error';
      set({ members: [], loading: false, error });
    });

  return { subscribe };
}
```

### Using Components

```svelte
<!-- components/MemberCard.svelte -->
<script lang="ts">
  import { createMemberStore } from '../stores/cqqrs';

  export let callsign: string;

  let store = createMemberStore(callsign);
  let { member, loading, error } = $store;

  $: store = createMemberStore(callsign);
  $: ({ member, loading, error } = $store);
</script>

{#if loading}
  <div>Loading...</div>
{:else if error}
  <div class="error">{error}</div>
{:else if member}
  <div class="card">
    <h3>{member.callsign}</h3>
    <p>{member.name}</p>
  </div>
{:else}
  <div>Not found</div>
{/if}

<style>
  .card {
    border: 1px solid #ccc;
    padding: 1rem;
    border-radius: 8px;
  }
</style>
```

---

## Angular

### Using Services

```typescript
// services/cqqrs.service.ts
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { createCqqrsClient, HttpError, type Member } from '../classes/CqqrsApiClient';

@Injectable({
  providedIn: 'root',
})
export class CqqrsService {
  private client = createCqqrsClient();

  getMember(callsign: string): Observable<Member> {
    return new Observable((observer) => {
      this.client.members
        .get(callsign)
        .then((member) => {
          observer.next(member);
          observer.complete();
        })
        .catch((err) => {
          if (err instanceof HttpError) {
            observer.error(`Error ${err.status}: ${err.message}`);
          } else {
            observer.error('Unknown error');
          }
        });
    });
  }

  getAllMembers(): Observable<Member[]> {
    return new Observable((observer) => {
      this.client.members
        .getAll()
        .then((members) => {
          observer.next(members);
          observer.complete();
        })
        .catch((err) => {
          if (err instanceof HttpError) {
            observer.error(`Error ${err.status}: ${err.message}`);
          } else {
            observer.error('Unknown error');
          }
        });
    });
  }

  uploadAvatar(callsign: string, file: File): Observable<string> {
    return new Observable((observer) => {
      this.client.members
        .uploadAvatar(callsign, file)
        .then((result) => {
          observer.next(result.url);
          observer.complete();
        })
        .catch((err) => {
          if (err instanceof HttpError) {
            observer.error(`Upload failed: ${err.message}`);
          } else {
            observer.error('Unknown error');
          }
        });
    });
  }
}
```

### Using Components

```typescript
// components/member-card.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { CqqrsService } from '../services/cqqrs.service';
import type { Member } from '../classes/CqqrsApiClient';

@Component({
  selector: 'app-member-card',
  template: `
    <div *ngIf="loading">Loading...</div>
    <div *ngIf="error" class="error">{{ error }}</div>
    <div *ngIf="member" class="card">
      <h3>{{ member.callsign }}</h3>
      <p>{{ member.name }}</p>
    </div>
    <div *ngIf="!loading && !error && !member">Not found</div>
  `,
  styles: [`
    .card {
      border: 1px solid #ccc;
      padding: 1rem;
      border-radius: 8px;
    }
  `],
})
export class MemberCardComponent implements OnInit {
  @Input() callsign!: string;

  member: Member | null = null;
  loading = false;
  error: string | null = null;

  constructor(private cqqrsService: CqqrsService) {}

  ngOnInit() {
    this.loading = true;
    this.cqqrsService.getMember(this.callsign).subscribe({
      next: (member) => {
        this.member = member;
        this.loading = false;
      },
      error: (err) => {
        this.error = err;
        this.loading = false;
      },
    });
  }
}
```

---

## Plain TypeScript/JavaScript

### Basic Usage

```typescript
// main.ts
import { createCqqrsClient, HttpError } from './classes/CqqrsApiClient';

const client = createCqqrsClient();

async function main() {
  try {
    // Get all members
    const members = await client.members.getAll();
    console.log('Members:', members);

    // Get specific member
    const member = await client.members.get('W5XYZ');
    console.log('Member:', member);

    // Get reports
    const reports = await client.reports.getAll(2026, 44);
    console.log('Reports:', reports);
  } catch (error) {
    if (error instanceof HttpError) {
      console.error(`HTTP ${error.status}: ${error.message}`);
    } else {
      console.error('Error:', error);
    }
  }
}

main();
```

### HTML Integration

```html
<!DOCTYPE html>
<html>
<head>
  <title>CQQRS App</title>
</head>
<body>
  <div id="app"></div>

  <script type="module">
    import { createCqqrsClient, HttpError } from './classes/CqqrsApiClient.ts';

    const client = createCqqrsClient();

    async function loadMembers() {
      try {
        const members = await client.members.getAll();
        const html = members
          .map((m) => `<li>${m.callsign}</li>`)
          .join('');
        document.getElementById('app').innerHTML = `<ul>${html}</ul>`;
      } catch (error) {
        if (error instanceof HttpError) {
          document.getElementById('app').innerHTML =
            `<p class="error">Error: ${error.message}</p>`;
        }
      }
    }

    loadMembers();
  </script>
</body>
</html>
```

---

## Next.js

### Using Server Components

```typescript
// app/members/page.tsx
import { createCqqrsClient } from '@/classes/CqqrsApiClient';

const client = createCqqrsClient();

export default async function MembersPage() {
  const members = await client.members.getAll();

  return (
    <div>
      <h1>Members</h1>
      <ul>
        {members.map((member) => (
          <li key={member.callsign}>{member.callsign}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Using Client Components

```typescript
// components/MemberList.tsx
'use client';

import { useEffect, useState } from 'react';
import { createCqqrsClient, HttpError, type Member } from '@/classes/CqqrsApiClient';

const client = createCqqrsClient();

export default function MemberList() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    client.members
      .getAll()
      .then(setMembers)
      .catch((err) => {
        if (err instanceof HttpError) {
          setError(`Error ${err.status}: ${err.message}`);
        } else {
          setError('Unknown error');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <ul>
      {members.map((member) => (
        <li key={member.callsign}>{member.callsign}</li>
      ))}
    </ul>
  );
}
```

---

## Common Patterns

### Error Boundary

```typescript
// utils/errorHandler.ts
import { HttpError } from '../classes/CqqrsApiClient';

export function getErrorMessage(error: unknown): string {
  if (error instanceof HttpError) {
    if (error.status === 404) {
      return 'Resource not found';
    } else if (error.status === 400) {
      return 'Invalid request';
    } else if (error.status >= 500) {
      return 'Server error. Please try again later.';
    }
    return error.message;
  } else if (error instanceof Error) {
    return error.message;
  }
  return 'Unknown error occurred';
}
```

### Request Retry

```typescript
// utils/withRetry.ts
import { createCqqrsClient, HttpError } from '../classes/CqqrsApiClient';

export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let lastError: unknown;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      // Don't retry on 400, 404, 401, 403
      if (error instanceof HttpError && error.status < 500 && error.status !== 408) {
        throw error;
      }
      // Wait before retrying
      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, i)));
      }
    }
  }

  throw lastError;
}
```

---

## Summary

The CQQRS API Client integrates seamlessly with:
- **React** - Hooks and components
- **Vue 3** - Composables and components
- **Svelte** - Stores and components
- **Angular** - Services and components
- **Next.js** - Server and client components
- **Plain TS/JS** - Direct usage

Choose the pattern that matches your framework and start building!
