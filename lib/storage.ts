import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

// 저장소 키 상수
const STORAGE_KEYS = {
  GUEST_ID: 'guest_id',
  RESERVATION_DRAFT: 'reservation_draft',
  USER_SESSION: 'user_session',
} as const;

// 게스트 ID 관리
export const guestStorage = {
  // 게스트 ID 가져오기 (없으면 생성)
  async getGuestId(): Promise<string> {
    try {
      let guestId = await AsyncStorage.getItem(STORAGE_KEYS.GUEST_ID);
      if (!guestId) {
        guestId = uuidv4();
        await AsyncStorage.setItem(STORAGE_KEYS.GUEST_ID, guestId);
      }
      return guestId;
    } catch (error) {
      console.error('게스트 ID 가져오기 실패:', error);
      return uuidv4(); // 폴백으로 새 UUID 반환
    }
  },

  // 게스트 ID 삭제
  async clearGuestId(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.GUEST_ID);
    } catch (error) {
      console.error('게스트 ID 삭제 실패:', error);
    }
  },

  // 게스트 상태 확인
  async isGuest(): Promise<boolean> {
    try {
      const guestId = await AsyncStorage.getItem(STORAGE_KEYS.GUEST_ID);
      return !!guestId;
    } catch (error) {
      console.error('게스트 상태 확인 실패:', error);
      return false;
    }
  },
};

// 예약 초안 관리
export interface ReservationDraft {
  service_id: string;
  scheduled_for: string; // ISO 8601 형식
  note?: string;
}

export const draftStorage = {
  // 예약 초안 저장
  async saveDraft(draft: ReservationDraft): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.RESERVATION_DRAFT, JSON.stringify(draft));
    } catch (error) {
      console.error('예약 초안 저장 실패:', error);
    }
  },

  // 예약 초안 가져오기
  async getDraft(): Promise<ReservationDraft | null> {
    try {
      const draft = await AsyncStorage.getItem(STORAGE_KEYS.RESERVATION_DRAFT);
      return draft ? JSON.parse(draft) : null;
    } catch (error) {
      console.error('예약 초안 가져오기 실패:', error);
      return null;
    }
  },

  // 예약 초안 삭제
  async clearDraft(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.RESERVATION_DRAFT);
    } catch (error) {
      console.error('예약 초안 삭제 실패:', error);
    }
  },

  // 예약 초안 존재 여부 확인
  async hasDraft(): Promise<boolean> {
    try {
      const draft = await AsyncStorage.getItem(STORAGE_KEYS.RESERVATION_DRAFT);
      return !!draft;
    } catch (error) {
      console.error('예약 초안 확인 실패:', error);
      return false;
    }
  },
};

// 사용자 세션 관리 (추가 기능)
export const sessionStorage = {
  // 세션 정보 저장
  async saveSession(sessionData: any): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(sessionData));
    } catch (error) {
      console.error('세션 저장 실패:', error);
    }
  },

  // 세션 정보 가져오기
  async getSession(): Promise<any | null> {
    try {
      const session = await AsyncStorage.getItem(STORAGE_KEYS.USER_SESSION);
      return session ? JSON.parse(session) : null;
    } catch (error) {
      console.error('세션 가져오기 실패:', error);
      return null;
    }
  },

  // 세션 정보 삭제
  async clearSession(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_SESSION);
    } catch (error) {
      console.error('세션 삭제 실패:', error);
    }
  },
};

// 전체 저장소 초기화 (로그아웃 시)
export const clearAllStorage = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.GUEST_ID,
      STORAGE_KEYS.RESERVATION_DRAFT,
      STORAGE_KEYS.USER_SESSION,
    ]);
  } catch (error) {
    console.error('저장소 초기화 실패:', error);
  }
};
