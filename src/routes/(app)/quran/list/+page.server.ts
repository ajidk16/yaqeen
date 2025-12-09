import { getAccessToken,  } from '$lib/server/quran';

export const load = async ({cookies}) => { 
    const accessToken =  await getAccessToken();
    cookies.set('quran_access_token', accessToken, { path: '/' });

    const chapters = await fetch(`https://equran.id/api/v2/surat`).then(res => res.json());



    return {
        accessToken,
        chapters
    };
}