import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabase";

type SessionContextType = {
  session: any;
  loading: boolean;
};

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setLoading(false);
    });

    return () => {
      listener?.subscription?.unsubscribe?.();
    };
  }, []);

  return (
    <SessionContext.Provider value={{ session, loading }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside AuthProvider");
  return ctx;
}
