package com.beachcheck.dto;

import java.util.UUID;

public record BeachFacilityDto(
        UUID id,
        UUID beachId,
        String name,
        String category,
        Double latitude,
        Double longitude
) {
}
