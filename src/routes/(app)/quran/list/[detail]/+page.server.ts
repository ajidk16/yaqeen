import { quranApi } from '$lib/server/quran-api';
import { quranMetadata } from '$lib/data/quran-metadata';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const chapterNumber = parseInt(params.detail);
    console.log(`Loading Surah data for chapter number: ${chapterNumber}`);
	const surahMeta = quranMetadata.find((s) => s.number === chapterNumber);

    // Fetch verses from API
    // We try to request a reasonably large per_page to get most surahs in one go, 
    // or we might need to handle pagination in the client if we want full mushaf.
    // For this integration, we'll try to get as many as allowed.
    const apiResponse = await quranApi.getVerses(chapterNumber);

    let ayahs = [];

    if (apiResponse && apiResponse.verses) {
        ayahs = apiResponse.verses.map((verse: any) => ({
            number: verse.verse_number,
            // Prioritize Uthmani, fallback to Indopak or simple text
            text: verse.text_uthmani || verse.text_indopak || verse.text_imlaei,
            // Assuming first translation is the one requested (ID)
            translation: verse.translations?.[0]?.text || 'Terjemahan tidak tersedia',
            tafsir: 'Tafsir belum tersedia via API' // API usually requires separate call for Tafsir
        }));
    } else {
        // Fallback to dummy data if API fails or for offline dev
        console.warn('Using dummy/empty data due to API failure');
        ayahs = [];
    }

	return {
		surahData: {
            number: chapterNumber,
            name: surahMeta?.name || `Surah ${chapterNumber}`,
            ayahs: ayahs
        },
        meta: surahMeta
	};
};
