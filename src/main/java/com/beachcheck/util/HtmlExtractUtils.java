package com.beachcheck.util;

import org.jsoup.nodes.*;
import org.jsoup.select.Elements;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.regex.Pattern;

public class HtmlExtractUtils {

    /* ================= 기본 헬퍼 ================= */

    public static String textOrNull(Element el) {
        return el == null ? null : el.text().trim();
    }

    public static String attrOrNull(Element el, String attr) {
        return el == null ? null : el.attr(attr);
    }

    public static String firstNonBlank(String... arr) {
        for (String s : arr) {
            if (s != null && !s.isBlank()) return s.trim();
        }
        return null;
    }

    public static String trim(String s, int max) {
        if (s == null) return null;
        s = s.replace('\u00A0', ' ').trim().replaceAll("\\s+", " ");
        return s.length() <= max ? s : s.substring(0, max) + "...";
    }

    public static String selectFirstText(Document doc, String css) {
        Element el = doc.selectFirst(css);
        return el == null ? null : el.text().trim();
    }

    /* ================= 날짜 관련 ================= */

    private static final Pattern RANGE_PATTERN = Pattern.compile(
            "(\\d{4}[./-]\\d{1,2}[./-]\\d{1,2}).{0,8}(~|–|-|~ ).{0,8}(\\d{4}[./-]\\d{1,2}[./-]\\d{1,2})"
    );
    private static final Pattern KOR_DATE = Pattern.compile(
            "(\\d{4})\\s*년\\s*(\\d{1,2})\\s*월\\s*(\\d{1,2})\\s*일"
    );
    private static final Pattern SINGLE_ANY = Pattern.compile(
            "(\\d{4}[./-]\\d{1,2}[./-]\\d{1,2})"
    );

    public static String normalizeDateAny(String raw) {
        if (raw == null) return null;
        String t = raw.replace('\u00A0', ' ')
                .replaceAll("\\(.*?\\)", "")
                .replaceAll("[년./-]\\s*", "-")
                .replaceAll("일", "")
                .replaceAll("\\s+", " ")
                .trim();
        String[] p = t.split("-");
        if (p.length >= 3) {
            try {
                int y = Integer.parseInt(p[0]);
                int m = Integer.parseInt(p[1]);
                int d = Integer.parseInt(p[2]);
                return String.format("%04d-%02d-%02d", y, m, d);
            } catch (Exception ignored) {}
        }
        var m = KOR_DATE.matcher(raw);
        if (m.find()) {
            int y = Integer.parseInt(m.group(1));
            int mo = Integer.parseInt(m.group(2));
            int da = Integer.parseInt(m.group(3));
            return String.format("%04d-%02d-%02d", y, mo, da);
        }
        return raw.trim();
    }

