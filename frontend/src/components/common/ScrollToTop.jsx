import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

export default function ScrollToTop() {
  const location = useLocation();
  const navType = useNavigationType();

  // Save the scroll position whenever the user scrolls on the current page
  useEffect(() => {
    let timeoutId;
    const handleScroll = () => {
      // Debounce slightly for performance
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        sessionStorage.setItem(`scrollPosition-${location.key}`, window.scrollY);
      }, 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, [location.key]);

  // Restore or reset scroll position on navigation
  useEffect(() => {
    if (navType !== 'POP') {
      // New navigation (clicking a link): scroll to top immediately
      window.scrollTo(0, 0);
    } else {
      // Back/Forward navigation: restore exact scroll position
      const savedPosition = sessionStorage.getItem(`scrollPosition-${location.key}`);
      if (savedPosition !== null) {
        const y = parseInt(savedPosition, 10);
        
        // Immediate restore
        window.scrollTo(0, y);
        
        // Fallback restore (in case the page takes a moment to render content like images/data)
        setTimeout(() => {
          window.scrollTo(0, y);
        }, 100);
      }
    }
  }, [location.pathname, location.key, navType]);

  return null;
}
