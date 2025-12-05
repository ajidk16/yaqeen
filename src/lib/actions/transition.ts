/**
 * Action to trigger animations when an element enters the viewport.
 * Usage: <div use:animate={{ type: 'fade-in-up', delay: 200 }}>...</div>
 */
export function animate(node: HTMLElement, { type = 'fade-in-up', delay = 0, duration = 800, threshold = 0.1 } = {}) {
	const observer = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				node.style.animationName = type;
				node.style.animationDuration = `${duration}ms`;
				node.style.animationDelay = `${delay}ms`;
				node.style.animationFillMode = 'both';
				node.classList.add('visible');
				observer.unobserve(node);
			}
		});
	}, {
		threshold
	});

	node.classList.add('animate-on-scroll');
	observer.observe(node);

	return {
		destroy() {
			observer.disconnect();
		}
	};
}
