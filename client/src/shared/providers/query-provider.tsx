"use client";

import React, { useState, useEffect } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useIsFetching,
} from "@tanstack/react-query";

function ColdStartBanner() {
  const isFetching = useIsFetching();
  const [showNotice, setShowNotice] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (isFetching > 0) {
      // If requests take longer than 4 seconds
      timer = setTimeout(() => {
        setShowNotice(true);
      }, 4000);
    } else {
      setShowNotice(false);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isFetching]);

  if (!showNotice) return null;

  return (
    <aside
      aria-label="Server status alert"
      className="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-lg border border-amber-500/30 bg-amber-950/90 px-4 py-3 text-sm text-amber-200 shadow-xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-2"
    >
      <div className="h-2.5 w-2.5 animate-ping rounded-full bg-amber-400" />
      <p>
        <span className="font-semibold">Waking up the server...</span> this may take up to 50 seconds.
      </p>
    </aside>
  );
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ColdStartBanner />
    </QueryClientProvider>
  );
}

export default QueryProvider;
