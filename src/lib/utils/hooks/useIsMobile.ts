import { useEffect, useState } from "react";

export function detectMobile() {
  if ("maxTouchPoints" in navigator) {
    return navigator.maxTouchPoints > 0;
  } else {
    const mediaQuery = matchMedia("(pointer:coarse)");
    if (mediaQuery && mediaQuery.media === "(pointer:coarse)") {
      return !!mediaQuery.matches;
    } else if ("orientation" in window) {
      return true;
    } else {
      // Only as a last resort, fall back to user agent sniffing
      const USER_AGENT = navigator.userAgent;

      return (
        /\b(BlackBerry|webOS|iPhone|IEMobile)\b/i.test(USER_AGENT) ||
        /\b(Android|Windows Phone|iPad|iPod)\b/i.test(USER_AGENT)
      );
    }
  }
}

export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(detectMobile());
  }, []);

  return [isMobile];
};
