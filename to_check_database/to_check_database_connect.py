# to test database connection
import sqlite3

conn = sqlite3.connect("instance/gre.db")

cursor = conn.cursor()

cursor.execute("SELECT COUNT(*) FROM words")

print(cursor.fetchone())

conn.close()