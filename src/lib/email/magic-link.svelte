<script lang="ts">
	import {
		Body,
		Container,
		Head,
		Heading,
		Html,
		Preview,
		Section,
		Text,
		Hr,
		Link,
		Button
	} from 'svelte-email';

	interface Props {
		url?: string;
		appName?: string;
	}

	let { url = 'https://Yaa Qeen.com/login/verify', appName = 'Yaa Qeen' }: Props = $props();

	const main = {
		backgroundColor: '#f3f4f6',
		fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
	};

	const container = {
		margin: '0 auto',
		padding: '40px 0 48px',
		maxWidth: '560px',
	};

	const card = {
		backgroundColor: '#ffffff',
		borderRadius: '16px',
		boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
		overflow: 'hidden',
		border: '1px solid #e5e7eb',
	};

	const header = {
		backgroundColor: '#10B981',
		padding: '32px 0',
		textAlign: 'center' as const,
	};

	const content = {
		padding: '40px 48px',
	};

	const h1 = {
		color: '#1f2937',
		fontSize: '24px',
		fontWeight: '700',
		lineHeight: '32px',
		margin: '0 0 24px',
		textAlign: 'center' as const,
	};

	const text = {
		color: '#4b5563',
		fontSize: '16px',
		lineHeight: '26px',
		margin: '0 0 16px',
	};

	const button = {
		backgroundColor: '#10B981',
		borderRadius: '12px',
		color: '#fff',
		fontSize: '16px',
		fontWeight: '600',
		textDecoration: 'none',
		textAlign: 'center' as const,
		display: 'block',
		width: '100%',
		padding: '16px 0',
		margin: '32px 0',
		boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2), 0 2px 4px -1px rgba(16, 185, 129, 0.1)',
	};

	const footer = {
		color: '#9ca3af',
		fontSize: '12px',
		lineHeight: '20px',
		marginTop: '32px',
		textAlign: 'center' as const,
	};

	const link = {
		color: '#10B981',
		textDecoration: 'underline',
	};
	
	const linkText = {
		...link,
		wordBreak: 'break-all' as const,
	};
</script>

<Html>
	<Head />
	<Preview>Masuk ke {appName}</Preview>
	<Body style={main}>
		<Container style={container}>
			<Section style={card}>
				<!-- Brand Header -->
				<Section style={header}>
					<Heading as="h1" style={{ color: '#ffffff', margin: '0', fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px' }}>
						{appName}
					</Heading>
				</Section>

				<Section style={content}>
					<Heading as="h2" style={h1}>
						Tautan Masuk
					</Heading>
					
					<Text style={text}>
						Assalamualaikum,
					</Text>
					
					<Text style={text}>
						Klik tombol di bawah ini untuk masuk ke akun <strong>{appName}</strong> Anda. Tautan ini hanya berlaku selama <strong>15 menit</strong>.
					</Text>

					<Button style={button} href={url}>
						Masuk ke {appName}
					</Button>

					<Text style={text}>
						Atau salin dan tempel tautan ini di browser Anda:
						<br />
						<Link href={url} style={linkText}>{url}</Link>
					</Text>

					<Text style={text}>
						Jika Anda tidak meminta tautan ini, mohon abaikan email ini.
					</Text>
					
					<Hr style={{ borderColor: '#e5e7eb', margin: '32px 0' }} />
					
					<Text style={footer}>
						&copy; {new Date().getFullYear()} {appName}. All rights reserved.
						<br />
						<Link href="#" style={link}>Kebijakan Privasi</Link> • <Link href="#" style={link}>Syarat & Ketentuan</Link>
					</Text>
				</Section>
			</Section>
		</Container>
	</Body>
</Html>
