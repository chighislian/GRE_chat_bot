from flask import Flask, render_template, request, jsonify
import pandas as pd

app = Flask(__name__)

df = pd.read_csv("data/gre_words_updated.csv")

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/get_word", methods=["POST"])
def get_word():

    word = request.json["word"].lower()

    result = df[df["word"].str.lower() == word]

    if not result.empty:
        row = result.iloc[0]

        return jsonify({
            "word": row["word"],
            "definition": row["definition"],
            "part_of_speech": row["part_of_speech"],
            "example": row["example"],
            "synonyms": row["synonyms"] if pd.notna(row["synonyms"]) else "Not available",
            "antonyms": row["antonyms"] if pd.notna(row["antonyms"]) else "Not available"
        })

    return jsonify({
        "word": word,
        "definition": "Word not found.",
        "part_of_speech": "",
        "example": "",
        "synonyms": "",
        "antonyms": ""
    })

if __name__ == "__main__":
    app.run(debug=True)