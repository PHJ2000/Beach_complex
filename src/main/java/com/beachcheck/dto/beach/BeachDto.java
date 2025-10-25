package com.beachcheck.dto.beach;

import com.beachcheck.domain.Beach;
import org.locationtech.jts.geom.Point;

import java.time.Instant;
import java.util.UUID;

public record BeachDto(
        UUID id,
        String code,
        String name,
        String status,
        double latitude,
        double longitude,
        Instant updatedAt,
        String tag,
        Boolean isFavorite
) {
    // 엔티티 -> DTO 변환용 정적 메서드
    public static BeachDto from(Beach b) {
        double lat = 0.0;
        double lon = 0.0;

        if (b.getLocation() != null) {
            // WGS84(Point): X=경도(lon), Y=위도(lat)
            Point p = (Point) b.getLocation();
            lon = p.getX();
            lat = p.getY();
        }

        String statusStr = (b.getStatus() != null) ? b.getStatus().toString() : null;

        return new BeachDto(
                b.getId(),
                b.getCode(),
                b.getName(),
                statusStr,
                lat,
                lon,
                b.getUpdatedAt(),
                b.getTag(),
                Boolean.valueOf(b.isFavorite())
        );
    }
}
