document.addEventListener("DOMContentLoaded", () => {

    const askButton = document.querySelector("button");

    const quizButton = document.getElementById("quiz-btn");

    const input = document.getElementById("word-input");

    const chatBox = document.getElementById("chat-box");

    // ===== SCORE VARIABLES =====

    let currentAnswer = "";

    let score = 0;

    let totalQuestions = 0;

    let streak = 0;

    // ===== SCORE BOARD =====

    const scoreBoard = document.createElement("div");

    scoreBoard.id = "score-board";

    scoreBoard.innerHTML = `

        <h3>Score: 0/0 | Streak: 0</h3>

    `;

    chatBox.parentNode.insertBefore(scoreBoard, chatBox);

    // ===== ASK WORD =====

    askButton.addEventListener("click", async () => {

        const word = input.value.trim();

        if (word === "") return;

        const response = await fetch("/get_word", {

            method: "POST",

            headers: {

                "Content-Type": "application/json"
            },

            body: JSON.stringify({ word: word })
        });

        const data = await response.json();

        chatBox.innerHTML += `

            <div class="bot-message">

                <h2>${data.word}</h2>

                <p>
                    <strong>Definition:</strong><br>
                    ${data.definition}
                </p>
                <p>
                    <strong>Part of Speech:</strong><br>
                    ${data.part_of_speech}
                </p>
                <p>
                    <strong>Example:</strong><br>
                    ${data.example}
                </p>
                <p>
                    <strong>Synonyms:</strong><br>
                    ${data.synonyms || "Not available"}
                </p>
                <p>
                    <strong>Antonyms:</strong><br>

                    ${data.antonyms || "Not available"}

                </p>

            </div>

        `;

        chatBox.scrollTop = chatBox.scrollHeight;

        input.value = "";

    });

    // ===== QUIZ MODE =====

    if (quizButton) {

        quizButton.addEventListener("click", async () => {

            // REMOVE OLD QUIZ

            const oldQuiz = document.getElementById("quiz-block");

            if (oldQuiz) oldQuiz.remove();

            const response = await fetch("/quiz-question");

            const data = await response.json();

            currentAnswer = data.word_id;

            chatBox.innerHTML += `

                <div class="bot-message" id="quiz-block">

                    <h2>Quiz Time</h2>

                    <p>

                        <strong>Definition:</strong><br>

                        ${data.definition}

                    </p>

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

                        headers: {

                            "Content-Type": "application/json"

                        },

                        body: JSON.stringify({
                            answer: userAnswer,
                            correct: currentAnswer,
                            score: score,
                            total: totalQuestions,
                            streak: streak
                        })
                    });

                    const result = await res.json();

                    // ===== UPDATE SCORE =====

                    totalQuestions++;

                    if (result.result === "correct") {

                        score++;

                        streak++;

                    } else {

                        streak = 0;

                    }

                    scoreBoard.innerHTML = `

                        <h3>

                            Score: ${score}/${totalQuestions}

                            | Streak: ${streak} 

                        </h3>

                    `;

                    // ===== SHOW RESULT =====

                    chatBox.innerHTML += `

                        <div class="bot-message">

                            ${

                                result.result === "correct"

                                    ? "Correct ✅"

                                    : "Wrong ❌ Correct answer: " + result.correct

                            }

                        </div>

                    `;

                    chatBox.scrollTop = chatBox.scrollHeight;

                };

            }, 50);

        });

    }

});