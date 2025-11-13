"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { usePathname } from "next/navigation";

type LoadingContextType = {
  loading: boolean;
  setLoading: (value: boolean) => void;
};

const LoadingContext = createContext<LoadingContextType>({
  loading: false,
  setLoading: () => {},
});

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  // ✨ عند تغير الصفحة، أوقف اللودر
  useEffect(() => {
    if (loading) {
       setLoading(false);; // تأخير بسيط لنعومة
     
    }
  }, [pathname]);

  return (
    <LoadingContext.Provider value={{ loading, setLoading }}>
      {loading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="relative flex flex-col items-center">
            <div className="w-14 h-14 border-4 border-t-transparent border-blue-500 rounded-full animate-spin" />
            <p className="text-white mt-4 text-sm font-medium animate-pulse">
              جاري تحميل الصفحة ...
            </p>
          </div>
        </div>
      )}
      {children}
    </LoadingContext.Provider>
  );
}

export const useLoading = () => useContext(LoadingContext);
