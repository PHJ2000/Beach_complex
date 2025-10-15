-- users 테이블 생성
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR UNIQUE NOT NULL,
    password VARCHAR NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    timezone VARCHAR,
    CONSTRAINT chk_role CHECK (role IN ('USER', 'ADMIN'))
    );

CREATE INDEX idx_users_email ON users(email);  -- 로그인 쿼리 최적화
CREATE INDEX idx_users_role ON users(role);    -- 권한별 조회 최적화

