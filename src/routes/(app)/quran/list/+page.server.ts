import { getAccessToken,  } from '$lib/server/quran';

export const load = async ({cookies}) => { 
    const accessToken =  await getAccessToken();
    cookies.set('quran_access_token', accessToken, { path: '/' });

    const chapters = await fetch(`https://equran.id/api/v2/surat`).then(res => res.json());

    // const chaptersdk = await quran.chapters.findAll();
    // console.log('chaptersdk', chaptersdk);

    // const chapters = await getChapters(accessToken,QURAN_CLIENT_ID);


    return {
        accessToken,
        chapters
    };
}