import sqlite3

conn = sqlite3.connect("instance/gre.db")

cursor = conn.cursor()

cursor.execute("PRAGMA table_info(quiz_score)")

print(cursor.fetchall())

cursor.execute("PRAGMA table_info(weak_word)")

print(cursor.fetchall())

conn.close()