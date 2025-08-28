from graphviz import Digraph

# Create directed graph
dot = Digraph(comment="Study Design Diagram", format="png")
dot.attr(rankdir="LR", size="8")

# Nodes
dot.node("RQ", "Research Question / Hypotheses")
dot.node("P", "Participants\n(N=..., Gender split)")
dot.node("T", "Procedure\n(Tasks via AWS app)")
dot.node("D", "Data Collected\n(Prompts, AI responses, metadata)")
dot.node("V", "Variables\nIV: Gender\nDVs: Lexical features, Emotional vocab, Pronoun use")
dot.node("DP", "Data Processing\n(Cleaning, Feature Extraction)")
dot.node("A", "Data Analysis\nShapiro-Wilk → t-test / Mann-Whitney U")
dot.node("O", "Outcomes\n(Differences in linguistic style by gender)")
dot.node("E", "Ethics & Consent\n(Informed consent, Privacy, Anonymization)")

# Edges (main flow)
dot.edges([("RQ","P"), ("P","T"), ("T","D"), ("D","V"), ("V","DP"), ("DP","A"), ("A","O")])

# Ethics side connection
dot.edge("E", "P", style="dashed")
dot.edge("E", "D", style="dashed")

# Render to file
file_path = "study_design_diagram"
dot.render(file_path)


