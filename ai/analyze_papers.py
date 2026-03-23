"""
Analyze AI-enhanced JSONL paper data for Slack notification.
Usage: python3 analyze_papers.py <path_to_AI_enhanced.jsonl>
Output: JSON with total, cat_lines, kw_text
"""
# #modified by JH(2026.03.23) - extracted from workflow to avoid YAML << heredoc parse error
import json, sys, re
from collections import Counter

path = sys.argv[1] if len(sys.argv) > 1 else ""
papers = []
try:
    with open(path) as f:
        for line in f:
            line = line.strip()
            if line:
                try:
                    papers.append(json.loads(line))
                except Exception:
                    pass
except Exception:
    pass

total = len(papers)

# Per-category count
cat_c = Counter()
for p in papers:
    cats = p.get("categories", [])
    if isinstance(cats, str):
        cats = cats.split()
    for c in cats:
        cat_c[c.strip()] += 1

# Trending keywords from titles
STOP = {
    "a","an","the","of","in","and","for","with","to","on","is","are",
    "via","using","based","from","by","as","at","this","that","its",
    "our","we","new","large","towards","learning","approach","method",
    "methods","high","low","multi","pre","deep","over","into","their",
    "can","have","been","more","than","also","about","model","models",
    "without","between","within","across","each","both","which","when",
    "data","task","tasks","training","efficient","performance","improve",
    "improved","improving","show","shows","propose","proposed","achieve",
}
wc = Counter()
for p in papers:
    words = re.findall(r"[A-Za-z][A-Za-z-]{3,}", p.get("title", "").lower())
    for w in words:
        if w not in STOP:
            wc[w] += 1

cat_lines = "\n".join(f"• *{c}*: {n}편" for c, n in cat_c.most_common(6))
kw_text = "  ".join(f"`{w}`({n})" for w, n in wc.most_common(8))

result = {
    "total": total,
    "cat_lines": cat_lines or "분류 정보 없음",
    "kw_text": kw_text or "-"
}
print(json.dumps(result, ensure_ascii=False))
