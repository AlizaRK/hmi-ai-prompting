import pandas as pd
import numpy as np
import re
from scipy import stats
from pathlib import Path

# ========= Project-relative paths (auto-detect) =========
THIS_DIR = Path(__file__).resolve().parent

# If the script is in the project root, 'data-analysis' is here.
# If the script is in 'search-metrics', then 'data-analysis' is one level up.
if (THIS_DIR / "data-analysis").exists():
    PROJECT_DIR = THIS_DIR
elif (THIS_DIR.parent / "data-analysis").exists():
    PROJECT_DIR = THIS_DIR.parent
else:
    # Fallback: assume current directory is project root
    PROJECT_DIR = THIS_DIR

DATA_DIR = PROJECT_DIR / "data-analysis"
OUTPUT_DIR = PROJECT_DIR / "search-metrics"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# ========= Load Data =========
def read_csv_safe(path):
    try:
        return pd.read_csv(path)
    except UnicodeDecodeError:
        return pd.read_csv(path, encoding="utf-8-sig")

messages = read_csv_safe(DATA_DIR / "message.csv")
participants = read_csv_safe(DATA_DIR / "participant.csv")
pti = read_csv_safe(DATA_DIR / "participant_task_interaction.csv")

# ========= Merge: Participant -> Interaction -> Message =========
merged = messages.merge(
    pti, left_on="interaction_id", right_on="id", suffixes=("_msg", "_pti")
).merge(
    participants, left_on="participant_id", right_on="id", suffixes=("_pti", "_part")
)

# Keep only user messages with real text (exclude AI/image links)
user_msgs = merged[
    (merged["sender"] == "user") &
    (~merged["content"].str.contains(r"http|/static/", na=False))
].copy()

# ========= Simple Tokenizer =========
def simple_tokenize(text: str):
    if not isinstance(text, str):
        return []
    text = text.lower()
    text = re.sub(r"[^a-z\s]", " ", text)
    toks = [t for t in text.split() if t]
    return toks

# ========= Lexical features per message =========
PRONOUNS = {
    "i","you","he","she","we","they","me","him","her","us","them",
    "my","your","our","their","mine","yours","ours","theirs"
}
EMOTION_WORDS = {
    "happy","sad","angry","love","hate","fear","good","bad","better","worse",
    "enjoy","dislike","like","beautiful","ugly"
}

def features_for_text(text: str):
    toks = simple_tokenize(text)
    token_count = len(toks)
    unique_count = len(set(toks)) if token_count > 0 else 0
    ttr = (unique_count / token_count) if token_count > 0 else 0.0
    pronoun_count = sum(1 for t in toks if t in PRONOUNS)
    emotion_count = sum(1 for t in toks if t in EMOTION_WORDS)
    return token_count, ttr, pronoun_count, emotion_count

feat = user_msgs["content"].apply(features_for_text)
user_msgs["token_count"] = feat.apply(lambda x: x[0])
user_msgs["ttr"] = feat.apply(lambda x: x[1])
user_msgs["pronoun_count"] = feat.apply(lambda x: x[2])
user_msgs["emotion_count"] = feat.apply(lambda x: x[3])

# Keep only needed columns for analysis
per_msg = user_msgs[
    ["participant_id", "gender", "content", "token_count", "ttr", "pronoun_count", "emotion_count"]
].dropna(subset=["gender"]).copy()

# ========= Group Summary (means/SDs by gender) =========
group_summary = per_msg.groupby("gender").agg(
    n=("content", "count"),
    token_count_mean=("token_count", "mean"),
    token_count_sd=("token_count", "std"),
    ttr_mean=("ttr", "mean"),
    ttr_sd=("ttr", "std"),
    pronoun_count_mean=("pronoun_count", "mean"),
    pronoun_count_sd=("pronoun_count", "std"),
    emotion_count_mean=("emotion_count", "mean"),
    emotion_count_sd=("emotion_count", "std"),
).reset_index()

