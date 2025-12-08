import {  QURAN_CLIENT_ID, QURAN_CLIENT_SECRET } from "$env/static/private";
import { QuranClient } from "@quranjs/api";

const getAccessToken = async () => {
  const auth = Buffer.from(`${QURAN_CLIENT_ID}:${QURAN_CLIENT_SECRET}`).toString('base64');

  try {
    const response = await fetch('https://prelive-oauth2.quran.foundation/oauth2/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials&scope=content'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
}

export { getAccessToken };

export const quran = new QuranClient({
  clientId: QURAN_CLIENT_ID!,
  clientSecret: QURAN_CLIENT_SECRET!,
  
});


