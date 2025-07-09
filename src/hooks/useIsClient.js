import { useEffect, useState } from "react";

/**
 * Hook to check if the component is running on the client-side.
 * Helps prevent Next.js hydration mismatches.
 */
const useIsClient = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
};

export default useIsClient;
