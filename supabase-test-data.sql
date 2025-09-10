-- Supabase 테스트 데이터 삽입 스크립트

-- 1. video_stats 테이블에 테스트 데이터 삽입
INSERT INTO video_stats (id, title, video_url, likes, views, created_at, updated_at)
VALUES 
  ('1', '보톡스 시술 후기', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 0, 0, NOW(), NOW()),
  ('2', '필러 시술 과정', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 0, 0, NOW(), NOW()),
  ('3', '레이저 치료 효과', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 0, 0, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  likes = EXCLUDED.likes,
  views = EXCLUDED.views,
  updated_at = NOW();

-- 2. 기존 user_likes 데이터 정리 (테스트용)
DELETE FROM user_likes WHERE user_id = 'test-user-id';

-- 3. 테스트 완료 후 확인 쿼리
SELECT * FROM video_stats ORDER BY id;
