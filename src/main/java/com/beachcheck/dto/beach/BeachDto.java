package com.beachcheck.dto.beach;

import java.time.Instant;
import java.util.UUID;

public record BeachDto(
        UUID id,
        String code,
        String name,
        String status,
        double latitude,
        double longitude,
        Instant updatedAt
) {
}
