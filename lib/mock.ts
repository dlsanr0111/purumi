// Mock 데이터 타입 정의
export interface Clinic {
  id: string;
  name: string;
  address: string;
  phone: string;
  rating: number;
  reviewCount: number;
  distance: number;
  specialties: string[];
  verified: boolean;
  lat: number;
  lng: number;
  images: string[];
  description: string;
  languages: string[];
  priceRange: string;
}

export interface Review {
  id: string;
  clinicId: string;
  userId: string;
  userName: string;
  rating: number;
  text: string;
  language: 'ko' | 'en' | 'ja' | 'zh';
  translatedText?: {
    ko?: string;
    en?: string;
    ja?: string;
    zh?: string;
  };
  createdAt: string;
  images?: string[];
  helpful: number;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
  duration: number;
  views: number;
  likes: number;
  clinicId?: string;
  tags: string[];
  createdAt: string;
}

export interface ProblemArea {
  id: string;
  name: string;
  icon: string;
  description: string;
}

// Mock 클리닉 데이터
export const mockClinics: Clinic[] = [
  {
    id: '1',
    name: '강남 뷰티클리닉',
    address: '서울특별시 강남구 테헤란로 123',
    phone: '02-1234-5678',
    rating: 4.8,
    reviewCount: 127,
    distance: 0.5,
    specialties: ['보톡스', '필러', '레이저'],
    verified: true,
    lat: 37.5665,
    lng: 126.9780,
    images: ['https://picsum.photos/300/200?random=1'],
    description: '강남 최고의 뷰티클리닉입니다.',
    languages: ['한국어', '영어', '일본어'],
    priceRange: '$$$',
  },
  {
    id: '2',
    name: '압구정 피부과',
    address: '서울특별시 강남구 압구정로 456',
    phone: '02-2345-6789',
    rating: 4.6,
    reviewCount: 89,
    distance: 1.2,
    specialties: ['여드름', '흉터', '안티에이징'],
    verified: true,
    lat: 37.5275,
    lng: 127.0280,
    images: ['https://picsum.photos/300/200?random=2'],
    description: '압구정의 명문 피부과입니다.',
    languages: ['한국어', '중국어'],
    priceRange: '$$',
  },
  {
    id: '3',
    name: '청담 성형외과',
    address: '서울특별시 강남구 청담동 789',
    phone: '02-3456-7890',
    rating: 4.9,
    reviewCount: 203,
    distance: 2.1,
    specialties: ['코성형', '눈성형', '가슴성형'],
    verified: true,
    lat: 37.5175,
    lng: 127.0480,
    images: ['https://picsum.photos/300/200?random=3'],
    description: '청담동의 프리미엄 성형외과입니다.',
    languages: ['한국어', '영어', '일본어', '중국어'],
    priceRange: '$$$$',
  },
];

// Mock 리뷰 데이터
export const mockReviews: Review[] = [
  {
    id: '1',
    clinicId: '1',
    userId: 'user1',
    userName: '김미영',
    rating: 5,
    text: '정말 만족스러운 시술이었어요! 선생님이 친절하시고 결과도 좋습니다.',
    language: 'ko',
    translatedText: {
      en: 'I was really satisfied with the procedure! The doctor was kind and the results were good.',
      ja: '本当に満足のいく施術でした！先生が親切で結果も良かったです。',
      zh: '真的很满意的手术！医生很亲切，效果也很好。',
    },
    createdAt: '2024-01-15T10:30:00Z',
    images: ['https://picsum.photos/200/200?random=11'],
    helpful: 12,
  },
  {
    id: '2',
    clinicId: '1',
    userId: 'user2',
    userName: 'Sarah Kim',
    rating: 4,
    text: 'Good service and professional staff. Would recommend to friends.',
    language: 'en',
    translatedText: {
      ko: '좋은 서비스와 전문적인 직원들. 친구들에게 추천하고 싶어요.',
      ja: '良いサービスと専門的なスタッフ。友達に推薦したいです。',
      zh: '服务很好，员工很专业。会推荐给朋友。',
    },
    createdAt: '2024-01-14T15:20:00Z',
    helpful: 8,
  },
];

// Mock 비디오 데이터
export const mockVideos: Video[] = [
  {
    id: '1',
    title: '보톡스 시술 후기',
    description: '강남 뷰티클리닉에서 받은 보톡스 시술 후기를 공유합니다.',
    thumbnail: 'https://picsum.photos/300/400?random=21',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    duration: 120,
    views: 15420,
    likes: 892,
    clinicId: '1',
    tags: ['보톡스', '후기', '강남'],
    createdAt: '2024-01-10T14:00:00Z',
  },
  {
    id: '2',
    title: '필러 시술 과정',
    description: '필러 시술의 전체 과정을 보여드립니다.',
    thumbnail: 'https://picsum.photos/300/400?random=22',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    duration: 180,
    views: 8930,
    likes: 456,
    clinicId: '2',
    tags: ['필러', '시술과정', '압구정'],
    createdAt: '2024-01-08T11:30:00Z',
  },
  {
    id: '3',
    title: '레이저 치료 효과',
    description: '레이저 치료 전후 비교 영상입니다.',
    thumbnail: 'https://picsum.photos/300/400?random=23',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    duration: 90,
    views: 12300,
    likes: 678,
    clinicId: '1',
    tags: ['레이저', '치료', '효과'],
    createdAt: '2024-01-05T16:45:00Z',
  },
];

// 문제 부위 데이터
export const problemAreas: ProblemArea[] = [
  { id: '1', name: '눈', icon: '👁️', description: '눈가 주름, 다크서클' },
  { id: '2', name: '코', icon: '👃', description: '코끝, 콧대, 콧볼' },
  { id: '3', name: '입', icon: '👄', description: '입술, 입꼬리, 입가' },
  { id: '4', name: '볼', icon: '😊', description: '볼살, 볼 처짐' },
  { id: '5', name: '턱선', icon: '🦴', description: '턱선, 목선' },
  { id: '6', name: '이마', icon: '🤔', description: '이마 주름, 볼륨' },
  { id: '7', name: '볼', icon: '😌', description: '볼 처짐, 볼륨' },
  { id: '8', name: '목', icon: '🦒', description: '목 주름, 목선' },
  { id: '9', name: '팔', icon: '💪', description: '팔뚝, 팔꿈치' },
  { id: '10', name: '다리', icon: '🦵', description: '허벅지, 종아리' },
  { id: '11', name: '배', icon: '🤰', description: '복부, 옆구리' },
  { id: '12', name: '등', icon: '🫁', description: '등, 어깨' },
];


