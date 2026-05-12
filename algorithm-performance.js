/**
 * Shared helpers for execution time vs. rough manual-solve estimates (all visualizer pages).
 */
(function (global) {
    "use strict";

    function escapeAttr(text) {
        return String(text)
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    }

    function graphDensity(V, E) {
        if (V < 2) return null;
        return (2 * E) / (V * (V - 1));
    }

    function formatAlgorithmMs(ms) {
        var x = Number(ms);
        if (!isFinite(x)) return "0.00 ms";
        if (x < 0.01 && x > 0) return x.toFixed(4) + " ms";
        return x.toFixed(2) + " ms";
    }

    /** Human-readable manual time from seconds (under 60s → seconds; else min + sec). */
    function formatManualReadableSeconds(sec) {
        var s = Number(sec);
        if (!isFinite(s) || s <= 0) return "~0 seconds";
        if (s < 60) return "~" + Math.max(1, Math.round(s)) + " seconds";
        var m = Math.floor(s / 60);
        var rem = Math.round(s - m * 60);
        if (rem >= 60) {
            m += 1;
            rem = 0;
        }
        return "~" + m + " minute" + (m === 1 ? "" : "s") + " " + rem + " second" + (rem === 1 ? "" : "s");
    }

    function formatSpeedup(manualMs, algorithmMs) {
        if (!(manualMs > 0)) {
            return { line: "<p class='performanceCard__muted'>Manual time estimate is negligible; speedup is not meaningful.</p>" };
        }
        var denom = algorithmMs > 0 ? algorithmMs : 1e-9;
        var ratio = manualMs / denom;
        if (!isFinite(ratio)) {
            return { line: "<p class='performanceCard__speedup'>🚀 The algorithm finished faster than we could measure compared to the manual estimate.</p>" };
        }
        var rStr;
        if (ratio >= 1000) rStr = Math.round(ratio).toLocaleString() + "x";
        else if (ratio >= 100) rStr = Math.round(ratio) + "x";
        else if (ratio >= 10) rStr = ratio.toFixed(1) + "x";
        else rStr = ratio.toFixed(2) + "x";

        if (ratio < 1) {
            return {
                line: "<p class='performanceCard__muted'>The rough manual estimate is shorter than the measured run (overhead / rounding).</p>"
            };
        }
        return {
            line: "<p class='performanceCard__speedup'>🚀 The algorithm is <strong>" + rStr + "</strong> faster than solving it manually!</p>"
        };
    }

    var TOOLTIPS = {
        dijkstra: "Rough model: V × E × 8 seconds (time per relaxation work). Not exact — for intuition only.",
        prim: "Rough model: E × log₂(V) × 6 seconds (edge comparisons in a heap-style Prim view). Not exact — for intuition only.",
        kruskal: "Rough model: E × log₂(E) × 5 seconds (sort + union-find style steps). Not exact — for intuition only."
    };

    function graphStatsHtml(V, E) {
        var d = graphDensity(V, E);
        var dStr = d === null ? "N/A" : d.toFixed(4);
        var densityTip = "For an undirected simple graph: (2E) / (V(V − 1)).";
        return (
            "<div class='graphStats'>" +
            "<p><strong>Vertices (V):</strong> " + V + "</p>" +
            "<p><strong>Edges (E):</strong> " + E + "</p>" +
            "<p><strong>Density:</strong> " + dStr +
            " <span class='perfInfo' tabindex='0' role='img' aria-label='" + escapeAttr(densityTip) + "' title='" + escapeAttr(densityTip) + "'>ⓘ</span></p>" +
            "</div>"
        );
    }

    /**
     * @param {object} opts
     * @param {number} opts.V
     * @param {number} opts.E
     * @param {number} opts.algorithmMs
     * @param {number} opts.manualSeconds
     * @param {'dijkstra'|'prim'|'kruskal'} opts.formulaKey
     */
    function performanceComparisonHtml(opts) {
        var V = opts.V | 0;
        var E = opts.E | 0;
        var algorithmMs = Number(opts.algorithmMs) || 0;
        var manualSec = Number(opts.manualSeconds) || 0;
        var formulaKey = opts.formulaKey || "dijkstra";

        var manualMs = manualSec * 1000;
        var speed = formatSpeedup(manualMs, algorithmMs);
        var tip = TOOLTIPS[formulaKey] || "";

        return (
            graphStatsHtml(V, E) +
            "<div class='performanceCard'>" +
            "<h3 class='performanceCard__title'>⏱ Performance Comparison</h3>" +
            "<p><strong>Algorithm solved in:</strong> " + formatAlgorithmMs(algorithmMs) + "</p>" +
            "<p><strong>Your estimated time:</strong> " + formatManualReadableSeconds(manualSec) +
            " <span class='perfInfo' tabindex='0' role='img' aria-label='" + escapeAttr(tip) + "' title='" + escapeAttr(tip) + "'>ⓘ</span></p>" +
            speed.line +
            "</div>"
        );
    }

    function estimateDijkstraSeconds(V, E) {
        return Math.max(0, (V | 0) * (E | 0) * 8);
    }

    function estimatePrimSeconds(V, E) {
        var v = Math.max(V | 0, 1);
        var e = E | 0;
        var lv = v > 1 ? Math.log2(v) : 0;
        return Math.max(0, e * lv * 6);
    }

    function estimateKruskalSeconds(E) {
        var e = E | 0;
        if (e <= 0) return 0;
        return e * Math.log2(e) * 5;
    }

    global.graphAlgorithmPerf = {
        performanceComparisonHtml: performanceComparisonHtml,
        estimateDijkstraSeconds: estimateDijkstraSeconds,
        estimatePrimSeconds: estimatePrimSeconds,
        estimateKruskalSeconds: estimateKruskalSeconds
    };
})(typeof window !== "undefined" ? window : this);
