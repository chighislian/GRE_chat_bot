# to check how much data

import sqlite3

conn = sqlite3.connect("instance/gre.db")

cursor = conn.cursor()

cursor.execute("SELECT COUNT(*) FROM quiz_score")

print("quiz_score:", cursor.fetchone()[0])

cursor.execute("SELECT COUNT(*) FROM weak_word")

print("weak_word:", cursor.fetchone()[0])

conn.close()