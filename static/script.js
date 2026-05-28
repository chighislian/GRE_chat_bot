document.addEventListener("DOMContentLoaded", () => {

    const button = document.querySelector("button");

    button.addEventListener("click", async () => {

        const input = document.getElementById("word-input");

        const word = input.value.trim();

        if (word === "") {

            return;

        }

        const response = await fetch("/get_word", {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify({ word: word })

        });

        const data = await response.json();

        const chatBox = document.getElementById("chat-box");

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

});