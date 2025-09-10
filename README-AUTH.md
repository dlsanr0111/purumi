# Purumi 인증 및 예약 시스템

Purumi의 이메일 로그인/회원가입 + 게스트 모드 + 예약 시 강제 로그인 시스템입니다.

## 🚀 설치 및 설정

### 1. 의존성 설치

```bash
# Expo SDK 패키지
npx expo install @react-native-async-storage/async-storage react-native-safe-area-context react-native-screens

# 추가 패키지
npm install uuid @types/uuid
```

### 2. 환경변수 설정

`app.config.ts`에 Supabase 설정이 이미 포함되어 있습니다:

```typescript
extra: {
  supabaseUrl: 'https://iaeadujcimzpkzfwsqwr.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
}
```

### 3. Supabase 데이터베이스 설정

1. **Supabase 대시보드** 접속: https://supabase.com/dashboard
2. **프로젝트 선택**
3. **SQL Editor**로 이동
4. **`supabase-auth-schema.sql`** 파일의 내용을 복사하여 실행

```sql
-- 전체 SQL 스크립트 실행
-- profiles, services, reservations 테이블 생성
-- RLS 정책 설정
-- 샘플 데이터 삽입
```

### 4. 앱 실행

```bash
npx expo start
```

## 📱 앱 구조

```
app/
├── _layout.tsx              # AuthProvider 래핑
├── index.tsx                # 스플래시/게이트 화면
├── home.tsx                 # 로그인 후 홈 화면
├── shorts.tsx               # 기존 쇼츠 페이지 (수정 금지)
├── reservation/
│   └── index.tsx           # 예약 화면 (로그인 필요)
└── (auth)/
    ├── sign-in.tsx          # 로그인 화면
    └── sign-up.tsx          # 회원가입 화면

components/
├── AuthForm.tsx             # 인증 폼 컴포넌트
└── RequireAuth.tsx          # 보호 라우트 컴포넌트

providers/
└── AuthProvider.tsx         # 인증 상태 관리

lib/
├── supabase.ts              # Supabase 클라이언트 및 서비스
└── storage.ts               # 로컬 저장소 헬퍼 (게스트 모드)
```

## 🔐 인증 플로우

### 1. 로그인 플로우
- **이메일/비밀번호** 로그인
- **게스트 모드** 지원 (로컬 세션)
- **자동 세션 유지** (persistSession=true)

### 2. 회원가입 플로우
- **이메일/비밀번호** 회원가입
- **선택 필드**: 나이, 성별, 사용자 타입
- **프로필 자동 생성** (트리거)

### 3. 게스트 모드
- **로컬 세션** (AsyncStorage)
- **게스트 ID** 자동 생성 (UUID)
- **예약 초안 저장** (로컬)
- **로그인 후 마이그레이션**

## 🛡️ 보호 라우트

### 라우팅 가드 규칙
- **`/reservation`**: 로그인 필요
- **`/home`**: 로그인 또는 게스트 모드 필요
- **`/sign-in`, `/sign-up`**: 로그인 상태에서 접근 시 `/home`으로 리다이렉트

### RequireAuth 컴포넌트
```typescript
<RequireAuth>
  <YourProtectedComponent />
</RequireAuth>
```

## 📅 예약 시스템

### 예약 플로우
1. **서비스 선택** (보톡스, 필러, 레이저 등)
2. **날짜/시간 선택**
3. **메모 입력** (선택사항)
4. **제출**:
   - **로그인 사용자**: 즉시 예약 생성
   - **게스트**: 초안 저장 → 로그인 유도

### 게스트 예약 마이그레이션
1. 게스트가 예약 폼 작성
2. 제출 시 로그인 모달 표시
3. 로그인/회원가입 완료
4. 로컬 초안을 서버로 마이그레이션
5. 초안 삭제 및 예약 완료

## 🗄️ 데이터베이스 스키마

### 테이블 구조

#### `profiles` (사용자 프로필)
```sql
- id: UUID (PK, auth.users.id 참조)
- email: TEXT
- age: SMALLINT (선택사항)
- gender: TEXT (male/female/other)
- user_type: TEXT (hospital/personal)
- created_at, updated_at: TIMESTAMPTZ
```

#### `services` (예약 가능한 서비스)
```sql
- id: UUID (PK)
- name: TEXT
- description: TEXT
- duration_min: INTEGER
- active: BOOLEAN
- created_at, updated_at: TIMESTAMPTZ
```

#### `reservations` (예약 엔티티)
```sql
- id: UUID (PK)
- user_id: UUID (auth.users.id 참조)
- service_id: UUID (services.id 참조)
- scheduled_for: TIMESTAMPTZ
- status: TEXT (pending/confirmed/cancelled)
- note: TEXT (선택사항)
- created_at, updated_at: TIMESTAMPTZ
```

### RLS 정책
- **profiles**: 본인 프로필만 읽기/쓰기
- **services**: 인증된 사용자 읽기 가능
- **reservations**: 본인 예약만 읽기/쓰기

