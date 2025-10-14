package com.beachcheck.controller;

import com.beachcheck.dto.BeachDto;
import com.beachcheck.service.BeachService;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
    public ResponseEntity<List<BeachDto>> findAll() {
        return ResponseEntity.ok(beachService.findAll());
    }

    @GetMapping("/{code}")
    public ResponseEntity<BeachDto> findByCode(@PathVariable @NotBlank String code) {
        return ResponseEntity.ok(beachService.findByCode(code));
    }

    // TODO: Add POST endpoint once upstream event ingestion is designed.
}
