package com.beachcheck.crawler.visitbusan;

import com.beachcheck.crawler.Crawler;
import com.beachcheck.domain.FestivalItem;
import com.beachcheck.util.HtmlExtractUtils;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Connection;
import org.jsoup.Jsoup;
import org.jsoup.nodes.*;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Component;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import static com.beachcheck.util.HtmlExtractUtils.*;

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

            // 상세로 가는 링크를 기준으로 수집 (마크업 변경에 강함)
            Elements links = doc.select("a[href*='/schedule/view.do'][href*='dataSid=']");
            List<FestivalItem> results = new ArrayList<>();

            for (Element a : links) {
                FestivalItem item = parseListAnchor(a);
                if (item == null) continue;

                try { item = enrich(item); }
                catch (Exception e) { log.warn("enrich fail: {}", item.getLink(), e); }

                results.add(item);
                Thread.sleep(150);
            }
            return results;
        } catch (Exception e) {
            log.error("fetch fail", e);
            return List.of();
        }
    }

    private FestivalItem parseListAnchor(Element a) {
        try {
            String href = a.attr("abs:href");

            String title = firstNonBlank(
                    textOrNull(a.selectFirst(".tit, .title, .subject")),
                    textOrNull(a.selectFirst("strong, h3, h4")),
                    a.ownText()
            );
            if (title == null || title.isBlank()) {
                String raw = a.text();
                raw = raw.replaceAll("\\d{4}[./-]\\d{1,2}[./-]\\d{1,2}.*$", "").trim();
                title = raw;
            }

            Element img = a.selectFirst("img");
            String thumb = null;
            if (img != null) {
                thumb = img.hasAttr("data-src") ? img.attr("abs:data-src") : img.attr("abs:src");
            }

            return FestivalItem.builder()
                    .title(title != null ? title.trim() : "")
                    .thumbnail(thumb != null ? thumb.trim() : "")
                    .description("") // 상세에서 채움
                    .link(href != null ? href.trim() : "")
                    .build();

        } catch (Exception e) {
            log.debug("parseListAnchor skip", e);
            return null;
        }
    }

    @Override
    public FestivalItem enrich(FestivalItem item) throws Exception {
        if (item.getLink() == null || item.getLink().isBlank()) return item;

        Document detail = baseConnect(item.getLink()).get();

        /* ---- 1) 기간(start,end) ---- */
        String periodRaw = firstNonBlank(
                HtmlExtractUtils.labelFollowingText(detail, "기간"),
                HtmlExtractUtils.labelFollowingText(detail, "행사기간"),
                selectFirstText(detail, ".period, .date, .event-date")
        );

        LocalDate[] se = HtmlExtractUtils.findDateRange(
                firstNonBlank(periodRaw, detail.text())
        );
        if (se != null) {
            item.setStart(se[0].toString());
            item.setEnd(se[1].toString());
        } else if (periodRaw != null) {
            String one = HtmlExtractUtils.normalizeDateAny(periodRaw);
            LocalDate s = HtmlExtractUtils.toLocal(one);
            if (s != null) { item.setStart(s.toString()); item.setEnd(s.toString()); }
        }

        // 역전/누락 보정
        if (item.getStart() != null && item.getEnd() == null) item.setEnd(item.getStart());
        if (item.getEnd() != null && item.getStart() == null) item.setStart(item.getEnd());
        if (item.getStart() != null && item.getEnd() != null) {
            LocalDate s = HtmlExtractUtils.toLocal(item.getStart());
            LocalDate e = HtmlExtractUtils.toLocal(item.getEnd());
            if (s != null && e != null && e.isBefore(s)) {
                item.setStart(e.toString());
                item.setEnd(s.toString());
            }
        }

        /* ---- 2) 장소(location) ---- */
        String loc = HtmlExtractUtils.extractLocationFallback(detail);
        if (loc != null) item.setLocation(trim(loc, 120));
        else if (item.getLocation() == null) item.setLocation("");

        /* ---- 3) 설명(description) ---- */
        String desc = HtmlExtractUtils.extractDescription(detail);
        if (desc != null && desc.length() >= 10) {
            item.setDescription(desc);
        } else if (item.getDescription() == null || item.getDescription().isBlank()) {
            // 제목과 중복되지 않는 본문 일부라도
            String fallback = selectFirstText(detail, "article, .content, .cont, .bbs_view, .view_con");
            if (fallback != null) {
                fallback = fallback.replace(item.getTitle(), "").trim();
                item.setDescription(trim(fallback, 400));
            } else {
                item.setDescription("");
            }
        }

        return item;
    }
}
