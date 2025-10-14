
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS beaches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(32) NOT NULL,
    location geometry(Point, 4326) NOT NULL,
    boundary geometry(Polygon, 4326),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS beach_facilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    beach_id UUID NOT NULL REFERENCES beaches(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL,
    location geometry(Point, 4326)
);

CREATE TABLE IF NOT EXISTS beach_conditions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    beach_id UUID NOT NULL REFERENCES beaches(id) ON DELETE CASCADE,
    observed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    water_temperature_celsius DOUBLE PRECISION,
    wave_height_meters DOUBLE PRECISION,
    weather_summary VARCHAR(512),
    observation_point geometry(Point, 4326)
);

CREATE INDEX IF NOT EXISTS idx_beaches_location ON beaches USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_beaches_boundary ON beaches USING GIST (boundary);
CREATE INDEX IF NOT EXISTS idx_facilities_location ON beach_facilities USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_conditions_beach_time ON beach_conditions (beach_id, observed_at DESC);
