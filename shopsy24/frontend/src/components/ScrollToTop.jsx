import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component
 * Scrolls the page to the top whenever the route changes.
 * This component doesn't render any UI - it only handles the scroll behavior.
 */
const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        // Scroll to the top of the page when the route changes
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'instant' // Use 'instant' for immediate scroll, 'smooth' for animated scroll
        });
    }, [pathname]);

    return null; // This component doesn't render anything
};

export default ScrollToTop;
