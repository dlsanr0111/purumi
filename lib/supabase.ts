import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Supabase 설정
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || 'https://iaeadujcimzpkzfwsqwr.supabase.co';
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhZWFkdWpjaW16cGt6ZndzcXdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MDQwODIsImV4cCI6MjA3Mjk4MDA4Mn0.CvxRL_tqq2qtTaqE_eZItividP4Liu37rLs9zP-Bqcw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

// 데이터베이스 타입 정의
export interface VideoStats {
  id: string;
  title: string;
  video_url: string;
  likes: number;
  views: number;
  created_at: string;
  updated_at: string;
}

export interface UserLike {
  id: string;
  user_id: string;
  video_id: string;
  created_at: string;
}

// 인증 관련 타입
export interface Profile {
  id: string;
  email: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  user_type?: 'hospital' | 'personal';
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  duration_min: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Reservation {
  id: string;
  user_id: string;
  service_id: string;
  scheduled_for: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  note?: string;
  created_at: string;
  updated_at: string;
  service?: Service;
}

// 비디오 통계 관련 함수들
export const videoStatsService = {
  // 비디오 조회수 증가
  async incrementView(videoId: string): Promise<void> {
    const { error } = await supabase.rpc('increment_video_views', {
      video_id: videoId
    });
    
    if (error) {
      console.error('조회수 증가 실패:', error);
      throw error;
    }
  },

  // 좋아요 토글
  async toggleLike(videoId: string, userId: string): Promise<{ isLiked: boolean; likeCount: number }> {
    // 먼저 현재 좋아요 상태 확인
    const { data: existingLike, error: checkError } = await supabase
      .from('user_likes')
      .select('id')
      .eq('video_id', videoId)
      .eq('user_id', userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    const isCurrentlyLiked = !!existingLike;

    if (isCurrentlyLiked) {
      // 좋아요 취소
      const { error: deleteError } = await supabase
        .from('user_likes')
        .delete()
        .eq('video_id', videoId)
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      // 좋아요 수 감소
      const { error: decrementError } = await supabase.rpc('decrement_video_likes', {
        video_id: videoId
      });

      if (decrementError) throw decrementError;
    } else {
      // 좋아요 추가
      const { error: insertError } = await supabase
        .from('user_likes')
        .insert({ video_id: videoId, user_id: userId });

      if (insertError) throw insertError;

      // 좋아요 수 증가
      const { error: incrementError } = await supabase.rpc('increment_video_likes', {
        video_id: videoId
      });

      if (incrementError) throw incrementError;
    }

    // 업데이트된 좋아요 수 조회
    const { data: videoStats, error: statsError } = await supabase
      .from('video_stats')
      .select('likes')
      .eq('id', videoId)
      .single();

    if (statsError) throw statsError;

    return {
      isLiked: !isCurrentlyLiked,
      likeCount: videoStats.likes
    };
  },

  // 비디오 통계 조회
  async getVideoStats(videoId: string): Promise<VideoStats | null> {
    const { data, error } = await supabase
      .from('video_stats')
      .select('*')
      .eq('id', videoId)
      .single();

    if (error) {
      console.error('비디오 통계 조회 실패:', error);
      return null;
    }

    return data;
  },

  // 사용자의 좋아요 상태 확인
  async getUserLikeStatus(videoId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('user_likes')
      .select('id')
      .eq('video_id', videoId)
      .eq('user_id', userId)
      .single();

    return !!data && !error;
  }
};

// 인증 관련 서비스
export const authService = {
  // 이메일/비밀번호로 로그인
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  // 회원가입
  async signUp(email: string, password: string, profileData?: Partial<Profile>) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    // 회원가입 성공 시 프로필 정보 업데이트
    if (data.user && profileData) {
      await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          email: data.user.email!,
          ...profileData,
        });
    }

    return { data, error };
  },

  // 로그아웃
  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // 현재 세션 가져오기
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    return { data, error };
  },

  // 현재 사용자 가져오기
  async getCurrentUser() {
    const { data, error } = await supabase.auth.getUser();
    return { data, error };
  },

  // 프로필 가져오기
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('프로필 조회 실패:', error);
      return null;
    }

    return data;
  },

  // 프로필 업데이트
  async updateProfile(userId: string, updates: Partial<Profile>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    return { data, error };
  },
};

// 예약 관련 서비스
export const reservationService = {
  // 서비스 목록 가져오기
  async getServices(): Promise<Service[]> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('active', true)
      .order('name');

    if (error) {
      console.error('서비스 목록 조회 실패:', error);
      return [];
    }

    return data || [];
  },

  // 예약 생성
  async createReservation(reservationData: {
    user_id: string;
    service_id: string;
    scheduled_for: string;
    note?: string;
  }) {
    const { data, error } = await supabase
      .from('reservations')
      .insert(reservationData)
      .select()
      .single();

    return { data, error };
  },

  // 사용자 예약 목록 가져오기
  async getUserReservations(userId: string): Promise<Reservation[]> {
    const { data, error } = await supabase
      .from('reservations')
      .select(`
        *,
        service:services(*)
      `)
      .eq('user_id', userId)
      .order('scheduled_for', { ascending: false });

    if (error) {
      console.error('예약 목록 조회 실패:', error);
      return [];
    }

    return data || [];
  },

  // 예약 상태 업데이트
  async updateReservationStatus(reservationId: string, status: 'pending' | 'confirmed' | 'cancelled') {
    const { data, error } = await supabase
      .from('reservations')
      .update({ status })
      .eq('id', reservationId)
      .select()
      .single();

    return { data, error };
  },
};
