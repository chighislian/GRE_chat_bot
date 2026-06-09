from flask import Flask, render_template, request, jsonify
import pandas as pd
from flask_sqlalchemy import SQLAlchemy
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer 
app = Flask(__name__)

# =========================
# LOAD DATA
# =========================
df = pd.read_csv("data/gre_words_updated.csv")

# Clean text (VERY important for matching)
df["word"] = df["word"].astype(str).str.strip().str.lower()
df["definition"] = df["definition"].astype(str)
df["synonyms"] = df["synonyms"].fillna("Not available")
df["antonyms"] = df["antonyms"].fillna("Not available")

# =========================
# SEMANTIC SEARCH SETUP
# =========================
df["combined"] = (df["word"].fillna("") + " " + df["definition"].fillna("") + " " + df["synonyms"].fillna("") + " " + df["synonyms"].fillna("") + " "+ df["example"].fillna(""))
model = SentenceTransformer("all-MiniLM-L6-v2")
word_embeddings = model.encode(

    df["combined"].tolist()

)

# =========================
# DATABASE
# =========================
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///gre.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)

class QuizScore(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    correct = db.Column(db.Integer)
    total = db.Column(db.Integer)
    streak = db.Column(db.Integer)


class WeakWord(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    word = db.Column(db.String(100), unique=True, nullable=False)
    wrong_count = db.Column(db.Integer, default=1)

# Create DB once
with app.app_context():
    db.create_all()

# =========================
# ROUTES
# =========================
@app.route("/")
def home():
    return render_template("index.html")

# ---------- WORD LOOKUP ----------


@app.route("/get_word", methods=["POST"])
def get_word():

    word = request.json["word"].strip().lower()

    # =========================
    # EXACT MATCH
    # =========================
    result = df[df["word"] == word]

    if not result.empty:

        row = result.iloc[0]

        return jsonify({
            "word": row["word"],
            "definition": row["definition"],
            "part_of_speech": row["part_of_speech"],
            "example": row["example"],
            "synonyms": row["synonyms"],
            "antonyms": row["antonyms"],
            "semantic": False
        })

    # =========================
    # SEMANTIC SEARCH FALLBACK
    # =========================
    query_embedding = model.encode([word])

    similarities = cosine_similarity(query_embedding,word_embeddings)

    best_index = similarities.argmax()

    best_score = float(similarities[0][best_index])

    # Prevent meaningless matches
    if best_score < 0.55:

        return jsonify({
            "word": word,
            "definition": "No similar GRE word found.",
            "part_of_speech": "",
            "example": "",
            "synonyms": "Not available",
            "antonyms": "Not available",
            "semantic": False
        })

    row = df.iloc[best_index]

    return jsonify({
        "word": row["word"],
        "definition": row["definition"],
        "part_of_speech": row["part_of_speech"],
        "example": row["example"],
        "synonyms": row["synonyms"],
        "antonyms": row["antonyms"],
        "semantic": True,
        "similarity": round(best_score, 3)
    })






# ---------- QUIZ ----------
@app.route("/quiz-question", methods=["GET"])
def quiz_question():
    row = df.sample().iloc[0]

    return jsonify({
        "definition": row["definition"],
        "word_id": row["word"]
    })

#---------- QUIZ ANSWER ----------
@app.route("/check-answer", methods=["POST"])
def check_answer():

    data = request.json

    user_answer = data["answer"].strip().lower()
    correct_answer = data["correct"].strip().lower()

    is_correct = user_answer == correct_answer

    # =========================
    # SAVE SCORE (existing logic)
    # =========================
    quiz_score = QuizScore(
        correct=1 if is_correct else 0,
        total=1,
        streak=0
    )

    db.session.add(quiz_score)

    # =========================
    # WEAK WORD TRACKING
    # =========================
    if not is_correct:

        weak = WeakWord.query.filter_by(word=correct_answer).first()

        if weak:
            weak.wrong_count += 1
        else:
            weak = WeakWord(word=correct_answer, wrong_count=1)
            db.session.add(weak)

    db.session.commit()

    if is_correct:
        return jsonify({"result": "correct"})
    else:
        return jsonify({
            "result": "wrong",
            "correct": correct_answer
        })




# ---------- STATS ----------
@app.route("/stats", methods=["GET"])
def stats():
    scores = QuizScore.query.all()

    total_attempts = len(scores)

    if total_attempts == 0:
        return jsonify({
            "total_attempts": 0,
            "total_correct": 0,
            "best_streak": 0,
            "average_score": 0
        })

    total_correct = sum(s.correct for s in scores)
    best_streak = max((s.streak for s in scores), default=0)
    average_score = round(total_correct / total_attempts, 2)

    return jsonify({
        "total_attempts": total_attempts,
        "total_correct": total_correct,
        "best_streak": best_streak,
        "average_score": average_score
    })

# ---------- SEMANTIC SEARCH (FIXED) ----------
@app.route("/semantic-search", methods=["POST"])
def semantic_search():
    data = request.json
    query = data["query"].lower()

    query_embedding = model.encode([query])
    similarities = cosine_similarity(query_embedding,word_embeddings)

    best_index = similarities.argmax()
    best_score = float(similarities[0][best_index])



    if best_score < 0.55:

        return jsonify({
            "word": "No Match",
            "definition": "No sufficiently similar GRE word found.",
            "similarity": round(best_score, 3)
        })

    result = df.iloc[best_index]

    return jsonify({
        "word": result["word"],
        "definition": result["definition"],
        "similarity": round(best_score, 3)
    })






# ---------- DEBUG ----------
@app.route("/debug-search")
def debug_search():
    query = "bravery"

    query_embedding = model.encode([query])
    similarities = cosine_similarity(query_embedding,word_embeddings)

    best_index = similarities.argmax()

    return jsonify({
        "best_word": df.iloc[best_index]["word"],
        "score": float(similarities[0][best_index])
    })

@app.route("/weak-words", methods=["GET"])
def weak_words():

    words = WeakWord.query.order_by(WeakWord.wrong_count.desc()).all()

    return jsonify([
        {
            "word": w.word,
            "wrong_count": w.wrong_count
        }
        for w in words
    ])

@app.route("/weak-quiz", methods=["GET"])
def weak_quiz():

    weak_words = WeakWord.query.all()

    if not weak_words:
        random_row = df.sample().iloc[0]
        word = random_row
    else:
        import random
        chosen = random.choice(weak_words)
        word = df[df["word"] == chosen.word].iloc[0]

    return jsonify({
        "definition": word["definition"],
        "word_id": word["word"]
    })

    

# =========================
if __name__ == "__main__":
    app.run(debug=True)