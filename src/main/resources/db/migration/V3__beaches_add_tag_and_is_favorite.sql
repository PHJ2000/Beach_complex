-- beaches 테이블에 태그/찜 컬럼이 없으면 추가
ALTER TABLE public.beaches
  ADD COLUMN IF NOT EXISTS tag text;

ALTER TABLE public.beaches
  ADD COLUMN IF NOT EXISTS is_favorite boolean NOT NULL DEFAULT false;
