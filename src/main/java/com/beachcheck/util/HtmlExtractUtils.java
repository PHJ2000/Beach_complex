package com.beachcheck.util;

import org.jsoup.nodes.*;
import org.jsoup.select.Elements;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.regex.Pattern;

public class HtmlExtractUtils {

    /* -------------------- 공통 텍스트 헬퍼 -------------------- */

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
        s = s.replace('\u00A0', ' '); // NBSP 제거
        s = s.trim().replaceAll("\\s+", " ");
        return s.length() <= max ? s : s.substring(0, max) + "...";
    }

    public static String selectFirstText(Document doc, String css) {
        Element el = doc.selectFirst(css);
        return el == null ? null : el.text().trim();
    }

    public static String meta(Document doc, String key, String value) {
        Element el = doc.selectFirst("meta[" + key + "=" + value + "]");
        return el == null ? null : el.attr("content");
    }

    /* -------------------- 라벨 기반 값 추출 -------------------- */

    public static String labelFollowingText(Document doc, String labelKo) {
        // table
        for (Element row : doc.select("table tr")) {
            String th = textOrNull(row.selectFirst("th"));
            String td = textOrNull(row.selectFirst("td"));
            if (th != null && th.contains(labelKo)) return td;
        }
        // dl
        for (Element dl : doc.select("dl")) {
            Elements dts = dl.select("dt");
            Elements dds = dl.select("dd");
            for (int i = 0; i < Math.min(dts.size(), dds.size()); i++) {
                if (textOrNull(dts.get(i)).contains(labelKo)) {
                    return textOrNull(dds.get(i));
                }
            }
        }
        // 라벨 유사 태그
        for (Element el : doc.select("h1,h2,h3,h4,h5,h6,strong,b,span,p")) {
            String t = el.text();
            if (t != null && t.replace(" ", "").contains(labelKo)) {
                Element sib = el.nextElementSibling();
                if (sib != null) return sib.text();
            }
        }
        return null;
    }

    /* -------------------- 날짜 파싱 -------------------- */

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
                .replaceAll("\\(.*?\\)", "") // (금) 같은 요일 제거
                .replaceAll("[년./-]\\s*", "-")
                .replaceAll("일", "")
                .replaceAll("\\s+", " ")
                .trim();
        // t now like 2025-10-07 or 2025-10-7
        String[] p = t.split("-");
        if (p.length >= 3) {
            try {
                int y = Integer.parseInt(p[0]);
                int m = Integer.parseInt(p[1]);
                int d = Integer.parseInt(p[2]);
                return String.format("%04d-%02d-%02d", y, m, d);
            } catch (Exception ignored) {}
        }
        // Korean "YYYY년 M월 D일" 직접 처리
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

    /** 문장에서 날짜 범위를 탐지하고 (start,end) 반환. 단일 날짜면 start=end */
    public static LocalDate[] findDateRange(String text) {
        if (text == null) return null;
        var range = RANGE_PATTERN.matcher(text);
        if (range.find()) {
            String a = normalizeDateAny(range.group(1));
            String b = normalizeDateAny(range.group(3));
            LocalDate s = toLocal(a), e = toLocal(b);
            if (s != null && e != null) {
                if (e.isBefore(s)) { // 역전 보정
                    LocalDate tmp = s; s = e; e = tmp;
                }
                return new LocalDate[]{s, e};
            }
        }
        var single = SINGLE_ANY.matcher(text);
        if (single.find()) {
            String a = normalizeDateAny(single.group(1));
            LocalDate s = toLocal(a);
            if (s != null) return new LocalDate[]{s, s};
        }
        // Korean "YYYY년 M월 D일 ~ YYYY년 M월 D일"
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

    /* -------------------- 장소 파싱 -------------------- */

    public static String extractLocationFallback(Document detail) {
        // 라벨 우선
        String v = firstNonBlank(
                labelFollowingText(detail, "장소"),
                labelFollowingText(detail, "행사장소"),
                labelFollowingText(detail, "위치"),
                labelFollowingText(detail, "주소")
        );
        if (v != null && !v.isBlank()) return v.trim();

        // 본문 키워드 기반
        var m = Pattern.compile("(장소|위치|행사장소|주소)\\s*[:：]\\s*([\\p{IsHangul}A-Za-z0-9\\s·\\-()]+)")
                .matcher(detail.text());
        if (m.find()) return m.group(2).trim();

        // JSON-LD에서 장소/주소
        String jsonLd = selectFirstText(detail, "script[type=application/ld+json]");
        if (jsonLd != null) {
            // 아주 가벼운 추출 (정식 JSON 파싱 대신)
            var place = Pattern.compile("\"address\"\\s*:\\s*\"([^\"]+)\"").matcher(jsonLd);
            if (place.find()) return place.group(1).trim();
            var name = Pattern.compile("\"name\"\\s*:\\s*\"([^\"]+)\"").matcher(jsonLd);
            if (name.find()) return name.group(1).trim();
        }

        return null;
    }

    /* -------------------- 설명 파싱 -------------------- */

    /** 설명은 메타 > 본문 첫문단 > 긴 본문 순으로 시도 */
    public static String extractDescription(Document detail) {
        String meta = firstNonBlank(
                meta(detail, "property", "og:description"),
                meta(detail, "name", "description")
        );
        if (meta != null && meta.strip().length() >= 10) return trim(meta, 400);

        // 본문 첫 문단/요약 영역
        String p = firstNonBlank(
                selectFirstText(detail, ".summary, .intro, .lead, .bbs_view p, .view_con p, article p"),
                selectFirstText(detail, ".content p, .cont p")
        );
        if (p != null && p.strip().length() >= 10) return trim(p, 400);

        // 본문 전체 중 가장 긴 문단
        Elements paras = detail.select("article p, .content p, .cont p, .bbs_view p, .view_con p");
        String longest = null;
        for (Element para : paras) {
            String t = textOrNull(para);
            if (t != null && t.length() >= 40) {
                if (longest == null || t.length() > longest.length()) longest = t;
            }
        }
        if (longest != null) return trim(longest, 400);

        // 아무것도 못 찾으면 null
        return null;
    }

    // === 아래 메서드들을 HtmlExtractUtils 클래스의 맨 아래 쯤에 추가 ===

    /** 페이지 하단 기준으로 특정 라벨(들)에 해당하는 값의 '마지막' 항목을 찾아 반환 */
    public static String findLastLabeledValue(Document doc, String... labels) {
        List<String> hits = new ArrayList<>();

        // 1) table th/td
        for (Element row : doc.select("table tr")) {
            String th = textOrNull(row.selectFirst("th"));
            String td = textOrNull(row.selectFirst("td"));
            if (th == null || td == null) continue;
            for (String label : labels) {
                if (th.replace(" ", "").contains(label)) {
                    hits.add(td);
                }
            }
        }

        // 2) dl dt/dd
        for (Element dl : doc.select("dl")) {
            Elements dts = dl.select("dt");
            Elements dds = dl.select("dd");
            for (int i = 0; i < Math.min(dts.size(), dds.size()); i++) {
                String dt = textOrNull(dts.get(i));
                String dd = textOrNull(dds.get(i));
                if (dt == null || dd == null) continue;
                for (String label : labels) {
                    if (dt.replace(" ", "").contains(label)) {
                        hits.add(dd);
                    }
                }
            }
        }

        // 3) 일반 라벨(굵은 글씨/제목 등) + 바로 다음 형제
        for (Element el : doc.select("h1,h2,h3,h4,h5,h6,strong,b,span,p,th")) {
            String t = textOrNull(el);
            if (t == null) continue;
            t = t.replace(" ", "");
            for (String label : labels) {
                if (t.contains(label)) {
                    Element sib = el.nextElementSibling();
                    if (sib != null) {
                        String candidate = sib.text();
                        if (candidate != null && !candidate.isBlank()) hits.add(candidate.trim());
                    }
                }
            }
        }

        // 4) 텍스트 기반(“라벨: 값”)
        String plain = doc.text();
        for (String label : labels) {
            var m = java.util.regex.Pattern
                    .compile(label + "\\s*[:：]\\s*([^\\n\\r]+)")
                    .matcher(plain);
            while (m.find()) {
                hits.add(m.group(1).trim());
            }
        }

        // 마지막 값 반환
        if (!hits.isEmpty()) return hits.get(hits.size() - 1);
        return null;
    }

    /** "YYYY.MM.DD ~ YYYY.MM.DD", "YYYY년 M월 D일 ~ ..." 등에서 (start,end) 반환. 단일이면 start=end */
    public static java.time.LocalDate[] parseDateRangeOrSingle(String rawOrFallbackText) {
        if (rawOrFallbackText == null || rawOrFallbackText.isBlank()) return null;

        // 우선 범위 패턴 시도
        java.time.LocalDate[] range = findDateRange(rawOrFallbackText);
        if (range != null) return range;

        // "YYYY년 M월 D일 ~ YYYY년 M월 D일" 같은 경우 findDateRange에서 잡히지만
        // 못 잡는 케이스를 위해 ~ 기준 split後 각각 normalize
        String[] byTilde = rawOrFallbackText.split("~|–|-");
        if (byTilde.length >= 2) {
            String a = normalizeDateAny(byTilde[0]);
            String b = normalizeDateAny(byTilde[1]);
            var sa = toLocal(a);
            var sb = toLocal(b);
            if (sa != null && sb != null) {
                if (sb.isBefore(sa)) { var t = sa; sa = sb; sb = t; }
                return new java.time.LocalDate[]{sa, sb};
            }
        }

        // 단일 날짜 시도
        String one = normalizeDateAny(rawOrFallbackText);
        var s = toLocal(one);
        if (s != null) return new java.time.LocalDate[]{s, s};

        return null;
    }

}
