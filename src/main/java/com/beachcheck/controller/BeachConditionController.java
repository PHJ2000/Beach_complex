package com.beachcheck.controller;

import com.beachcheck.dto.BeachConditionDto;
import com.beachcheck.service.BeachConditionService;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/beaches/{beachId}/conditions")
@Validated
public class BeachConditionController {

    private final BeachConditionService beachConditionService;

    public BeachConditionController(BeachConditionService beachConditionService) {
        this.beachConditionService = beachConditionService;
    }

    @GetMapping("/recent")
    public ResponseEntity<List<BeachConditionDto>> findRecent(@PathVariable @NotNull UUID beachId) {
        return ResponseEntity.ok(beachConditionService.findRecentConditions(beachId));
    }

    // TODO: Provide streaming SSE endpoint for real-time condition updates.
}
