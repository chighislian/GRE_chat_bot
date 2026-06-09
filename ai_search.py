from sentence_transformers import SentenceTransformer

from sklearn.metrics.pairwise import cosine_similarity

import pandas as pd

df = pd.read_csv("data/gre_words_updated.csv")

df["combined"] = (

    df["word"].fillna("") + " " +

    df["definition"].fillna("") + " " +

    df["synonyms"].fillna("")

)

model = SentenceTransformer("all-MiniLM-L6-v2")

word_embeddings = model.encode(

    df["combined"].tolist()

)

query = "bravery"

query_embedding = model.encode([query])

similarities = cosine_similarity(

    query_embedding,

    word_embeddings

)

best_index = similarities.argmax()

print("Query:", query)

print("Best Match:", df.iloc[best_index]["word"])

print("Definition:", df.iloc[best_index]["definition"])