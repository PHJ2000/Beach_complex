package com.beachcheck.service;

import com.beachcheck.crawler.visitbusan.VisitBusanCrawler;
import com.beachcheck.domain.FestivalItem;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FestivalService {

    private final VisitBusanCrawler visitBusanCrawler;

    public List<FestivalItem> fetch(int year, int month) {
        return visitBusanCrawler.fetch(year, month);
    }
}
