package com.beachcheck.crawler.visitbusan;

import com.beachcheck.crawler.Crawler;
import com.beachcheck.domain.FestivalItem;
import com.beachcheck.util.HtmlExtractUtils;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.*;
import org.jsoup.nodes.*;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Component;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
public class VisitBusanCrawler implements Crawler {

    private static final String BASE = "https://www.visitbusan.net/schedule/list.do";

    private Connection baseConnect(String url) {
        return Jsoup.connect(url)
                .userAgent("Mozilla/5.0 (compatible; BeachCrawler/1.0)")
                .timeout(10000)
                .header("Accept-Language", "ko,en;q=0.8")
                .ignoreContentType(true);
    }

    private static String enc(String s) {
        return URLEncoder.encode(s, StandardCharsets.UTF_8);
    }

    @Override
    public List<FestivalItem> fetch(int year, int month) {
        try {
            String query = String.format(
                    "boardId=%s&menuCd=%s&contentsSid=%s&year=%d&month=%02d&_=%d",
                    enc("BBS_0000009"),
                    enc("DOM_000000204012000000"),
                    enc("447"),
                    year, month,
                    System.currentTimeMillis()
            );
            String url = BASE + "?" + query;

            Document doc = baseConnect(url).get();
            Elements items = doc.select("ul.board_list li, .bbsList li");
            List<FestivalItem> result = new ArrayList<>();

            for (Element li : items) {
                FestivalItem item = parseListItem(li);
                if (item == null) continue;
                try { item = enrich(item); } catch (Exception e) { log.warn("enrich fail: {}", item.getLink(), e); }
                result.add(item);
                Thread.sleep(150);
            }
            return result;
        } catch (Exception e) {
            log.error("fetch fail", e);
            return List.of();
        }
    }

    private FestivalItem parseListItem(Element li) {
        try {
            Element a = li.selectFirst("a[href]");
            if (a == null) return null;
            String href = a.attr("abs:href");
            String title = HtmlExtractUtils.textOrNull(li.selectFirst(".tit, .title, .subject"));

            Element img = li.selectFirst("img");
            String thumb = img != null ? img.attr("abs:src") : null;

            String summary = HtmlExtractUtils.textOrNull(li.selectFirst(".txt, .desc"));
            return FestivalItem.builder()
                    .title(title)
                    .thumbnail(thumb)
                    .description(summary)
                    .link(href)
                    .build();
        } catch (Exception e) {
            log.debug("parseListItem skip", e);
            return null;
        }
    }

    @Override
    public FestivalItem enrich(FestivalItem item) throws Exception {
        Document detail = baseConnect(item.getLink()).get();

        String period = HtmlExtractUtils.labelFollowingText(detail, "기간");
        if (period == null) period = HtmlExtractUtils.findDateRange(detail.text());
        if (period != null) {
            String[] se = period.split("~|–|-");
            if (se.length >= 1) item.setStart(HtmlExtractUtils.normalizeDate(se[0]));
            if (se.length >= 2) item.setEnd(HtmlExtractUtils.normalizeDate(se[1]));
        }

        String location = HtmlExtractUtils.firstNonBlank(
                HtmlExtractUtils.labelFollowingText(detail, "장소"),
                HtmlExtractUtils.labelFollowingText(detail, "위치"),
                HtmlExtractUtils.extractLocationFallback(detail)
        );
        item.setLocation(location);

        String desc = HtmlExtractUtils.firstNonBlank(
                HtmlExtractUtils.textOrNull(detail.selectFirst(".bbs_view, .content, article"))
        );
        if (desc != null && desc.length() > 20)
            item.setDescription(HtmlExtractUtils.trim(desc, 400));

        return item;
    }
}
