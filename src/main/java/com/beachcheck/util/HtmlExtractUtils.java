package com.beachcheck.util;

import org.jsoup.nodes.*;
import org.jsoup.select.Elements;
import java.util.regex.Pattern;

public class HtmlExtractUtils {

    public static String labelFollowingText(Document doc, String labelKo) {
        for (Element row : doc.select("table tr")) {
            String th = textOrNull(row.selectFirst("th"));
            String td = textOrNull(row.selectFirst("td"));
            if (th != null && th.contains(labelKo)) return td;
        }
        for (Element dl : doc.select("dl")) {
            Elements dts = dl.select("dt");
            Elements dds = dl.select("dd");
            for (int i = 0; i < Math.min(dts.size(), dds.size()); i++) {
                if (textOrNull(dts.get(i)).contains(labelKo)) {
                    return textOrNull(dds.get(i));
                }
            }
        }
        for (Element el : doc.select("h1,h2,h3,h4,h5,strong,b,span,p")) {
            String t = el.text();
            if (t != null && t.replace(" ", "").contains(labelKo)) {
                Element sib = el.nextElementSibling();
                if (sib != null) return sib.text();
            }
        }
        return null;
    }

    public static String findDateRange(String text) {
        var rgx = Pattern.compile("(\\d{4}[./-]\\d{1,2}[./-]\\d{1,2}).{0,5}(~|–|-).{0,5}(\\d{4}[./-]\\d{1,2}[./-]\\d{1,2})");
        var m = rgx.matcher(text);
        if (m.find()) return m.group(1) + " ~ " + m.group(3);
        var single = Pattern.compile("(\\d{4}[./-]\\d{1,2}[./-]\\d{1,2})").matcher(text);
        if (single.find()) return single.group(1);
        return null;
    }

    public static String normalizeDate(String raw) {
        if (raw == null) return null;
        String t = raw.replaceAll("[^0-9.-]", "").replace('.', '-');
        String[] parts = t.split("-");
        if (parts.length >= 3) {
            try {
                int y = Integer.parseInt(parts[0]);
                int m = Integer.parseInt(parts[1]);
                int d = Integer.parseInt(parts[2]);
                return String.format("%04d-%02d-%02d", y, m, d);
            } catch (Exception ignored) {}
        }
        return raw.trim();
    }

    public static String extractLocationFallback(Document detail) {
        var m = Pattern.compile("장소\\s*[:：]\\s*([\\p{IsHangul}A-Za-z0-9\\s·\\-()]+)").matcher(detail.text());
        if (m.find()) return m.group(1).trim();
        return null;
    }

    public static String textOrNull(Element el) {
        return el == null ? null : el.text().trim();
    }

    public static String firstNonBlank(String... arr) {
        for (String s : arr) {
            if (s != null && !s.isBlank()) return s.trim();
        }
        return null;
    }

    public static String trim(String s, int max) {
        if (s == null) return null;
        s = s.trim().replaceAll("\\s+", " ");
        return s.length() <= max ? s : s.substring(0, max) + "...";
    }
}
