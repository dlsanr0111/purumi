-- Purumi 인증 및 예약 시스템 DB 스키마
-- Supabase SQL Editor에서 실행하세요

-- 1. profiles 테이블 (사용자 프로필)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  age SMALLINT NULL CHECK (age >= 0 AND age <= 150),
  gender TEXT NULL CHECK (gender IN ('male', 'female', 'other')),
  user_type TEXT NULL CHECK (user_type IN ('hospital', 'personal')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. services 테이블 (예약 가능한 서비스 카탈로그)
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NULL,
  duration_min INTEGER NOT NULL DEFAULT 30 CHECK (duration_min > 0),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. reservations 테이블 (예약 엔티티)
CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  scheduled_for TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  note TEXT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_service_id ON reservations(service_id);
CREATE INDEX IF NOT EXISTS idx_reservations_scheduled_for ON reservations(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);

-- 5. updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. updated_at 트리거 생성
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON reservations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. RLS 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- 8. RLS 정책 생성

-- profiles 정책: 로그인한 유저는 자신의 프로필만 읽기/쓰기
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- services 정책: 모든 인증된 사용자가 읽기 가능, 쓰기는 관리자만 (현재는 읽기 전용)
CREATE POLICY "Authenticated users can view services" ON services
  FOR SELECT USING (auth.role() = 'authenticated');

-- reservations 정책: 유저는 자신의 예약만 읽기/쓰기
CREATE POLICY "Users can view own reservations" ON reservations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reservations" ON reservations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reservations" ON reservations
  FOR UPDATE USING (auth.uid() = user_id);

-- 9. 샘플 서비스 데이터 삽입
INSERT INTO services (name, description, duration_min) VALUES
  ('보톡스 시술', '얼굴 주름 개선을 위한 보톡스 시술', 30),
  ('필러 시술', '볼륨 보충을 위한 필러 시술', 45),
  ('레이저 치료', '피부 재생을 위한 레이저 치료', 60),
  ('여드름 치료', '여드름 및 흉터 치료', 40),
  ('안티에이징', '노화 방지 및 피부 개선', 50)
ON CONFLICT DO NOTHING;

-- 10. 프로필 자동 생성 함수 (회원가입 시 자동으로 프로필 생성)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. 회원가입 시 프로필 자동 생성 트리거
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 완료 메시지
SELECT 'Purumi 인증 및 예약 시스템 DB 스키마가 성공적으로 생성되었습니다!' as message;
