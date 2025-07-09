import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function ScrollRestoration() {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChangeStart = (url) => {
      // Save the current scroll position before navigating away
      sessionStorage.setItem(
        router.asPath,
        JSON.stringify({ x: window.scrollX, y: window.scrollY })
      );
    };

    const handleRouteChangeComplete = (url) => {
      // Check if we have saved a scroll position for this path
      const savedPosition = sessionStorage.getItem(url);
      if (savedPosition) {
        const { x, y } = JSON.parse(savedPosition);
        const estimatedTimeoutMilliseconds = 10;
        setTimeout(() => {
          window.scrollTo(x, y);
          if (url === '/') {
            // Clear sessionStorage when navigating to the root path `/`
            sessionStorage.clear();
          }
        }, estimatedTimeoutMilliseconds);

      } else {
        window.scrollTo(0, 0); // If no saved position, scroll to the top
      }
    };

    // Attach the event handlers
    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);

    // Cleanup the event handlers when the component unmounts
    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
    };
  }, [router]);

  return null; // Utility component with no UI
}
