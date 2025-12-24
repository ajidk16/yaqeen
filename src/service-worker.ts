/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />
/* eslint-disable @typescript-eslint/no-explicit-any */

import { build, files, version } from '$service-worker';

const sw = self as unknown as ServiceWorkerGlobalScope;

// Cache names
const CACHE_NAME = `habbitrax-cache-${version}`;
const STATIC_CACHE = `habbitrax-static-${version}`;

// Assets to cache immediately
const STATIC_ASSETS = [
	...(build || []),
	...(files || [])
];

console.log('[ServiceWorker] Initializing...', { version, buildCount: (build || []).length, filesCount: (files || []).length });

// Install event - cache static assets
sw.addEventListener('install', (event) => {
	event.waitUntil(
		(async () => {
			const cache = await caches.open(STATIC_CACHE);
			await cache.addAll(STATIC_ASSETS);
			await sw.skipWaiting();
		})()
	);
});

// Activate event - clean up old caches
sw.addEventListener('activate', (event) => {
	event.waitUntil(
		(async () => {
			const keys = await caches.keys();
			await Promise.all(
				keys
					.filter((key) => key !== CACHE_NAME && key !== STATIC_CACHE)
					.map((key) => caches.delete(key))
			);
			await sw.clients.claim();
		})()
	);
});

// Fetch event - serve from cache, fallback to network
sw.addEventListener('fetch', (event) => {
	const url = new URL(event.request.url);

	// Skip non-GET requests
	if (event.request.method !== 'GET') {
		return;
	}

	// Skip Chrome extension requests
	if (url.protocol === 'chrome-extension:') {
		return;
	}

	// API requests - network first with timeout
	if (url.pathname.startsWith('/api/')) {
		event.respondWith(networkFirst(event.request));
		return;
	}

	// Static assets - cache first
	if (STATIC_ASSETS.includes(url.pathname)) {
		event.respondWith(cacheFirst(event.request));
		return;
	}

	// Navigation requests - network first, fallback to offline page
	if (event.request.mode === 'navigate') {
		event.respondWith(networkFirstWithOfflineFallback(event.request));
		return;
	}

	// Default - stale while revalidate
	event.respondWith(staleWhileRevalidate(event.request));
});

/**
 * Cache first strategy - good for static assets
 */
async function cacheFirst(request: Request): Promise<Response> {
	const cached = await caches.match(request);
	if (cached) {
		return cached;
	}

	try {
		const response = await fetch(request);
		if (response.ok) {
			const cache = await caches.open(CACHE_NAME);
			cache.put(request, response.clone());
		}
		return response;
	} catch {
		return new Response('Offline', { status: 503 });
	}
}

/**
 * Network first strategy - good for API calls
 */
async function networkFirst(request: Request): Promise<Response> {
	try {
		const response = await fetchWithTimeout(request, 5000);
		if (response.ok) {
			const cache = await caches.open(CACHE_NAME);
			cache.put(request, response.clone());
		}
		return response;
	} catch {
		const cached = await caches.match(request);
		if (cached) {
			return cached;
		}
		return new Response(JSON.stringify({ error: 'Offline' }), {
			status: 503,
			headers: { 'Content-Type': 'application/json' }
		});
	}
}

/**
 * Network first with offline fallback for navigation
 */
async function networkFirstWithOfflineFallback(request: Request): Promise<Response> {
	try {
		const response = await fetchWithTimeout(request, 5000);
		if (response.ok) {
			const cache = await caches.open(CACHE_NAME);
			cache.put(request, response.clone());
		}
		return response;
	} catch {
		const cached = await caches.match(request);
		if (cached) {
			return cached;
		}
		// Return cached root page as fallback
		const fallback = await caches.match('/');
		if (fallback) {
			return fallback;
		}
		return new Response('Offline', { status: 503 });
	}
}

/**
 * Stale while revalidate strategy
 */
async function staleWhileRevalidate(request: Request): Promise<Response> {
	const cached = await caches.match(request);

	const fetchPromise = fetch(request).then((response) => {
		if (response.ok) {
			const cache = caches.open(CACHE_NAME);
			cache.then((c) => c.put(request, response.clone()));
		}
		return response;
	}).catch(() => null);

	return cached || (await fetchPromise) || new Response('Offline', { status: 503 });
}

/**
 * Fetch with timeout
 */
function fetchWithTimeout(request: Request, timeout: number): Promise<Response> {
	return new Promise((resolve, reject) => {
		const timer = setTimeout(() => reject(new Error('Timeout')), timeout);

		fetch(request).then((response) => {
			clearTimeout(timer);
			resolve(response);
		}).catch((error) => {
			clearTimeout(timer);
			reject(error);
		});
	});
}

// Background sync support
sw.addEventListener('sync', (event: any) => {
	if (event.tag === 'habbitrax-sync') {
		event.waitUntil(
			sw.clients.matchAll().then((clients) => {
				clients.forEach((client) => {
					client.postMessage({ type: 'SYNC_REQUESTED' });
				});
			})
		);
	}
});

// Push notification support (for future use)
sw.addEventListener('push', (event) => {
	if (event.data) {
		const data = event.data.json();
		event.waitUntil(
			sw.registration.showNotification(data.title || 'YaaQeen', {
				body: data.body,
				icon: '/icons/icon-192.png',
				badge: '/icons/icon-192.png',
				data: data.data
			})
		);
	}
});

// Notification click handler
sw.addEventListener('notificationclick', (event) => {
	event.notification.close();

	event.waitUntil(
		sw.clients.matchAll({ type: 'window' }).then((clients) => {
			// Focus existing window if available
			for (const client of clients) {
				if ('focus' in client) {
					return client.focus();
				}
			}
			// Open new window
			return sw.clients.openWindow('/');
		})
	);
});
