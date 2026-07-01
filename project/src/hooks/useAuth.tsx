import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAmbassador: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAmbassador, setIsAmbassador] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      checkAmbassadorStatus(session?.user?.email);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      await checkAmbassadorStatus(session?.user?.email);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAmbassadorStatus = async (email: string | undefined) => {
    if (!email) {
      setIsAmbassador(false);
      return;
    }
    try {
      const { data } = await supabase
        .from('ambassador_contacts')
        .select('id')
        .eq('email', email)
        .eq('is_active', true)
        .single();
      setIsAmbassador(!!data);
    } catch {
      setIsAmbassador(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setIsAmbassador(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isAmbassador, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useAmbassadorAuth() {
  const { user, session, loading, isAmbassador, signIn, signOut } = useAuth();
  
  if (!loading && !isAmbassador) {
    throw new Error('User is not an ambassador');
  }
  
  return { user, session, loading, signIn, signOut };
}
