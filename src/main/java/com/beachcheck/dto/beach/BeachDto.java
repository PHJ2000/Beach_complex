package com.beachcheck.dto.beach;

import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class BeachDto {
    private Long id;
    private String name;
    private String district;
    private double lat;
    private double lon;
    private String status;
    private boolean favorite;
}
