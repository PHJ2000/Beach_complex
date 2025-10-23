package com.beachcheck.controller;

import com.beachcheck.domain.FestivalItem;
import com.beachcheck.service.FestivalService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/festivals")
@RequiredArgsConstructor
public class FestivalController {

    private final FestivalService service;

    @GetMapping
    public List<FestivalItem> list(@RequestParam(required = false) Integer year,
                                   @RequestParam(required = false) Integer month) {
        LocalDate now = LocalDate.now();
        int y = year == null ? now.getYear() : year;
        int m = month == null ? now.getMonthValue() : month;
        return service.fetch(y, m);
    }
}
