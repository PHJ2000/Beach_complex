package com.beachcheck.crawler.visitbusan;

import com.beachcheck.crawler.Crawler;
import com.beachcheck.domain.FestivalItem;
import com.beachcheck.util.HtmlExtractUtils;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Connection;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
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

    /* ------------------------------ */
    /* Http                           */
    /* ------------------------------ */
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

    /* ------------------------------ */
    /* Fetch list                     */
    /* ------------------------------ */
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

            // 상세 보기로 가는 링크를 기준으로 수집 (마크업 변경에 강함)
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
                try { Thread.sleep(150); } catch (InterruptedException ignored) {}
            }
            return results;
        } catch (Exception e) {
            log.error("fetch fail", e);
            return List.of();
        }
    }

    /* ------------------------------ */
    /* Parse list anchor              */
    /* ------------------------------ */
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
                // "제목 2025.10.01 ~ 2025.10.07 ..." 꼬리 제거
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
                    .location("")   // enrich에서 채움
                    .start(null)
                    .end(null)
                    .build();

        } catch (Exception e) {
            log.debug("parseListAnchor skip", e);
            return null;
        }
    }

    /* ------------------------------ */
    /* Enrich from detail             */
    /* ------------------------------ */
    @Override
    public FestivalItem enrich(FestivalItem item) throws Exception {
        if (item.getLink() == null || item.getLink().isBlank()) return item;

        Document detail = baseConnect(item.getLink()).get();

        // ⬇️ '첨부파일' 직전(또는 가장 말단) 블록 텍스트
        String bottom = HtmlExtractUtils.bottomInfoText(detail);

        /* ========== 1) 날짜(start/end): 하단 블록에서만 추출 ========== */
        LocalDate[] se = HtmlExtractUtils.extractPeriodFromBottom(bottom);
        if (se != null) {
            item.setStart(se[0].toString());
            item.setEnd(se[1].toString());
        } else {
            // 구조형 라벨(dt/dd, th/td)로 한 번 더 시도
            String periodStruct = HtmlExtractUtils.getByStructure(detail, "일자", "행사일자", "기간", "행사기간");
            LocalDate[] se2 = HtmlExtractUtils.parseDateRangeOrSingle(periodStruct);
            if (se2 != null) {
                item.setStart(se2[0].toString());
                item.setEnd(se2[1].toString());
            } else {
                item.setStart(null);
                item.setEnd(null);
            }
        }

        /* === 2) 위치 === */
// 1️⃣ 하단 블록의 "장소/위치/행사장소"
        String loc1 = HtmlExtractUtils.extractLabelShort(bottom, "장소", "위치", "행사장소");
        if (loc1 == null) loc1 = HtmlExtractUtils.getByStructure(detail, "장소","위치","행사장소");

// 2️⃣ 하단 블록의 "주소"
        String loc2 = HtmlExtractUtils.extractLabelShort(bottom, "주소");
        if (loc2 == null) loc2 = HtmlExtractUtils.getByStructure(detail, "주소");

// 3️⃣ 본문 전체에서 "장소: ..." 패턴
        String loc3 = null;
        var m = java.util.regex.Pattern
                .compile("(장소|위치|행사장소)\\s*[:：]\\s*([\\p{IsHangul}A-Za-z0-9·\\-()&,/\\s]+)")
                .matcher(detail.text());
        if (m.find()) loc3 = m.group(2).trim();

// 4️⃣ '찾아오시는 길' 섹션 기반 (하단 블록/문서 전체 텍스트 모두 시도)
        String loc4 = HtmlExtractUtils.extractFromFindTheWay(bottom);
        if (loc4 == null) loc4 = HtmlExtractUtils.extractFromFindTheWay(detail.text());

// ✅ 각 후보 정리
        loc1 = HtmlExtractUtils.normalizeLocation(loc1);
        loc2 = HtmlExtractUtils.normalizeLocation(loc2);
        loc3 = HtmlExtractUtils.normalizeLocation(loc3);
        loc4 = HtmlExtractUtils.normalizeLocation(loc4);

// 우선순위 적용
        String location = HtmlExtractUtils.firstNonBlank(loc1, loc2, loc3, loc4);
        item.setLocation(location == null ? "" : location);



        // 후처리: 잡음 컷 + 장소 끝말 기준 자르기
        if (location != null) {
            // 뒤쪽 다른 섹션/불릿/라벨 컷
            location = location
                    .replaceAll("(홈페이지|첨부파일|찾아오시는 길|일자|기간|주최|문의|프로그램|티켓|관람|러닝타임).*", "")
                    .replaceAll("\\s[-–]\\s.*$", "")
                    .replaceAll("\\s[ㅇ□•]\\s.*$", "")
                    .trim();

            // 장소 단어에서 컷
            var cut = java.util.regex.Pattern.compile(
                    "^(.*?(일원|광장|공원|거리|극장|스퀘어|센터|전당|타운|랜드|홀|운동장|해변|마을|공터|해수욕장|플라자|야외무대|정원|캠퍼스|로|길|청|장|원|베이|항|포구|사거리|사잇길|공구길|카페거리|문화회관|야외극장|상상의\\s*숲))(?:\\s|,|$)"
            ).matcher(location);
            if (cut.find()) location = cut.group(1).trim();

            // 값이 연도로 시작하면(오검출 방지) 무효화
            if (location.matches("^\\d{4}[.\\-].*")) location = "";
        } else {
            location = "";
        }
        item.setLocation(location);

        return item;
    }
}
