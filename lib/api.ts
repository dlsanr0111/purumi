// API 관련 함수들을 모아놓은 파일
// 추후 서버 연동 시 사용할 함수들

export interface VideoStats {
  id: string;
  likes: number;
  views: number;
  isLiked: boolean;
}

// 비디오 좋아요 상태 업데이트
export const updateVideoLike = async (videoId: string, isLiked: boolean): Promise<void> => {
  // TODO: 실제 API 엔드포인트로 교체
  const response = await fetch(`/api/videos/${videoId}/like`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ isLiked }),
  });

  if (!response.ok) {
    throw new Error('좋아요 업데이트 실패');
  }
};

// 비디오 조회수 업데이트
export const updateVideoView = async (videoId: string): Promise<void> => {
  // TODO: 실제 API 엔드포인트로 교체
  const response = await fetch(`/api/videos/${videoId}/view`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('조회수 업데이트 실패');
  }
};

// 비디오 통계 정보 가져오기
export const getVideoStats = async (videoId: string): Promise<VideoStats> => {
  // TODO: 실제 API 엔드포인트로 교체
  const response = await fetch(`/api/videos/${videoId}/stats`);
  
  if (!response.ok) {
    throw new Error('비디오 통계 조회 실패');
  }
  
  return response.json();
};

// 여러 비디오의 통계 정보 일괄 조회
export const getMultipleVideoStats = async (videoIds: string[]): Promise<VideoStats[]> => {
  // TODO: 실제 API 엔드포인트로 교체
  const response = await fetch('/api/videos/stats', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ videoIds }),
  });
  
  if (!response.ok) {
    throw new Error('비디오 통계 일괄 조회 실패');
  }
  
  return response.json();
};
