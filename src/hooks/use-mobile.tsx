import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  // Default to false (desktop view) for SSR and initial client render
  // to ensure consistency before hydration.
  const [isMobile, setIsMobile] = React.useState(false);
  const [hasMounted, setHasMounted] = React.useState(false);

  React.useEffect(() => {
    // Set hasMounted to true first, so subsequent renders use the dynamic isMobile value.
    setHasMounted(true);

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    
    const onChange = () => {
      setIsMobile(mql.matches);
    };

    // Set the initial state based on the media query immediately after mounting
    setIsMobile(mql.matches);
    
    // Listen for changes
    mql.addEventListener("change", onChange);

    return () => {
      mql.removeEventListener("change", onChange);
    };
  }, []); // Empty dependency array ensures this runs once on mount (client-side)

  // On the server and during the first client render (before useEffect sets hasMounted to true),
  // this will return 'false'.
  // After mounting and the effect runs, it returns the actual client-determined 'isMobile' state.
  return hasMounted ? isMobile : false;
}
