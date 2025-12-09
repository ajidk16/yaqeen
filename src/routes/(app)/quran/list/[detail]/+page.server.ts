import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
    const surahNumber = Number(params.detail);

    if (isNaN(surahNumber) || surahNumber < 1 || surahNumber > 114) {
        error(404, 'Surah tidak ditemukan');
    }


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

    let userInteractions = {
        bookmarks: [] as { ayahNumber: number; surahNumber: number }[],
        highlights: [] as { ayahNumber: number; surahNumber: number; color: string }[],
        notes: [] as { ayahNumber: number; surahNumber: number; text: string }[]
    };

    if (locals?.user?.id) {
        const userId = locals.user.id;

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
                    eq(table.quranBookmarks.userId, String(locals.user?.id)),
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
                    userId: String(locals.user?.id),
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
                    eq(table.quranHighlights.userId, String(locals.user?.id)),
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
                    userId: String(locals.user?.id),
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
                    eq(table.quranNotes.userId, String(locals.user?.id)),
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
                    userId: String(locals.user?.id),
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
                    eq(table.quranNotes.userId, String(locals.user?.id)),
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
                    eq(table.quranProgress.userId, String(locals.user?.id)),
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
                    userId: String(locals.user?.id),
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
                    eq(table.hafalanProgress.userId, String(locals.user?.id)),
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
                    userId: String(locals.user?.id),
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
