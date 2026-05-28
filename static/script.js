document.addEventListener("DOMContentLoaded", () => {

    const button = document.querySelector("button");

    button.addEventListener("click", async () => {

        const input = document.getElementById("word-input");
        const word = input.value;

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
                <strong>${data.word}</strong><br>
                ${data.definition}<br>
                <em>${data.part_of_speech}</em><br>
                Example: ${data.example}
                ${data.synonyms !== "Not available" ? `<br>Synonyms: ${data.synonyms}` : ""}
                ${data.antonyms !== "Not available" ? `<br>Antonyms: ${data.antonyms}` : ""}
            </div>
        `;

        input.value = "";
    });

});