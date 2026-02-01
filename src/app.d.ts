// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import { D1Database } from './types.ts';

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
			db: D1Database;
		}
		// interface PageData {}
		// interface PageState {}
	}
}

export {};