    public static LocalDate toLocal(String ymd) {
        try {
            return LocalDate.parse(ymd, DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        } catch (Exception e) {
            return null;
        }
    }

    public static LocalDate[] findDateRange(String text) {
        if (text == null) return null;
        var range = RANGE_PATTERN.matcher(text);
        if (range.find()) {
            String a = normalizeDateAny(range.group(1));
            String b = normalizeDateAny(range.group(3));
            LocalDate s = toLocal(a), e = toLocal(b);
            if (s != null && e != null) {
                if (e.isBefore(s)) { LocalDate t = s; s = e; e = t; }
                return new LocalDate[]{s, e};
            }
        }
        var single = SINGLE_ANY.matcher(text);
        if (single.find()) {
            String a = normalizeDateAny(single.group(1));
            LocalDate s = toLocal(a);
            if (s != null) return new LocalDate[]{s, s};
        }
        var all = KOR_DATE.matcher(text);
        List<LocalDate> found = new ArrayList<>();
        while (all.find()) {
            int y = Integer.parseInt(all.group(1));
            int mo = Integer.parseInt(all.group(2));
            int da = Integer.parseInt(all.group(3));
            found.add(LocalDate.of(y, mo, da));
        }
        if (found.size() >= 2) {
            LocalDate s = found.get(0), e = found.get(1);
            if (e.isBefore(s)) { LocalDate t = s; s = e; e = t; }
            return new LocalDate[]{s, e};
        } else if (found.size() == 1) {
            return new LocalDate[]{found.get(0), found.get(0)};
        }
        return null;
    }

    /* ================= 하단 블록 추출 ================= */

    public static String bottomInfoText(Document doc) {
        Element attach = null;
        for (Element el : doc.select("*, * *")) {
            String t = textOrNull(el);
            if (t != null && t.replaceAll("\\s+", "").contains("첨부파일")) {
                attach = el;
                break;
            }
        }
        Element candidate = null;
        if (attach != null) {
            candidate = attach.parent();
            Element prev = attach.previousElementSibling();
            if (prev != null) candidate = prev;
        }
        if (candidate == null) {
            Elements dls = doc.select("article dl, .content dl, .cont dl, .bbs_view dl, dl");
            if (!dls.isEmpty()) candidate = dls.last();
        }
        if (candidate == null) {
            Elements tables = doc.select("article table, .content table, .cont table, .bbs_view table, table");
            if (!tables.isEmpty()) candidate = tables.last();
        }
        if (candidate == null) {
            Elements blocks = doc.select("article, .content, .cont, .bbs_view, .view_con");
            if (!blocks.isEmpty()) candidate = blocks.last();
        }
        if (candidate == null) candidate = doc.body();
        String txt = textOrNull(candidate);
        return txt == null ? "" : txt.replace('\u00A0', ' ').replaceAll("\\s+", " ").trim();
    }

    /* ================= 라벨 값 짧게 추출 ================= */

    public static String extractLabelShort(String text, String... labels) {
        if (text == null) return null;

        String boundary = String.join("|", new String[]{
                "일자","행사일자","기간","행사기간","장소","위치","주소",
                "홈페이지","첨부파일","찾아오시는\\s*길",
                "Top","관광","문의","주최","프로그램","일정","티켓","관람","러닝타임","공연"
        });

        for (String label : labels) {
            String regex = "(?i)(?:^|\\b)" + label + "\\s*[:：]?\\s*([\\p{IsHangul}A-Za-z0-9·\\-()&,/\\s]+?)(?=(\\b(" + boundary + ")\\b|$))";
            var m = java.util.regex.Pattern.compile(regex).matcher(text);
            String hit = null;
            while (m.find()) hit = m.group(1); // 마지막(하단) 매치 선호

            if (hit != null) {
                hit = hit.replace('\u00A0', ' ').replaceAll("\\s+", " ").trim();
                // 앞/뒤 잡음 제거
                hit = hit.replaceAll("^(?:[:：ㅇ□•\\-|,\\s]+)", "").trim();
                hit = hit.replaceAll("(홈페이지|첨부파일|찾아오시는 길|일자|기간|주최|문의|프로그램|티켓|관람|러닝타임).*", "").trim();
                hit = hit.replaceAll("\\s[-–]\\s.*$", "").replaceAll("\\s[ㅇ□•]\\s.*$", "").trim();

                // 숫자(연도)로 시작하거나, 4자리 숫자만인 경우 오검출로 무효화
                if (hit.matches("^\\d{4}([.\\-].*)?$") || hit.matches("^\\d+$")) return null;

                // 너무 짧거나 의미 없는 값 배제
                if (hit.length() < 2) return null;

                return hit;
            }
        }
        return null;
    }



    /* ================= 기간 전용 추출 ================= */

    public static LocalDate[] extractPeriodFromBottom(String bottomText) {
        if (bottomText == null) return null;

        String periodText = extractLabelShort(bottomText, "일자", "행사일자", "기간", "행사기간");
        LocalDate[] se = parseDateRangeOrSingle(periodText);
        if (se != null) return se;

        se = findDateRange(bottomText);
        if (se != null) return se;

        String one = normalizeDateAny(bottomText);
        LocalDate s = toLocal(one);
        if (s != null) return new LocalDate[]{s, s};

        return null;
    }

    public static LocalDate[] parseDateRangeOrSingle(String rawOrFallbackText) {
        if (rawOrFallbackText == null || rawOrFallbackText.isBlank()) return null;
        LocalDate[] r = findDateRange(rawOrFallbackText);
        if (r != null) return r;
        String[] parts = rawOrFallbackText.split("~|–|-");
        if (parts.length >= 2) {
            String a = normalizeDateAny(parts[0]);
            String b = normalizeDateAny(parts[1]);
            LocalDate s = toLocal(a), e = toLocal(b);
            if (s != null && e != null) {
                if (e.isBefore(s)) { LocalDate t = s; s = e; e = t; }
                return new LocalDate[]{s, e};
            }
        }
        LocalDate one = toLocal(normalizeDateAny(rawOrFallbackText));
        if (one != null) return new LocalDate[]{one, one};
        return null;
    }

    /* ================= 구조형 라벨(th/td, dt/dd) ================= */

    public static String getByStructure(Document doc, String... labels) {
        for (Element tr : doc.select("table tr")) {
            String th = textOrNull(tr.selectFirst("th"));
            String td = textOrNull(tr.selectFirst("td"));
            if (th == null || td == null) continue;
            String norm = th.replaceAll("\\s+", "");
            for (String lb : labels) if (norm.contains(lb)) return td;
        }
        for (Element dl : doc.select("dl")) {
            Elements dts = dl.select("dt");
            Elements dds = dl.select("dd");
            for (int i = 0; i < Math.min(dts.size(), dds.size()); i++) {
                String dt = textOrNull(dts.get(i));
                if (dt == null) continue;
                String norm = dt.replaceAll("\\s+", "");
                for (String lb : labels) if (norm.contains(lb)) return textOrNull(dds.get(i));
            }
        }
        return null;
    }

    /** location 최종 정리: 공백 정돈, 잘못된 값 필터링, 흔한 접미 잡음 제거 */
    // 클래스 내부 임의의 아래쪽 위치에 추가 (이미 있었다면 아래 내용으로 교체)
    public static String normalizeLocation(String raw) {
        if (raw == null) return null;
        String s = raw.replace('\u00A0', " ").replaceAll("\\s+", " ").trim();

        // 숫자만/연도만은 무효
        if (s.matches("^\\d{4}([.\\-].*)?$") || s.matches("^\\d+$")) return null;

        // 섹션/라벨 단어가 섞였으면 거기서 컷
        s = s.replaceAll("(홈페이지|첨부파일|찾아오시는 길|일자|기간|주최|문의|프로그램|티켓|관람|러닝타임).*", "").trim();
        // 불릿/대시 이후 설명 컷
        s = s.replaceAll("\\s[-–]\\s.*$", "").replaceAll("\\s[ㅇ□•]\\s.*$", "").trim();

        // 쉼표/일원 공백 정리
        s = s.replaceAll("\\s*,\\s*", ", ").replaceAll("\\s+일원$", " 일원");

        return s.isBlank() ? null : s;
    }

    // 클래스 내부 임의의 아래쪽 위치에 추가
    public static String extractFromFindTheWay(String bottomOrDocText) {
        if (bottomOrDocText == null) return null;
        String t = bottomOrDocText.replace('\u00A0', ' ').replaceAll("\\s+", " ").trim();
        // 1) "찾아오시는 길:" 다음 ~ 경계 전까지
        var m1 = java.util.regex.Pattern
                .compile("찾아오시는\\s*길\\s*[:：]?\\s*([^|\\n\\r]+?)(?=(일자|기간|홈페이지|첨부파일|주최|문의|프로그램|$))")
                .matcher(t);
        if (m1.find()) {
            String v = m1.group(1).trim();
            // 안에 장소 단어가 있으면 그 부분만 보존 (없으면 전체 반환)
            var placeCut = java.util.regex.Pattern
                    .compile("(.*?(일원|광장|공원|거리|극장|스퀘어|센터|전당|타운|랜드|홀|운동장|해변|마을|공터|해수욕장|플라자|야외무대|정원|캠퍼스|로|길|청|장|원|베이|항|포구|사거리|사잇길|공구길|카페거리|문화회관|야외극장))")
                    .matcher(v);
            if (placeCut.find()) v = placeCut.group(1).trim();
            return normalizeLocation(v);
        }
        // 2) "주소:" 패턴이 포함돼 있으면 주소만 가져오기
        var m2 = java.util.regex.Pattern.compile("주소\\s*[:：]\\s*([^|\\n\\r]+)").matcher(t);
        if (m2.find()) return normalizeLocation(m2.group(1).trim());
        return null;
    }

}
