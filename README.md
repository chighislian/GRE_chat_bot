# GRE Vocabulary Chatbot

GRE Vocabulary Chatbot is a Flask-based web application that helps users look up GRE words, explore similar words through semantic search, and practice vocabulary through quizzes. It combines a CSV-based word dataset, sentence embeddings for fuzzy matching, and a small SQLite database to track quiz performance and weak words.

## What the project does

- Looks up GRE words and returns the definition, part of speech, example, synonyms, and antonyms.
- Uses semantic search when an exact word match is not found, so users can still discover the closest GRE vocabulary entry.
- Provides quiz mode to test a user on randomly selected GRE words.
- Tracks quiz attempts, correct answers, streaks, and weak words for practice.
- Offers a weak-word practice mode that prioritizes words the user previously missed.

## How it works

The backend is a Flask application defined in [app.py](app.py). When the app starts, it loads the GRE dataset from [data/gre_words_updated.csv](data/gre_words_updated.csv), normalizes the text fields, and builds sentence embeddings using `sentence-transformers` with the `all-MiniLM-L6-v2` model.

For each lookup request, the app first checks for an exact word match. If none is found, it compares the user query against all embedded GRE entries using cosine similarity and returns the closest match if the confidence is high enough. Quiz data and weak-word history are stored in a SQLite database named `gre.db`.

The front end is a simple HTML interface in [templates/index.html](templates/index.html) with styling in [static/style.css](static/style.css) and client-side behavior in [static/script.js](static/script.js).

## Main features

### Word lookup

Users type a GRE word into the input field and press Ask. The app sends the word to the `/get_word` endpoint and renders the returned definition, example, synonyms, and antonyms in the chat area.

### Semantic search

If the exact word is not present in the dataset, the backend uses semantic similarity to find the closest GRE word. This is useful for misspellings, related words, or broader language queries.

### Quiz mode

The Quiz me button requests a random definition from `/quiz-question`. The user must type the matching word, and the answer is checked by `/check-answer`.

### Weak word practice

When a user answers incorrectly, the backend stores that word in the `WeakWord` table and increases its wrong count. The Practice Weak Words button fetches items from `/weak-quiz`, which prefers words the user has missed before.

### Performance stats

The View Stats button calls `/stats` and shows total attempts, total correct answers, best streak, and average score.

## API endpoints

The backend exposes these routes:

- `GET /` - Serves the main UI.
- `POST /get_word` - Returns the best matching GRE word record for a submitted word.
- `GET /quiz-question` - Returns a random definition for quiz mode.
- `POST /check-answer` - Compares a quiz answer, stores score data, and updates weak-word history.
- `GET /stats` - Returns quiz summary metrics.
- `POST /semantic-search` - Returns the closest semantic match for a query.
- `GET /debug-search` - Returns a quick semantic-search debug result.
- `GET /weak-words` - Returns all tracked weak words sorted by mistake count.
- `GET /weak-quiz` - Returns a quiz question biased toward weak words.

## Project structure

```text
GRE_chatbot/
├── app.py
├── ai_search.py
├── requirements.txt
├── data/
│   ├── gre_words.csv
│   └── gre_words_updated.csv
├── templates/
│   └── index.html
├── static/
│   ├── script.js
│   └── style.css
├── instance/
├── to_check_database/
│   ├── to_check_database_connect.py
│   ├── to_how_much_data.py
│   ├── to_see_database_structure.py
│   └── to_test_database.py
└── REAME.MD
```

### File guide

- [app.py](app.py) - Main Flask app, API routes, semantic search, and database models.
- [ai_search.py](ai_search.py) - Standalone script for testing semantic similarity against the GRE dataset.
- [templates/index.html](templates/index.html) - Main page layout.
- [static/script.js](static/script.js) - Front-end interactions, quiz logic, and API calls.
- [static/style.css](static/style.css) - Basic UI styling.
- [data/gre_words_updated.csv](data/gre_words_updated.csv) - Primary GRE word dataset used by the app.
- [to_check_database/](to_check_database/) - Helper scripts for inspecting and testing the database.

## Data model

The app uses two SQLAlchemy models:

- `QuizScore` - Stores quiz attempt data such as correct answers, totals, and streak values.
- `WeakWord` - Stores words the user missed and counts how often each word was answered incorrectly.

The database is configured as SQLite through `sqlite:///gre.db`.

## Setup

1. Create and activate a virtual environment.
2. Install dependencies from [requirements.txt](requirements.txt).
3. Run the Flask app.

```bash
pip install -r requirements.txt
python app.py
```

Then open the local development server in your browser. By default, Flask runs in debug mode in this project.

## Notes

- The app expects the CSV dataset to stay in the `data/` folder.
- The first run may take longer because the sentence-transformer model needs to load and create embeddings.
- The current UI is intentionally simple, but the project supports both lookup and quiz workflows end to end.

## Suggested improvements

If you want to extend the project later, good next steps would be:

- add a proper reset and progress system for quiz history,
- add search filters by part of speech or difficulty,
- persist user sessions instead of storing only aggregate quiz records,
- improve the UI layout and mobile responsiveness,
- add automated tests for the API endpoints.
