import type { PageServerLoad } from './$types';
import { quran } from '$lib/server/quran';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
	// Updated auth logic based on hooks.server.ts
    const user = locals.user;
    const session = locals.session;
	const surahNumber = Number(params.detail);

	if (isNaN(surahNumber) || surahNumber < 1 || surahNumber > 114) {
		error(404, 'Surah tidak ditemukan');
	}
    
    // --- DUMMY DATA for Al-Fatihah ---
    const alFatihahVerses = [
        {
            id: 1,
            number: { inSurah: 1 },
            text: { arab: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ' },
            transliteration: { text: "Bismillāhir-raḥmānir-raḥīm" },
            translation: { text: "Dengan nama Allah Yang Maha Pengasih, Maha Penyayang." },
            tafsir: { text: "Ayat ini disebut Basmalah. Setiap Muslim dianjurkan untuk memulai setiap pekerjaan dengan menyebut nama Allah. Ar-Rahman dan Ar-Rahim keduanya berasal dari kata rahmat, namun Ar-Rahman menunjukkan kasih sayang yang luas mencakup semua makhluk, sedangkan Ar-Rahim khusus untuk orang-orang beriman." }
        },
        {
            id: 2,
            number: { inSurah: 2 },
            text: { arab: 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ' },
            transliteration: { text: "Al-ḥamdu lillāhi rabbil-'ālamīn" },
            translation: { text: "Segala puji bagi Allah, Tuhan seluruh alam." },
            tafsir: { text: "Al-Hamd adalah pujian yang sempurna yang hanya layak bagi Allah. Rabb berarti Tuhan yang memelihara, mengatur, dan mendidik seluruh alam. Al-'Alamin mencakup semua makhluk: manusia, jin, malaikat, hewan, tumbuhan, dan seluruh alam semesta." }
        },
        {
            id: 3,
            number: { inSurah: 3 },
            text: { arab: 'ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ' },
            transliteration: { text: "Ar-raḥmānir-raḥīm" },
            translation: { text: "Yang Maha Pengasih, Maha Penyayang." },
            tafsir: { text: "Pengulangan dua sifat ini menegaskan betapa luasnya kasih sayang Allah. Dalam hadits Qudsi, Allah berfirman bahwa rahmat-Nya mengalahkan murka-Nya. Rahmat Allah meliputi segala sesuatu dan diberikan kepada semua makhluk." }
        },
        {
            id: 4,
            number: { inSurah: 4 },
            text: { arab: 'مَـٰلِكِ يَوْمِ ٱلدِّينِ' },
            transliteration: { text: "Māliki yawmid-dīn" },
            translation: { text: "Pemilik hari pembalasan." },
            tafsir: { text: "Yaumid-Din adalah Hari Kiamat, hari di mana semua amal akan dihisab dan dibalas. Allah adalah satu-satunya Penguasa dan Hakim pada hari itu. Tidak ada seorang pun yang dapat menolong kecuali dengan izin-Nya." }
        },
        {
            id: 5,
            number: { inSurah: 5 },
            text: { arab: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ' },
            transliteration: { text: "Iyyāka na'budu wa iyyāka nasta'īn" },
            translation: { text: "Hanya kepada Engkaulah kami menyembah dan hanya kepada Engkaulah kami memohon pertolongan." },
            tafsir: { text: "Ayat ini adalah inti tauhid. Mendahulukan objek (Iyyaka) menunjukkan pengkhususan ibadah hanya untuk Allah. Ibadah tanpa pertolongan Allah tidak akan terlaksana, maka kita memohon pertolongan-Nya dalam segala urusan." }
        },
        {
            id: 6,
            number: { inSurah: 6 },
            text: { arab: 'ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ' },
            transliteration: { text: "Ihdinash-shirātal-mustaqīm" },
            translation: { text: "Tunjukilah kami jalan yang lurus." },
            tafsir: { text: "Ash-Shirath Al-Mustaqim adalah jalan Islam, jalan yang ditempuh oleh Nabi Muhammad ﷺ dan para sahabatnya. Hidayah yang dimohon meliputi petunjuk ke jalan yang benar dan kekuatan untuk istiqamah di atasnya." }
        },
        {
            id: 7,
            number: { inSurah: 7 },
            text: { arab: 'صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ' },
            transliteration: { text: "Shirāthal-ladhīna an'amta 'alayhim ghayril-maghdhūbi 'alayhim wa ladh-dhāllīn" },
            translation: { text: "(Yaitu) jalan orang-orang yang telah Engkau beri nikmat, bukan (jalan) mereka yang dimurkai, dan bukan (pula jalan) mereka yang sesat." },
            tafsir: { text: "Orang-orang yang diberi nikmat adalah para Nabi, shiddiqin, syuhada, dan orang-orang saleh. Al-Maghdhubi 'alaihim adalah mereka yang mengetahui kebenaran tapi tidak mengamalkannya. Adh-Dhallin adalah mereka yang beribadah tanpa ilmu." }
        }
    ];

    const dummySurah = {
        id: surahNumber,
        nameSimple: 'Al-Fatihah',
        nameArabic: 'الفاتحة',
        translatedName: { name: 'Pembukaan' },
        versesCount: 7,
        bismillahPre: false,
        revelationPlace: 'makkah',
        pageNumber: 1
    };

    // Full text for mushaf page view
    const mushafPageText = `بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ ۝١ ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ ۝٢ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ ۝٣ مَـٰلِكِ يَوْمِ ٱلدِّينِ ۝٤ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ۝٥ ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ ۝٦ صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ ۝٧`;

    const quranResponse = await fetch(`https://equran.id/api/v2/surat/${surahNumber}`);
    if (!quranResponse.ok) {
        throw error(500, 'Gagal mengambil data dari API Quran');
    }
    const quranData = await quranResponse.json();

    const tafsirResponse = await fetch(`https://equran.id/api/v2/tafsir/${surahNumber}`);
    if (!tafsirResponse.ok) {
        throw error(500, 'Gagal mengambil data tafsir dari API Quran');
    }
    const tafsirData = await tafsirResponse.json();

    // Fetch real user interactions from database
    let userInteractions = {
        bookmarks: [] as { ayahNumber: number; surahNumber: number }[],
        highlights: [] as { ayahNumber: number; surahNumber: number; color: string }[],
        notes: [] as { ayahNumber: number; surahNumber: number; text: string }[]
    };

    if (session?.user?.id) {
        const userId = session.user.id;

        // Fetch bookmarks
        const bookmarks = await db.query.quranBookmarks.findMany({
            where: and(
                eq(table.quranBookmarks.userId, userId),
                eq(table.quranBookmarks.surahNumber, surahNumber)
            )
        });
        userInteractions.bookmarks = bookmarks.map(b => ({
            ayahNumber: b.ayahNumber,
            surahNumber: b.surahNumber
        }));

        // Fetch highlights
        const highlights = await db.query.quranHighlights.findMany({
            where: and(
                eq(table.quranHighlights.userId, userId),
                eq(table.quranHighlights.surahNumber, surahNumber)
            )
        });
        userInteractions.highlights = highlights.map(h => ({
            ayahNumber: h.ayahNumber,
            surahNumber: h.surahNumber,
            color: h.color
        }));

        // Fetch notes
        const notes = await db.query.quranNotes.findMany({
            where: and(
                eq(table.quranNotes.userId, userId),
                eq(table.quranNotes.surahNumber, surahNumber)
            )
        });
        userInteractions.notes = notes.map(n => ({
            ayahNumber: n.ayahNumber,
            surahNumber: n.surahNumber,
            text: n.text
        }));
    }

    return {
        surah: dummySurah,
        verses: alFatihahVerses,
        mushafPageText: mushafPageText,
        quran: quranData,
        tafsir: tafsirData,
        pagination: { total: 7, totalPages: 1, currentPage: 1 },
        userInteractions
    };
};

export const actions = {
    toggleBookmark: async ({ request, locals }) => {
        const session = locals.session;
        if (!session) return { success: false, error: 'Unauthorized' };

        const formData = await request.formData();
        const surahNumber = Number(formData.get('surahNumber'));
        const ayahNumber = Number(formData.get('ayahNumber'));

        if (!surahNumber || !ayahNumber) return { success: false, error: 'Invalid data' };

        try {
            const existing = await db.query.quranBookmarks.findFirst({
                where: and(
                    eq(table.quranBookmarks.userId, session.user.id),
                    eq(table.quranBookmarks.surahNumber, surahNumber),
                    eq(table.quranBookmarks.ayahNumber, ayahNumber)
                )
            });

            if (existing) {
                await db.delete(table.quranBookmarks).where(eq(table.quranBookmarks.id, existing.id));
                return { success: true, action: 'removed' };
            } else {
                await db.insert(table.quranBookmarks).values({
                    id: crypto.randomUUID(),
                    userId: session.user.id,
                    surahNumber,
                    ayahNumber
                });
                return { success: true, action: 'added' };
            }
        } catch (e) {
            console.error(e);
            return { success: false, error: 'Database error' };
        }
    },

    updateHighlight: async ({ request, locals }) => {
        const session = locals.session;
        if (!session) return { success: false, error: 'Unauthorized' };

        const formData = await request.formData();
        const surahNumber = Number(formData.get('surahNumber'));
        const ayahNumber = Number(formData.get('ayahNumber'));
        const color = formData.get('color')?.toString();

        if (!surahNumber || !ayahNumber) return { success: false, error: 'Invalid data' };

        try {
            const existing = await db.query.quranHighlights.findFirst({
                 where: and(
                    eq(table.quranHighlights.userId, session.user.id),
                    eq(table.quranHighlights.surahNumber, surahNumber),
                    eq(table.quranHighlights.ayahNumber, ayahNumber)
                )
            });

            if (existing) {
                if (!color) {
                     await db.delete(table.quranHighlights).where(eq(table.quranHighlights.id, existing.id));
                     return { success: true, action: 'removed' };
                } else {
                     await db.update(table.quranHighlights).set({ color }).where(eq(table.quranHighlights.id, existing.id));
                     return { success: true, action: 'updated' };
                }
            } else if (color) {
                 await db.insert(table.quranHighlights).values({
                    id: crypto.randomUUID(),
                    userId: session.user.id,
                    surahNumber,
                    ayahNumber,
                    color
                });
                return { success: true, action: 'added' };
            }
        } catch (e) {
             console.error(e);
             return { success: false, error: 'Database error' };
        }
    },

    saveNote: async ({ request, locals }) => {
        const session = locals.session;
        if (!session) return { success: false, error: 'Unauthorized' };

        const formData = await request.formData();
        const surahNumber = Number(formData.get('surahNumber'));
        const ayahNumber = Number(formData.get('ayahNumber'));
        const text = formData.get('text')?.toString();

        if (!surahNumber || !ayahNumber || !text) return { success: false, error: 'Invalid data' };

        try {
            const existing = await db.query.quranNotes.findFirst({
                where: and(
                    eq(table.quranNotes.userId, session.user.id),
                    eq(table.quranNotes.surahNumber, surahNumber),
                    eq(table.quranNotes.ayahNumber, ayahNumber)
                )
            });

            if (existing) {
                await db.update(table.quranNotes)
                    .set({ text, updatedAt: new Date() })
                    .where(eq(table.quranNotes.id, existing.id));
                return { success: true, action: 'updated' };
            } else {
                await db.insert(table.quranNotes).values({
                    id: crypto.randomUUID(),
                    userId: session.user.id,
                    surahNumber,
                    ayahNumber,
                    text
                });
                return { success: true, action: 'added' };
            }
        } catch (e) {
            console.error(e);
            return { success: false, error: 'Database error' };
        }
    },

    deleteNote: async ({ request, locals }) => {
        const session = locals.session;
        if (!session) return { success: false, error: 'Unauthorized' };

        const formData = await request.formData();
        const surahNumber = Number(formData.get('surahNumber'));
        const ayahNumber = Number(formData.get('ayahNumber'));

        if (!surahNumber || !ayahNumber) return { success: false, error: 'Invalid data' };

        try {
            await db.delete(table.quranNotes).where(
                and(
                    eq(table.quranNotes.userId, session.user.id),
                    eq(table.quranNotes.surahNumber, surahNumber),
                    eq(table.quranNotes.ayahNumber, ayahNumber)
                )
            );
            return { success: true };
        } catch (e) {
            console.error(e);
            return { success: false, error: 'Database error' };
        }
    },

    addToTilawah: async ({ request, locals }) => {
        const session = locals.session;
        if (!session) return { success: false, error: 'Unauthorized' };

        const formData = await request.formData();
        const surahNumber = Number(formData.get('surahNumber'));
        const surahName = formData.get('surahName')?.toString() || '';
        const ayahNumber = Number(formData.get('ayahNumber'));

        if (!surahNumber || !ayahNumber) return { success: false, error: 'Invalid data' };

        const today = new Date().toISOString().split('T')[0];

        try {
            // Check if already has progress for today
            const existing = await db.query.quranProgress.findFirst({
                where: and(
                    eq(table.quranProgress.userId, session.user.id),
                    eq(table.quranProgress.date, today)
                )
            });

            if (existing) {
                // Update existing progress
                await db.update(table.quranProgress)
                    .set({ 
                        endPage: ayahNumber, // Using ayah as page reference
                        pagesRead: (existing.pagesRead || 0) + 1
                    })
                    .where(eq(table.quranProgress.id, existing.id));
            } else {
                await db.insert(table.quranProgress).values({
                    id: crypto.randomUUID(),
                    userId: session.user.id,
                    date: today,
                    startPage: ayahNumber,
                    endPage: ayahNumber,
                    pagesRead: 1
                });
            }
            return { success: true, action: 'added' };
        } catch (e) {
            console.error(e);
            return { success: false, error: 'Database error' };
        }
    },

    addToHafalan: async ({ request, locals }) => {
        const session = locals.session;
        if (!session) return { success: false, error: 'Unauthorized' };

        const formData = await request.formData();
        const surahNumber = Number(formData.get('surahNumber'));
        const surahName = formData.get('surahName')?.toString() || '';
        const ayahNumber = Number(formData.get('ayahNumber'));

        if (!surahNumber || !surahName || !ayahNumber) return { success: false, error: 'Invalid data' };

        const today = new Date().toISOString().split('T')[0];

        try {
            // Check if already tracking this surah
            const existing = await db.query.hafalanProgress.findFirst({
                where: and(
                    eq(table.hafalanProgress.userId, session.user.id),
                    eq(table.hafalanProgress.surahName, surahName)
                )
            });

            if (existing) {
                // Update progress array
                const progress = (existing.progress as number[]) || [];
                if (!progress.includes(ayahNumber)) {
                    progress.push(ayahNumber);
                    await db.update(table.hafalanProgress)
                        .set({ 
                            progress,
                            ayahEnd: Math.max(existing.ayahEnd, ayahNumber),
                            lastReviewed: new Date()
                        })
                        .where(eq(table.hafalanProgress.id, existing.id));
                }
            } else {
                await db.insert(table.hafalanProgress).values({
                    id: crypto.randomUUID(),
                    userId: session.user.id,
                    surahName,
                    date: today,
                    ayahStart: ayahNumber,
                    ayahEnd: ayahNumber,
                    progress: [ayahNumber],
                    status: 'memorizing'
                });
            }
            return { success: true, action: 'added' };
        } catch (e) {
            console.error(e);
            return { success: false, error: 'Database error' };
        }
    }
};
