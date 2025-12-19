import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getHeatmapData } from '$lib/server/services/heatmapService';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	const heatmapData = await getHeatmapData(locals.user.id, 12);

	return {
		heatmap: heatmapData
	};
};