## 🧪 테스트 시나리오

### 1. 기본 인증 플로우
```bash
# 앱 실행
npx expo start

# 테스트 순서:
1. 첫 실행 → /sign-in 화면 표시
2. "게스트로 계속하기" → /home 진입
3. 회원가입 → 이메일 인증 안내
4. 로그인 → /home 진입
5. 앱 재시작 → 세션 유지되어 /home 직행
6. 로그아웃 → /sign-in
```

### 2. 게스트 모드 테스트
```bash
# 게스트 모드 테스트:
1. "게스트로 계속하기" 클릭
2. 홈 화면에서 "게스트 모드" 표시 확인
3. 예약 화면 접근 → 로그인 요구
4. 예약 폼 작성 → "초안 저장" 버튼 표시
5. 로그인 후 → 자동으로 예약 생성
```

### 3. 예약 플로우 테스트
```bash
# 예약 테스트:
1. 로그인 상태에서 /reservation 접근
2. 서비스 선택 (보톡스, 필러 등)
3. 날짜/시간 선택 (실제로는 DatePicker 사용)
4. 메모 입력
5. "예약하기" 클릭
6. 예약 완료 메시지 확인
7. 홈으로 리다이렉트
```

### 4. 보호 라우트 테스트
```bash
# 라우팅 가드 테스트:
1. 비로그인 상태에서 /reservation 접근
   → /sign-in?redirect=/reservation 리다이렉트
2. 로그인 상태에서 /sign-in 접근
   → /home 리다이렉트
3. 게스트 상태에서 /reservation 접근
   → /sign-in?redirect=/reservation 리다이렉트
```

### 5. 에러 처리 테스트
```bash
# 에러 시나리오:
1. 잘못된 이메일/비밀번호로 로그인
   → "이메일 또는 비밀번호가 올바르지 않습니다"
2. 이미 등록된 이메일로 회원가입
   → "이미 등록된 이메일입니다"
3. 8자 미만 비밀번호로 회원가입
   → "비밀번호는 8자 이상이어야 합니다"
4. 비밀번호 확인 불일치
   → "비밀번호가 일치하지 않습니다"
```

## 🔧 주요 기능

### 인증 기능
- ✅ 이메일/비밀번호 로그인
- ✅ 이메일/비밀번호 회원가입
- ✅ 자동 세션 유지
- ✅ 로그아웃
- ✅ 게스트 모드

### 예약 기능
- ✅ 서비스 카탈로그 조회
- ✅ 예약 생성
- ✅ 예약 목록 조회
- ✅ 예약 상태 업데이트
- ✅ 게스트 예약 초안 저장/마이그레이션

### 보안 기능
- ✅ RLS (Row Level Security) 정책
- ✅ 입력 검증
- ✅ 에러 처리
- ✅ 세션 관리

### UX 기능
- ✅ 로딩 상태 표시
- ✅ 에러 메시지
- ✅ 자동 리다이렉트
- ✅ 폼 검증
- ✅ 비밀번호 표시/가리기

## 🚨 주의사항

### 개발 시 주의사항
1. **민감정보 콘솔 출력 금지**
2. **에러 메시지 사용자 친화적으로 표시**
3. **로딩 상태 항상 표시**
4. **입력 검증 철저히 수행**

### 배포 시 주의사항
1. **환경변수 보안 관리**
2. **RLS 정책 테스트**
3. **세션 만료 처리**
4. **에러 모니터링 설정**

## 📞 문제 해결

### 일반적인 문제들

#### 1. Supabase 연결 실패
```bash
# 확인사항:
- app.config.ts의 supabaseUrl, supabaseAnonKey 확인
- Supabase 프로젝트 상태 확인
- 네트워크 연결 확인
```

#### 2. RLS 정책 오류
```bash
# 확인사항:
- SQL 스크립트 실행 완료 여부
- 정책 활성화 상태 확인
- 사용자 권한 확인
```

#### 3. 세션 유지 실패
```bash
# 확인사항:
- AsyncStorage 권한 확인
- persistSession 설정 확인
- 앱 재시작 테스트
```

#### 4. 게스트 모드 오류
```bash
# 확인사항:
- AsyncStorage 설치 확인
- UUID 패키지 설치 확인
- 로컬 저장소 권한 확인
```

## 🎯 다음 단계

### 추가 구현 가능한 기능
1. **소셜 로그인** (Google, Apple)
2. **비밀번호 재설정**
3. **이메일 인증**
4. **푸시 알림**
5. **예약 알림**
6. **결제 시스템**
7. **리뷰 시스템**
8. **관리자 대시보드**

### 성능 최적화
1. **이미지 최적화**
2. **코드 스플리팅**
3. **캐싱 전략**
4. **데이터베이스 인덱스 최적화**

---

**구현 완료!** 🎉

이제 Purumi의 인증 및 예약 시스템이 완전히 구현되었습니다. 위의 테스트 시나리오를 따라가며 모든 기능이 정상 작동하는지 확인해보세요.
