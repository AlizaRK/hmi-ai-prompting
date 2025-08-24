# Sentiment & Linguistic Results

## 1) Overall Sentiment Profile

**Result:** Across **484 user prompts**, sentiment skews positive: **59.5% Positive**, **32.2% Neutral**, **8.3% Negative**. Average scores: **VADER compound = 0.329**, **TextBlob polarity = 0.119**, **subjectivity = 0.321** (more objective than subjective).

**Reasoning:** Prompts to AI are generally framed as constructive/help-seeking tasks rather than complaints. This baseline matters because gender differences should be interpreted **on top of** an overall positive norm.

---

## 2) Sentiment by Gender (VADER Compound)

**Result:** **Female prompts:** mean **0.544** (n=50). **Male prompts:** mean **0.305** (n=434). Difference is **statistically significant** (independent-samples t-test, **p < .001**).

**Reasoning:** Women’s prompts carry a **more positive emotional tone**. This directly supports the hypothesis that gender relates to **affective expression** in prompting. Even with class imbalance (many more male prompts), the effect is robust enough to reach significance.

---

## 3) Sentiment by Gender (TextBlob Polarity)

**Result:** **Female** mean **0.140**, **Male** mean **0.117** (both positive; females slightly higher).

**Reasoning:** Using a different engine yields the same direction. Cross-model agreement strengthens the claim that women’s prompts are **more positively framed**.

---

## 4) Subjectivity

**Result:** Dataset mean **0.321** (on 0–1), indicating **overall objectivity**.

**Reasoning:** Most prompts are task-oriented (“do/explain/plan”). When you observe higher subjectivity for a subgroup or task, it signals **more personal stance-taking** rather than pure instruction. In this sample, objectivity dominates, so sentiment differences are **not** simply a by-product of higher subjectivity.

---

## 5) Word Count (Message Length)

**Result:** **Female** prompts average **41.6** words; **Male** prompts **25.1** words.

**Reasoning:** Women tend to supply **more context and detail**. Longer prompts often co-occur with more explicit constraints and examples, which can influence model outputs and aligns with an **interpersonally rich** prompting style.

---

## 6) Sentence Structure (Sentence Count & Average Sentence Length)

**Result:** **Female** prompts contain **more sentences** but with **shorter average length (\~11.3 words)**; **Male** prompts have **fewer sentences** but **longer average length (\~15.5 words)**.

**Reasoning:** This pattern suggests **conversational, incremental** construction among women (shorter, multiple clauses) versus a **compact, monolithic** style among men (fewer, longer sentences). It maps onto the hypothesis that men favor a more **direct** structure, whereas women include more **relational scaffolding** around requests.

---

## 7) Interrogative & Emphatic Markers (Question/Exclamation Ratios)

**Result:** Questions and exclamations are **rare overall** (≈0.12 and 0.01 per message, respectively), with gender differences present but small.

**Reasoning:** Where higher, **question ratio** indicates a more **interactive/consultative** stance toward the AI (“Can you…?”, “Would you…?”). **Exclamation** reflects **expressive emphasis** (enthusiasm/frustration). Any gender skew here would signal differences in **engagement framing** (asking vs. instructing) or **emotional salience**.

---

## 8) Emotion Word Usage

**Result:** **Female** prompts show **more positive words/message (≈6.08)** and **more negative words/message (≈1.58)** than **male** prompts (**4.47** and **0.45**, respectively).

**Reasoning:** Women use a **richer emotional lexicon**—both praise/enthusiasm and dissatisfaction/concern. Men’s lower counts reflect a **flatter affect**. This aligns with the proposition that women’s prompting is **more emotionally expressive** overall, not just “more positive.”

---

## 9) Uncertainty & Tentativeness

**Result:** **Uncertainty words** are common across both groups (**Female ≈3.20**, **Male ≈3.41** per message). **Tentative phrases** are low overall (near zero for females; small for males).

**Reasoning:** Frequent uncertainty markers (“maybe,” “might,” “could”) indicate that users often **hedge** when asking AI to generate or decide. Similar rates across genders imply **shared caution** in specifying requests; the minimal tentative phrasing suggests users still aim for **decisive instructions**, even when uncertain.

---

## 10) Pronoun Usage (First/Second/Third Person)

**Result:** From the plots, **first-person pronouns** appear **higher** for females; second/third-person rates are closer.

**Reasoning:** More **first-person** (“I,” “my,” “we”) indicates **personalization**—tying the task to the user’s own context (“I need…”, “my project…”). Where **third-person** is higher, prompts are **other-oriented** (e.g., “my husband,” “students,” “they”). A female tilt toward first-person supports the idea of **interpersonal framing** and **self-referencing** in prompt construction.

---

## 11) Correlation Structure (Sentiment Metrics)

**Result:** As expected, **VADER compound** correlates **positively** with VADER **positive** share and **negatively** with VADER **negative** share; correlations with **word count** are modest.

**Reasoning:** The sentiment engines behave consistently. The weak link to length suggests that **tone** is not merely an artifact of **verbosity**—useful for ruling out “longer = happier” as a sole explanation.

---

## 12) Time Dynamics (Daily Averages)

**Result:** Average daily sentiment varies modestly over days; no sustained trend visible.

**Reasoning:** Day-to-day context (collection windows, task order) did not drive the gender effect; the gender gap appears **structural**, not temporal.

---

## 13) Statistical Inference

**Result:** **t-test** on VADER compound shows a **reliable gender difference** (**p < .001**).

**Reasoning:** Even with an **imbalanced sample** (50 female vs 434 male prompts), the difference is large enough to be **unlikely by chance**, bolstering your central claim that **gender influences prompting sentiment**. (For the paper, consider adding an **effect size** like Cohen’s *d* and a **robust/non-parametric** check.)

---

## What “High” vs “Low” Means (Quick Mapping)

* **Higher VADER/TextBlob** → **more positive tone** (warmer/encouraging framing).
* **Higher subjectivity** → **more personal stance**, opinions, or self-reference.
* **Higher word count** → **more context and constraints**, potentially clearer intent and expectations.
* **More sentences + shorter length** → **conversational scaffolding**; step-by-step asks.
* **More question marks** → **interactive/consultative** style (“ask the model”).
* **More exclamation marks** → **expressive emphasis** (enthusiasm/urgency).
* **More positive/negative words** → **richer emotional expression** (both directions).
* **More first-person pronouns** → **self-anchored requests**; personalization.
* **More uncertainty words** → **hedging/caution** in requests.
