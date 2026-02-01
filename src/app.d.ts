// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import type * as schema from '$lib/server/db/schema.js';

declare global {
	namespace App {
		interface Platform {
			env: Env;
			ctx: ExecutionContext;
			caches: CacheStorage;
			cf?: IncomingRequestCfProperties;
		}

		// interface Error {}
		interface Locals {
			db: DrizzleD1Database<typeof schema>;
			user: schema.User | null;
			sessionId: string | null;
		}
		// interface PageData {}
		// interface PageState {}
	}
}

export {};
