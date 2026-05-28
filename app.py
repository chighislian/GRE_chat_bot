from flask import Flask, render_template, request, jsonify
import pandas as pd
import random

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



@app.route("/quiz-question", methods=["GET"])
def quiz_question():
    random_row = df.sample().iloc[0]
    return jsonify({
        "definition": random_row["definition"],
        "word_id": random_row["word"].lower()
    })

@app.route("/check-answer", methods=["POST"])
def check_answer():

    data = request.json

    user_answer = data["answer"].lower()

    correct_answer = data["correct"].lower()

    if user_answer.strip().lower()== correct_answer.strip().lower():

        return jsonify({"result": "correct"})

    else:

        return jsonify({"result": "wrong", "correct": correct_answer})


if __name__ == "__main__":
    app.run(debug=True)


