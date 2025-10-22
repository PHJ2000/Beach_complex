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
                .header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
                .header("Accept-Language", "ko,en;q=0.8")
                .referrer("https://www.visitbusan.net/")
                .followRedirects(true)
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

            // ✅ 변경 부분: 상세 링크(a[href*='view.do']) 기준으로 선택
            Elements links = doc.select("a[href*='/schedule/view.do'][href*='dataSid=']");

            List<FestivalItem> results = new ArrayList<>();
            for (Element a : links) {
                FestivalItem item = parseListAnchor(a);
                if (item == null) continue;

                try {
                    item = enrich(item);
                } catch (Exception e) {
                    log.warn("enrich fail: {}", item.getLink(), e);
                }

                results.add(item);
                Thread.sleep(150);
            }
            return results;

        } catch (Exception e) {
            log.error("fetch fail", e);
            return List.of();
        }
    }


    // ✅ 새 메서드 추가
    private FestivalItem parseListAnchor(Element a) {
        try {
            String href = a.attr("abs:href");

            // 제목 추출
            String title = HtmlExtractUtils.firstNonBlank(
                    HtmlExtractUtils.textOrNull(a.selectFirst(".tit, .title, .subject")),
                    HtmlExtractUtils.textOrNull(a.selectFirst("strong, h3, h4"))
            );
            if (title == null || title.isBlank()) {
                String raw = a.text();
                raw = raw.replaceAll("\\d{4}[./-]\\d{1,2}[./-]\\d{1,2}.*$", "").trim();
                title = raw;
            }

            // 썸네일
            Element img = a.selectFirst("img");
            String thumb = null;
            if (img != null) {
                thumb = img.hasAttr("data-src") ? img.attr("abs:data-src") : img.attr("abs:src");
            }

            return FestivalItem.builder()
                    .title(title != null ? title : "")
                    .thumbnail(thumb != null ? thumb : "")
                    .description("")
                    .link(href)
                    .build();

        } catch (Exception e) {
            log.debug("parseListAnchor skip", e);
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
