/**
 * Action to detect when an element enters the viewport
 * @param node - The HTML element to observe
 * @param params - Configuration object
 * @param params.threshold - Intersection threshold (0.0 - 1.0)
 * @param params.unobserveOnEnter - Whether to stop observing after first entry (default: true)
 */
export function inview(node: HTMLElement, { threshold = 0.2, unobserveOnEnter = true } = {}) {
	let observer: IntersectionObserver;

	const handleIntersect = (entries: IntersectionObserverEntry[]) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				node.dispatchEvent(new CustomEvent('enter'));
				if (unobserveOnEnter) {
					observer.unobserve(node);
				}
			} else {
				node.dispatchEvent(new CustomEvent('leave'));
			}
		});
	};

	observer = new IntersectionObserver(handleIntersect, {
		threshold
	});

	observer.observe(node);

	return {
		destroy() {
			observer.disconnect();
		}
	};
}
