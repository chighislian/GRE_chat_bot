# to check database tables
import sqlite3

conn = sqlite3.connect("instance/gre.db")

cursor = conn.cursor()

cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")

print(cursor.fetchall())

conn.close()