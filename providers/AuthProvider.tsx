import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { useSegments, useRouter } from 'expo-router';
import { supabase, authService } from '../lib/supabase';
import { guestStorage } from '../lib/storage';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isGuest: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, profileData?: any) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  continueAsGuest: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  const segments = useSegments();
  const router = useRouter();

  // 세션 상태 확인 및 라우팅 가드
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        // Supabase 세션 확인
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('세션 확인 실패:', error);
        }

        setSession(session);
        setUser(session?.user ?? null);

        // 게스트 상태 확인
        const guestStatus = await guestStorage.isGuest();
        setIsGuest(guestStatus && !session);

        // 라우팅 가드
        await handleRouting(session, guestStatus);
      } catch (error) {
        console.error('인증 상태 확인 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuthState();

    // 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('인증 상태 변경:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);

        // 게스트 상태 업데이트
        const guestStatus = await guestStorage.isGuest();
        setIsGuest(guestStatus && !session);

        // 라우팅 처리
        await handleRouting(session, guestStatus);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // 라우팅 가드 로직
  const handleRouting = async (session: Session | null, isGuest: boolean) => {
    const inAuthGroup = segments[0] === '(auth)';
    const isProtectedRoute = segments[0] === 'reservation';

    // 로그인된 사용자가 인증 페이지에 접근하는 경우
    if (session && inAuthGroup) {
      router.replace('/home');
      return;
    }

    // 보호된 라우트에 접근하는 경우
    if (isProtectedRoute && !session && !isGuest) {
      router.replace('/sign-in?redirect=/reservation');
      return;
    }

    // 게스트가 보호된 라우트에 접근하는 경우
    if (isProtectedRoute && isGuest && !session) {
      router.replace('/sign-in?redirect=/reservation');
      return;
    }

    // 인증되지 않은 사용자가 홈에 접근하는 경우
    if (segments[0] === 'home' && !session && !isGuest) {
      router.replace('/sign-in');
      return;
    }

    // 게스트 또는 로그인된 사용자가 인증 페이지에 접근하는 경우
    if ((session || isGuest) && inAuthGroup) {
      router.replace('/home');
      return;
    }
  };

  // 로그인 함수
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await authService.signIn(email, password);
      return { error };
    } catch (error) {
      console.error('로그인 실패:', error);
      return { error };
    }
  };

  // 회원가입 함수
  const signUp = async (email: string, password: string, profileData?: any) => {
    try {
      const { error } = await authService.signUp(email, password, profileData);
      return { error };
    } catch (error) {
      console.error('회원가입 실패:', error);
      return { error };
    }
  };

  // 로그아웃 함수
  const signOut = async () => {
    try {
      await authService.signOut();
      await guestStorage.clearGuestId();
      setIsGuest(false);
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  // 게스트로 계속하기
  const continueAsGuest = async () => {
    try {
      await guestStorage.getGuestId(); // 게스트 ID 생성/확인
      setIsGuest(true);
      router.replace('/home');
    } catch (error) {
      console.error('게스트 모드 진입 실패:', error);
    }
  };

  const value: AuthContextType = {
    session,
    user,
    loading,
    isGuest,
    signIn,
    signUp,
    signOut,
    continueAsGuest,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// 인증 컨텍스트 사용 훅
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
