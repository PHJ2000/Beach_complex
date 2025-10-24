-- beaches.tag / beaches.is_favorite 보강 (idempotent)

-- 1) tag 컬럼이 없으면 추가
ALTER TABLE public.beaches
  ADD COLUMN IF NOT EXISTS tag TEXT;

-- 1-b) tag가 bytea로 잡혀 있던 케이스를 TEXT로 교정 (UTF-8 가정)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'beaches'
      AND column_name  = 'tag'
      AND data_type    = 'bytea'
  ) THEN
    ALTER TABLE public.beaches
      ALTER COLUMN tag TYPE TEXT
      USING convert_from(tag, 'UTF8');
  END IF;
END $$;

-- 2) is_favorite 컬럼이 없으면 우선 추가(제약은 아래에서 통일 적용)
ALTER TABLE public.beaches
  ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN;

-- 2-b) null을 false로 채우고, 기본값/NOT NULL 제약을 강제
UPDATE public.beaches
   SET is_favorite = COALESCE(is_favorite, false);

ALTER TABLE public.beaches
  ALTER COLUMN is_favorite SET DEFAULT false,
  ALTER COLUMN is_favorite SET NOT NULL;
