import type { Config } from 'drizzle-kit';

export default {
	out: './drizzle',
	schema: './src/lib/server/db/schema.ts',
	dialect: 'sqlite',
	driver: 'd1-http',
	dbCredentials: {
		databaseId: '14712071-bedb-456b-b893-79afc64c8944',
		accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
		token: process.env.CLOUDFLARE_TOKEN!
	}
} satisfies Config;
