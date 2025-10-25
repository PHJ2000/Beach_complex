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

    @GetMapping
    public ResponseEntity<List<BeachDto>> findAll(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String tag
    ) {
        boolean hasQ = (q != null && !q.isBlank());
        boolean hasTag = (tag != null && !tag.isBlank());

        if (!hasQ && !hasTag) {
            // ✅ 캐시 타는 기본 목록
            return ResponseEntity.ok(beachService.findAll());
        }
        // ✅ 검색/필터
        return ResponseEntity.ok(beachService.search(q, tag));
    }

    @GetMapping("/{code}")
    public ResponseEntity<BeachDto> findByCode(@PathVariable @NotBlank String code) {
        return ResponseEntity.ok(beachService.findByCode(code));
    }

    // TODO: Add POST endpoint once upstream event ingestion is designed.
}
