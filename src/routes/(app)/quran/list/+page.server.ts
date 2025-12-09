export const load = async () => {
    const chapters = await fetch(`https://equran.id/api/v2/surat`).then(res => res.json());

    return {
        chapters
    };
}