# ========= Stats helpers =========
def cohens_d(a, b):
    a = np.asarray(a); b = np.asarray(b)
    na, nb = len(a), len(b)
    if na < 2 or nb < 2:
        return np.nan
    sa2, sb2 = np.var(a, ddof=1), np.var(b, ddof=1)
    denom = ((na - 1)*sa2 + (nb - 1)*sb2) / (na + nb - 2) if (na+nb-2) > 0 else np.nan
    if denom <= 0 or np.isnan(denom):
        return np.nan
    return (np.mean(a) - np.mean(b)) / np.sqrt(denom)

def hedges_g(a, b):
    d = cohens_d(a, b)
    na, nb = len(a), len(b)
    df = na + nb - 2
    if df <= 0 or np.isnan(d):
        return np.nan
    J = 1 - (3 / (4*df - 1))
    return d * J

def cliffs_delta(a, b):
    a = list(a); b = list(b)
    if len(a) == 0 or len(b) == 0:
        return np.nan
    greater = equal = 0
    for x in a:
        for y in b:
            if x > y: greater += 1
            elif x == y: equal += 1
    n = len(a) * len(b)
    less = n - greater - equal
    return (greater - less) / n

def run_tests(per_msg_df, metric, group_col="gender", group_a="female", group_b="male"):
    a = per_msg_df.loc[per_msg_df[group_col] == group_a, metric].dropna().to_numpy()
    b = per_msg_df.loc[per_msg_df[group_col] == group_b, metric].dropna().to_numpy()

    result = {
        "metric": metric,
        "group_a": group_a,
        "group_b": group_b,
        "n_a": len(a),
        "n_b": len(b),
        "mean_a": np.mean(a) if len(a) else np.nan,
        "mean_b": np.mean(b) if len(b) else np.nan,
        "sd_a": np.std(a, ddof=1) if len(a) > 1 else np.nan,
        "sd_b": np.std(b, ddof=1) if len(b) > 1 else np.nan,
    }

    # Welch's t-test
    if len(a) > 1 and len(b) > 1:
        t_stat, p_t = stats.ttest_ind(a, b, equal_var=False)
    else:
        t_stat, p_t = np.nan, np.nan

    # Mann–Whitney U
    if len(a) > 0 and len(b) > 0:
        try:
            u_stat, p_u = stats.mannwhitneyu(a, b, alternative="two-sided")
        except ValueError:
            u_stat, p_u = np.nan, np.nan
    else:
        u_stat, p_u = np.nan, np.nan

    # Effect sizes
    d = cohens_d(a, b) if len(a) > 1 and len(b) > 1 else np.nan
    g = hedges_g(a, b) if len(a) > 1 and len(b) > 1 else np.nan
    delta = cliffs_delta(a, b) if len(a) > 0 and len(b) > 0 else np.nan

    result.update({
        "t_stat_welch": t_stat,
        "p_value_t": p_t,
        "u_stat": u_stat,
        "p_value_mw": p_u,
        "cohens_d": d,
        "hedges_g": g,
        "cliffs_delta": delta
    })
    return result

metrics = ["token_count", "ttr", "pronoun_count", "emotion_count"]
stats_rows = [run_tests(per_msg, m) for m in metrics]
stats_df = pd.DataFrame(stats_rows)

# ========= Save outputs (to project/search-metrics) =========
(per_msg).to_csv(OUTPUT_DIR / "lexical_per_message.csv", index=False)
(group_summary).to_csv(OUTPUT_DIR / "lexical_group_summary.csv", index=False)

with pd.ExcelWriter(OUTPUT_DIR / "lexical_stats_summary.xlsx", engine="openpyxl") as writer:
    group_summary.to_excel(writer, sheet_name="Group Summary", index=False)
    stats_df.to_excel(writer, sheet_name="Stat Tests", index=False)
    per_msg.head(200).to_excel(writer, sheet_name="Sample Per-Message", index=False)

# ========= Print a compact console summary =========
print("\n=== Loaded from:", DATA_DIR, "===")
print("\n=== Group Summary by Gender ===")
print(group_summary.to_string(index=False))
print("\n=== Statistical Tests (Female vs Male) ===")
print(stats_df.to_string(index=False))

print("\nSaved files in:", OUTPUT_DIR)
print(" - lexical_per_message.csv")
print(" - lexical_group_summary.csv")
print(" - lexical_stats_summary.xlsx")
