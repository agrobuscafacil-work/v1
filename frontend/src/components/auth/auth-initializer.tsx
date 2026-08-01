'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const loadUser = useAuth((s) => s.loadUser);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return <>{children}</>;
}
