package com.beachcheck.controller;

import com.beachcheck.domain.BeachTag;
import com.beachcheck.dto.beach.BeachDto;
import com.beachcheck.service.BeachService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping(value = "/api/beaches", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
@CrossOrigin
public class BeachController {
    private final BeachService service;

    @GetMapping
    public List<BeachDto> list(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) BeachTag.TagType tag,
            @RequestParam(required = false, defaultValue = "false") boolean favoritesOnly,
            @RequestParam(required = false, defaultValue = "1") Long userId
    ) {
        return service.list(q, tag, favoritesOnly, userId);
    }

    @PostMapping("/{id}/favorite")
    public Map<String, Object> toggleFavorite(
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "1") Long userId
    ) {
        boolean favorite = service.toggleFavorite(id, userId);
        return Map.of("beachId", id, "favorite", favorite);
    }
}
