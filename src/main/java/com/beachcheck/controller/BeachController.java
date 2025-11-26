package com.beachcheck.controller;

import com.beachcheck.dto.beach.BeachDto;
import com.beachcheck.dto.beach.request.BeachSearchRequestDto;
import com.beachcheck.service.BeachService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@RestController
@RequestMapping("/api/beaches")
@Validated
public class BeachController {

    private final BeachService beachService;

    public BeachController(BeachService beachService) {
        this.beachService = beachService;
    }

    /**
     * 해변 검색
     *
     * @return 해변 목록
     */
    @GetMapping
    public ResponseEntity<List<BeachDto>> findAll(@Valid BeachSearchRequestDto request) {
        // DTO 레벨 검증
        request.validateRadiusParams();

        // 반경 검색 요청인 경우
        if (request.hasCompleteRadiusParams()) {
            return ResponseEntity.ok(
                    beachService.findNearby(request.lon(), request.lat(), request.radiusKm())
            );
        }

        // 기존 검색 또는 필터링
        if (request.q() != null || request.tag() != null) {
            return ResponseEntity.ok(beachService.search(request.q(), request.tag()));
        }

        // 기본: 전체 목록 (캐시됨)
        return ResponseEntity.ok(beachService.findAll());
    }

    @GetMapping("/{code}")
    public ResponseEntity<BeachDto> findByCode(@PathVariable @NotBlank String code) {
        return ResponseEntity.ok(beachService.findByCode(code));
    }

    // TODO: Add POST endpoint once upstream event ingestion is designed.
}
