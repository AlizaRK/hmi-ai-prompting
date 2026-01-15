# hmi-ai-prompting

A research-based course project for **Human-Machine Interaction** at the Frankfurt University of Applied Sciences. This project investigates whether established sociolinguistic gender norms (e.g., rapport vs. report styles) translate into the way humans prompt Large Language Models (LLMs) like ChatGPT.

## 🔗 Project Links
* **Live Research Platform:** [https://alizark.github.io/hmi-ai-prompting/](https://alizark.github.io/hmi-ai-prompting/)
* **Repository:** [https://github.com/AlizaRK/hmi-ai-prompting](https://github.com/AlizaRK/hmi-ai-prompting)

---

## 📝 Research Overview
The study analyzes user behavior through 11 interactive tasks (9 text-based, 2 image-based). By applying computational linguistic methods and statistical analysis, the research identifies patterns in how different genders formulate requests to AI systems.

### Key Hypotheses & Results
* **Sentence Structure:** Contrary to expectations, male users tended to write longer sentences, while female users utilized a higher count of sentences per prompt.
* **Iterative Refinement:** Statistical analysis showed that male users engaged in more iterative refinement (follow-up queries) compared to female users in the balanced sample.
* **Linguistic Markers:** The study found significant differences in lexical diversity (TTR), third-person pronoun usage, and specific emotional markers.
* **Personality Influence:** Data suggests that individual personality traits (Openness, Extraversion) often play a more dominant role in prompting style than gender.

---

## 🛠️ Technical Stack
The project consists of a full-stack architecture designed for data collection and analysis:

### Frontend
* **Hosted on:** GitHub Pages.
* **Purpose:** User intake form, Big Five personality assessment, and interactive prompting environment.

### Backend & Analysis
* **Language:** Python.
* **Libraries:** `NLTK` (Tokenization), `TextBlob` (Subjectivity), `VADER` (Sentiment), `SciPy/Statsmodels` (Mann-Whitney U, Shapiro-Wilk), `Scikit-learn` (Random Forest, PCA).
* **Features Extracted:** Lexical richness, phatic expressions, pronoun ratios, and NRC Emotion Lexicon mapping.

---

## 📂 Project Structure
* `frontend/`: Source code for the web-based research application.
* `backend/`: Python scripts for data cleaning, feature extraction, and ML classification.
* `paper/`: LaTeX source files for the formal research report (using ACM large template).

---

## ⚠️ Usage & Permissions
This project and its contents are for academic research purposes. 

**Important:** If you wish to utilize the code, data extraction scripts, or research findings for your own work, you **must contact the developers** for permission. 

### Contact Information
* **Aliza** - [aliza.-@stud.fra-uas.de](mailto:aliza.-@stud.fra-uas.de)
* **Team:** Salman Younus, Ikbela Halili, Muhammed Berat Kurt, Muhammad Usama.

---

## 🎓 Acknowledgments
Developed as a course project at **Frankfurt University of Applied Sciences**. Special thanks to our participants and course supervisors.
