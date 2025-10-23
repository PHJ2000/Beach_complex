package com.beachcheck.crawler;

import com.beachcheck.domain.FestivalItem;
import java.util.List;

public interface Crawler {
    List<FestivalItem> fetch(int year, int month);
    FestivalItem enrich(FestivalItem item) throws Exception;
}
