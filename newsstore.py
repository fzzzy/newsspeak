


import sqlite3
import feedparser


class Feeds(object):
    def __init__(self, sqlitepath, account_name):
        self.path = sqlitepath
        self.name = account_name
        self.db = sqlite3.connect(self.path)
        self.cursor = self.db.cursor()

        self.cursor.execute('''CREATE TABLE IF NOT EXISTS feeds
                              (id INTEGER PRIMARY KEY AUTOINCREMENT,
                               name TEXT NOT NULL,
                               url TEXT NOT NULL,
                               created_at DATETIME DEFAULT CURRENT_TIMESTAMP)
                            ''')

        self.cursor.execute('''CREATE TABLE IF NOT EXISTS posts
                              (id INTEGER PRIMARY KEY AUTOINCREMENT,
                               title TEXT NOT NULL,
                               content TEXT NOT NULL,
                               feed_id INTEGER,
                               read BOOLEAN NOT NULL CHECK (read IN (0, 1)),
                               created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                               FOREIGN KEY(feed_id) REFERENCES feeds(id))
                            ''')
        self.cursor.execute('''CREATE TABLE IF NOT EXISTS metadata
                              (id INTEGER PRIMARY KEY AUTOINCREMENT,
                               created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                               last_modified DATETIME DEFAULT CURRENT_TIMESTAMP,
                               selected_feed INTEGER NOT NULL)''')
        self.db.commit()
        self.cursor.execute("SELECT id FROM feeds")
        results = self.cursor.fetchall()
        if not len(results):
            self.add_feed("Default", "http://scripting.com/rss.xml")
        self.cursor.execute("SELECT id FROM metadata")
        results = self.cursor.fetchall()
        if not len(results):
            self.cursor.execute(
                "INSERT INTO metadata (selected_feed) VALUES (1)")
            self.db.commit()
        self.cursor.execute("SELECT selected_feed FROM metadata WHERE id = 1")
        result = self.cursor.fetchone()
        self.selected_feed_id = result[0]
        self.cursor.execute(
            "SELECT id FROM feeds")
        result = self.cursor.fetchall()
        for (i, (li, )) in enumerate(result):
            print("sli", repr(self.selected_feed_id), i, repr(li))
            if li == self.selected_feed_id:
                self.selected_feed = i + 1
                break
        else:
            self.selected_feed = 1
        print("SELECTED feed", self.selected_feed)

    def add_feed(self, name, url):
        self.cursor.execute('''INSERT INTO feeds (name, url)
                               VALUES (?, ?)''', (name, url))
        feed_id = self.cursor.lastrowid
        self.db.commit()
        print(f"Added feed: {name}, URL: {url}")
        self.fetch_and_store_posts(feed_id, url)
        return feed_id

    def fetch_and_store_posts(self, feed_id, url):
        # Parse the RSS feed
        d = feedparser.parse(url)
        for entry in d.entries:
            title = getattr(entry, 'title', '')
            content = entry.description if 'description' in entry else ''
            # Check if the post already exists
            self.cursor.execute('''SELECT id FROM posts WHERE title = ? AND feed_id = ?''',
                                (title, feed_id))
            if not self.cursor.fetchone():
                # Insert the new post
                self.cursor.execute('''INSERT INTO posts (title, content, feed_id, read)
                                       VALUES (?, ?, ?, 0)''',
                                    (title, content, feed_id))
        self.db.commit()
        print(f"Fetched and stored posts for feed ID: {feed_id}")

    def delete_feed(self, index):
        self.cursor.execute('''SELECT id FROM feeds LIMIT 1 OFFSET ?''', (index-1,))
        result = self.cursor.fetchone()
        if result:
            feed_id = result[0]
            self.cursor.execute('''DELETE FROM posts WHERE feed_id = ?''', (feed_id,))
            self.cursor.execute('''DELETE FROM feeds WHERE id = ?''', (feed_id,))
            self.db.commit()
            print(f"Deleted feed at index: {index}")
            return True
        print(f"No feed found at index: {index}")
        return False

    def list_feeds(self):
        self.cursor.execute('''SELECT id, name, url FROM feeds''')
        feeds = self.cursor.fetchall()
        print("Listing all feeds")
        return feeds

    def select_feed(self, index):
        self.cursor.execute('''SELECT id FROM feeds LIMIT 1 OFFSET ?''', (index-1,))
        result = self.cursor.fetchone()
        if result:
            feed_id = result[0]
            print(f"Selecting feed at index: {index}")
            return Posts(self.db, feed_id)
        else:
            print(f"No feed found at index: {index}")
            return None

    def update_all_feeds(self):
        self.cursor.execute('''SELECT id, url FROM feeds''')
        feeds = self.cursor.fetchall()
        for feed_id, url in feeds:
            self.fetch_and_store_posts(feed_id, url)


class Posts(object):
    def __init__(self, db, feed_id):
        self.db = db
        self.cursor = self.db.cursor()
        self.feed_id = feed_id
        self.cursor.execute('''SELECT name FROM feeds WHERE id = ?''', (self.feed_id,))
        self.name = self.cursor.fetchone()[0]

    def list_posts(self):
        self.cursor.execute('''SELECT id, title FROM posts
                               WHERE feed_id = ? AND read = 0
                               ORDER BY created_at DESC''', (self.feed_id,))
        posts = self.cursor.fetchall()
        print(f"Listing unread posts for feed ID: {self.feed_id}")
        return posts

    def read_post(self, index):
        self.cursor.execute('''SELECT id, title, content FROM posts
                               WHERE feed_id = ? AND read = 0
                               ORDER BY created_at DESC LIMIT 1 OFFSET ?''', (self.feed_id, index-1))
        post = self.cursor.fetchone()
        if post:
            post_id, title, content = post
            self.cursor.execute('''UPDATE posts SET read = 1 WHERE id = ?''', (post_id,))
            self.db.commit()
            print(f"Reading post at index: {index}")
            return {'title': title, 'content': content}
        else:
            print(f"No unread post found at index: {index} for feed ID {self.feed_id}")
            return None

    def list_read(self):
        self.cursor.execute('''SELECT id, title FROM posts
                               WHERE feed_id = ? AND read = 1
                               ORDER BY created_at DESC''', (self.feed_id,))
        posts = self.cursor.fetchall()
        print(f"Listing read posts for feed ID: {self.feed_id}")
        return posts

    def mark_unread(self, index):
        self.cursor.execute('''SELECT id FROM posts
                               WHERE feed_id = ? AND read = 1
                               ORDER BY created_at DESC LIMIT 1 OFFSET ?''', (self.feed_id, index-1))
        result = self.cursor.fetchone()
        if result:
            post_id = result[0]
            self.cursor.execute('''UPDATE posts SET read = 0 WHERE id = ?''', (post_id,))
            self.db.commit()
            print(f"Marked post at index: {index} as unread")
            return True
        print(f"No read post found at index: {index} to mark as unread for feed ID {self.feed_id}")
        return False


