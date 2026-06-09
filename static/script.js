document.addEventListener("DOMContentLoaded", () => {

    const askButton = document.getElementById("ask-btn");

    const quizButton = document.getElementById("quiz-btn");

    const statsButton = document.getElementById("stats-btn");

    const weakButton = document.getElementById("weak-btn");

    const semanticButton = document.getElementById("semantic-btn");

    const input = document.getElementById("word-input");

    const chatBox = document.getElementById("chat-box");

    // ===== STATE =====

    let currentAnswer = "";

    let score = 0;

    let totalQuestions = 0;

    let streak = 0;

    // ===== SCOREBOARD =====

    const scoreBoard = document.createElement("div");

    scoreBoard.id = "score-board";

    scoreBoard.innerHTML = `<h3>Score: 0/0 | Streak: 0</h3>`;

    chatBox.parentNode.insertBefore(scoreBoard, chatBox);

    // =========================

    // ASK WORD MODE

    // =========================

    askButton.addEventListener("click", async () => {

        const word = input.value.trim();

        if (word === "") return;

        const response = await fetch("/get_word", {

            method: "POST",

            headers: { "Content-Type": "application/json" },

            body: JSON.stringify({ word: word })

        });

        const data = await response.json();

        chatBox.innerHTML += `

            <div class="bot-message">

                <h2>${data.word}</h2>

                <p><strong>Definition:</strong><br>${data.definition}</p>

                <p><strong>Part of Speech:</strong><br>${data.part_of_speech}</p>

                <p><strong>Example:</strong><br>${data.example}</p>

                <p><strong>Synonyms:</strong><br>${data.synonyms || "Not available"}</p>

                <p><strong>Antonyms:</strong><br>${data.antonyms || "Not available"}</p>

            </div>

        `;

        chatBox.scrollTop = chatBox.scrollHeight;

        input.value = "";

    });

    // =========================

    // QUIZ MODE

    // =========================

    if (quizButton) {

        quizButton.addEventListener("click", async () => {

            const oldQuiz = document.getElementById("quiz-block");

            if (oldQuiz) oldQuiz.remove();

            const response = await fetch("/quiz-question");

            const data = await response.json();

            currentAnswer = data.word_id;

            chatBox.innerHTML += `

                <div class="bot-message" id="quiz-block">

                    <h2>Quiz Time</h2>

                    <p><strong>Definition:</strong><br>${data.definition}</p>

                    <input id="quiz-input" placeholder="Type the word..." />

                    <button id="submit-answer">Submit</button>

                </div>

            `;

            chatBox.scrollTop = chatBox.scrollHeight;

            setTimeout(() => {

                const submitBtn = document.getElementById("submit-answer");

                if (!submitBtn) return;

                submitBtn.onclick = async () => {

                    const userAnswer = document

                        .getElementById("quiz-input")

                        .value

                        .trim();

                    if (userAnswer === "") return;

                    const res = await fetch("/check-answer", {

                        method: "POST",

                        headers: { "Content-Type": "application/json" },

                        body: JSON.stringify({

                            answer: userAnswer,

                            correct: currentAnswer,

                            score: score,

                            total: totalQuestions,

                            streak: streak

                        })

                    });

                    const result = await res.json();

                    totalQuestions++;

                    if (result.result === "correct") {

                        score++;

                        streak++;

                    } else {

                        streak = 0;

                    }

                    scoreBoard.innerHTML = `

                        <h3>Score: ${score}/${totalQuestions} | Streak: ${streak}</h3>

                    `;

                    chatBox.innerHTML += `

                        <div class="bot-message">

                            ${result.result === "correct"

                            ? "Correct ✅"

                            : "Wrong ❌ Correct answer: " + result.correct}

                        </div>

                    `;

                    chatBox.scrollTop = chatBox.scrollHeight;

                };

            }, 50);

        });

    }

    // =========================

    // STATS MODE

    // =========================

    if (statsButton) {

        statsButton.addEventListener("click", async () => {

            const response = await fetch("/stats");

            const data = await response.json();

            chatBox.innerHTML += `

                <div class="bot-message">

                    <h2>📊 Performance Overview</h2>

                    <p><strong>Total Quiz Attempts:</strong><br>${data.total_attempts}</p>

                    <p><strong>Total Correct Answers:</strong><br>${data.total_correct}</p>

                    <p><strong>Best Streak:</strong><br>${data.best_streak}</p>

                    <p><strong>Average Score:</strong><br>${data.average_score}</p>

                </div>

            `;

            chatBox.scrollTop = chatBox.scrollHeight;

        });

    }

    // =========================

    // WEAK WORD PRACTICE MODE

    // =========================

    if (weakButton) {

        weakButton.addEventListener("click", async () => {

            // REMOVE OLD QUIZ FIRST (important fix)

            const oldQuiz = document.getElementById("quiz-block");

            if (oldQuiz) oldQuiz.remove();

            const response = await fetch("/weak-quiz");

            const data = await response.json();

            currentAnswer = data.word_id;

            chatBox.innerHTML += `

            <div class="bot-message" id="quiz-block">

                <h2>Weak Word Practice</h2>

                <p><strong>Definition:</strong><br>${data.definition}</p>

                <input id="quiz-input" placeholder="Type the word..." />

                <button id="submit-answer">Submit</button>

            </div>

        `;

            chatBox.scrollTop = chatBox.scrollHeight;

            setTimeout(() => {

                const submitBtn = document.getElementById("submit-answer");

                if (!submitBtn) return;

                // IMPORTANT: remove old listener before adding new one

                submitBtn.onclick = null;

                submitBtn.onclick = async () => {

                    const userAnswer = document

                        .getElementById("quiz-input")

                        .value

                        .trim();

                    if (userAnswer === "") return;

                    const res = await fetch("/check-answer", {

                        method: "POST",

                        headers: { "Content-Type": "application/json" },

                        body: JSON.stringify({

                            answer: userAnswer,

                            correct: currentAnswer,

                            score: score,

                            total: totalQuestions,

                            streak: streak

                        })
                    });

                    const result = await res.json();

                    totalQuestions++;

                    if (result.result === "correct") {

                        score++;

                        streak++;

                    } else {

                        streak = 0;

                    }

                    scoreBoard.innerHTML = `

                    <h3>Score: ${score}/${totalQuestions} | Streak: ${streak}</h3>

                `;

                    chatBox.innerHTML += `

                    <div class="bot-message">

                        ${result.result === "correct"

                            ? "Correct ✅"

                            : "Wrong ❌ Correct answer: " + result.correct}
                    </div>
                `;
                    chatBox.scrollTop = chatBox.scrollHeight;
                };
            }, 50);

        });
    }
          
        // =========================
  // SEMANTIC SEARCH MODE
// =========================

  if (semanticButton) {

    semanticButton.addEventListener("click", async () => {

        const query = input.value.trim();

        if (query === "") {

            alert("Enter a word, meaning, or concept first");

            return;

        }

        const response = await fetch("/semantic-search", {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify({

                query: query

            })

        });

        const data = await response.json();

        chatBox.innerHTML += `

            <div class="bot-message">

                <h2>🔎 Semantic Search Result</h2>

                <p>

                    <strong>Closest Word:</strong><br>

                    ${data.word}

                </p>

                <p>

                    <strong>Definition:</strong><br>

                    ${data.definition}

                </p>

                <p>

                    <strong>Similarity Score:</strong><br>

                    ${data.similarity}

                </p>
                <p>
                    <strong>Confidence:</strong><br>
                    ${data.confidence}

                </p>

            </div>

        `;

        chatBox.scrollTop = chatBox.scrollHeight;

        input.value = "";

    });

   }


});