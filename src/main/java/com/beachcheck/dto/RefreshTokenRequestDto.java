package com.beachcheck.dto;

import jakarta.validation.constraints.NotBlank;

public record RefreshTokenRequestDto(
    @NotBlank(message = "Refresh token is required")
    String refreshToken
) {}
