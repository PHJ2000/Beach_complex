package com.beachcheck.controller;

import com.beachcheck.dto.beach.BeachDto;
import com.beachcheck.service.BeachService;
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
     * @param q 검색어 (이름/코드)
     * @param tag 태그 필터
     * @param lat 사용자 위도 (선택)
     * @param lon 사용자 경도 (선택)
     * @param radiusKm 반경 km (lat/lon과 함께 사용)
     * @return 해변 목록
     */
    @GetMapping
    public ResponseEntity<List<BeachDto>> findAll(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lon,
            @RequestParam(required = false) Double radiusKm
    ) {
        // 반경 검색 요청인 경우
        if (lat != null && lon != null && radiusKm != null) {
            return ResponseEntity.ok(beachService.findNearby(lon, lat, radiusKm));
        }

        // 기존 검색 또는 필터링
        if (q != null || tag != null) {
            return ResponseEntity.ok(beachService.search(q, tag));
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
