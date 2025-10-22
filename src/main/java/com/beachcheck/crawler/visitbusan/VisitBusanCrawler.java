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

            String title = HtmlExtractUtils.firstNonBlank(
                    HtmlExtractUtils.textOrNull(a.selectFirst(".tit, .title, .subject")),
                    HtmlExtractUtils.textOrNull(a.selectFirst("strong, h3, h4")),
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
                    .link(href != null ? href.trim() : "")
                    .location("")  // enrich에서 채움
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

        // ✅ 하단(첨부파일 바로 위) 블록 텍스트 추출
        String bottom = VisitBusanCrawler.bottomInfoText(detail);

    /* ------------------------------
       1) 날짜 (일자 / 행사일자 / 기간)
       ------------------------------ */
        String periodText = VisitBusanCrawler.extractLabelShort(
                bottom, "일자", "행사일자", "기간", "행사기간"
        );
        java.time.LocalDate[] se = HtmlExtractUtils.parseDateRangeOrSingle(periodText);
        if (se != null) {
            item.setStart(se[0].toString());
            item.setEnd(se[1].toString());
        } else {
            item.setStart(null);
            item.setEnd(null);
        }

    /* ------------------------------
       2) 장소(location) - 우선순위 방식
          1️⃣ 하단 블록의 "장소" 값
          2️⃣ 하단 블록의 "주소" 값
          3️⃣ 본문 내 키워드 검색
       ------------------------------ */
        // 1️⃣ 하단 블록에서 "장소" 찾기
        String loc1 = VisitBusanCrawler.extractLabelShort(bottom, "장소", "위치", "행사장소");

        // 2️⃣ 하단 블록에서 "주소" 찾기
        String loc2 = VisitBusanCrawler.extractLabelShort(bottom, "주소");

        // 3️⃣ 본문 전체에서 "장소:" 같은 문장 찾기 (fallback)
        String loc3 = null;
        var m = java.util.regex.Pattern
                .compile("(장소|위치|행사장소)\\s*[:：]\\s*([\\p{IsHangul}A-Za-z0-9\\s·\\-()]+)")
                .matcher(detail.text());
        if (m.find()) {
            loc3 = m.group(2).trim();
        }

        // 우선순위 적용
        String location = HtmlExtractUtils.firstNonBlank(loc1, loc2, loc3);
        item.setLocation(location != null ? HtmlExtractUtils.trim(location, 200) : "");

        // ✅ description은 이미 DTO에서 제거했으므로 설정하지 않음
        return item;
    }


    /** 상세 페이지의 '첨부파일' 직전 블록 텍스트만 모아 반환 (없으면 마지막 dl/table/section 시도) */
    public static String bottomInfoText(Document doc) {
        // 1) '첨부파일' 텍스트를 포함하는 요소 찾기
        Element attach = null;
        for (Element el : doc.select("*, * *")) {
            String t = textOrNull(el);
            if (t != null && t.replaceAll("\\s+", "").contains("첨부파일")) {
                attach = el;
                break;
            }
        }
        // 2) attach 이전의 의미있는 블록 찾기
        Element candidate = null;
        if (attach != null) {
            candidate = attach.parent();
            // 직전 형제를 우선 고려
            Element prev = attach.previousElementSibling();
            if (prev != null) candidate = prev;
        }

        // 3) fallback: 마지막 dl/table/section 유력 후보
        if (candidate == null) {
            Elements dls = doc.select("article dl, .content dl, .cont dl, .bbs_view dl, dl");
            if (!dls.isEmpty()) candidate = dls.last();
        }
        if (candidate == null) {
            Elements tables = doc.select("article table, .content table, .cont table, .bbs_view table, table");
            if (!tables.isEmpty()) candidate = tables.last();
        }
        if (candidate == null) {
            // 전체 본문 영역의 마지막 큰 덩어리
            Elements blocks = doc.select("article, .content, .cont, .bbs_view, .view_con");
            if (!blocks.isEmpty()) candidate = blocks.last();
        }
        if (candidate == null) candidate = doc.body();

        // 4) 이 블록의 텍스트만 반환
        String txt = textOrNull(candidate);
        return txt == null ? "" : txt.replace('\u00A0', ' ').replaceAll("\\s+", " ").trim();
    }

    /**
     * 하단 블록 텍스트에서 "라벨: 값" 형태의 짧은 값만 깔끔히 추출.
     * - 다음 라벨(일자/주소/홈페이지/첨부파일 등)이 나오면 거기서 잘라냄.
     * - 괄호, '일원', '광장' 등의 장소명 단어까지만 유지.
     * - "장소 전포카페거리(메인행사), 전포사잇길, 전포공구길 일원" → "전포카페거리(메인행사), 전포사잇길, 전포공구길 일원"
     */
    public static String extractLabelShort(String text, String... labels) {
        if (text == null) return null;

        // 라벨 경계 키워드
        String boundary = String.join("|", new String[]{
                "일자","행사일자","기간","행사기간","장소","위치","주소",
                "홈페이지","첨부파일","찾아오시는\\s*길","Top","관광","문의","주최","프로그램","일정"
        });

        // 순차적으로 라벨 탐색
        for (String label : labels) {
            // "장소" 또는 "주소" 뒤의 짧은 문장 캡처 (다음 라벨 나오기 전까지)
            String regex = "(?i)" + label + "\\s*[:：]?\\s*([\\p{IsHangul}A-Za-z0-9·\\-(),&/\\s]+?)(?=(\\b(" + boundary + ")\\b|$))";
            var m = java.util.regex.Pattern.compile(regex).matcher(text);
            String hit = null;
            while (m.find()) {
                hit = m.group(1).trim();
            }

            if (hit != null && !hit.isBlank()) {
                // ▪️ 정제: 너무 긴 경우 끊기, 줄바꿈 제거
                hit = hit.replaceAll("\\s+", " ").trim();

                // ▪️ '홈페이지', '첨부파일', '찾아오시는 길' 등이 뒤에 섞였을 경우 제거
                hit = hit.replaceAll("(홈페이지|첨부파일|찾아오시는 길).*", "").trim();

                // ▪️ 콜론(:)이나 'ㅇ', '□' 등 리스트 구분자가 앞에 붙으면 제거
                hit = hit.replaceAll("^[:：ㅇ□•\\-\\s]+", "").trim();

                // ▪️ 문장 뒤에 다른 설명이 붙으면 '일원', '광장', ')' 등으로 끊기
                var cut = java.util.regex.Pattern.compile("^(.*?(일원|광장|공원|거리|극장|스퀘어|센터|전당|타운|랜드|홀|운동장|해변|마을|공터|해수욕장|플라자|야외무대|정원|캠퍼스|로|길|청|장|원))(\\s|,|$)")
                        .matcher(hit);
                if (cut.find()) {
                    hit = cut.group(1).trim();
                }

                return hit;
            }
        }
        return null;
    }


}
