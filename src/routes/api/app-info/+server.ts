import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';

const APP_VERSION = '1.0.0';

export const GET: RequestHandler = async () => {
	return json({
		data: {
			installed_version: APP_VERSION,
			latest_version: APP_VERSION,
			update_available: false
		}
	});
};
