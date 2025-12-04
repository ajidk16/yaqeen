import { render } from 'svelte/server';
import Otp from '$lib/email/otp.svelte';
import MagicLink from '$lib/email/magic-link.svelte';

export const load = async () => {
	const otpResult = render(Otp, {
		props: {
			otp: '123456',
			appName: 'Yaa Qeen'
		}
	});

	const magicLinkResult = render(MagicLink, {
		props: {
			url: 'http://localhost:5173/login/verify?token=xyz',
			appName: 'Yaa Qeen'
		}
	});

	return {
		otpHtml: otpResult.body,
		magicLinkHtml: magicLinkResult.body
	};
};
