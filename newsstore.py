import sqlite3
import feedparser
import datetime

class Feeds(object):
    def __init__(self, sqlitepath):
        self.path = sqlitepath
        self.db = sqlite3.connect(self.path)
        self.cursor = self.db.cursor()
        # Create feeds table
        self.cursor.execute('''CREATE TABLE IF NOT EXISTS feeds
                              (id INTEGER PRIMARY KEY AUTOINCREMENT,
                               name TEXT NOT NULL,
                               url TEXT NOT NULL,
                               created_at DATETIME DEFAULT CURRENT_TIMESTAMP)
                            ''')
        # Create posts table
        self.cursor.execute('''CREATE TABLE IF NOT EXISTS posts
                              (id INTEGER PRIMARY KEY AUTOINCREMENT,
                               title TEXT NOT NULL,
                               content TEXT NOT NULL,
                               feed_id INTEGER,
                               read BOOLEAN NOT NULL CHECK (read IN (0, 1)),
                               created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                               FOREIGN KEY(feed_id) REFERENCES feeds(id))
                            ''')
        self.db.commit()
        print("Initialized Feeds and Posts tables.")

    def add_feed(self, name, url):
        # Insert the new feed into the feeds table
        self.cursor.execute('''INSERT INTO feeds (name, url)
                               VALUES (?, ?)''', (name, url))
        feed_id = self.cursor.lastrowid
        self.db.commit()
        print(f"Added feed: {name}, URL: {url}")
        # Fetch and store posts from the new feed
        self.fetch_and_store_posts(feed_id, url)
        return feed_id

    def fetch_and_store_posts(self, feed_id, url):
        # Parse the RSS feed
        d = feedparser.parse(url)
        for entry in d.entries:
            title = entry.title
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

    def delete_feed(self, feed_id):
        # Delete posts associated with the feed
        self.cursor.execute('''DELETE FROM posts WHERE feed_id = ?''', (feed_id,))
        # Delete the feed itself
        self.cursor.execute('''DELETE FROM feeds WHERE id = ?''', (feed_id,))
        self.db.commit()
        print(f"Deleted feed with ID: {feed_id}")
        return self.cursor.rowcount > 0

    def list_feeds(self):
        self.cursor.execute('''SELECT id, name, url FROM feeds''')
        feeds = self.cursor.fetchall()
        print("Listing all feeds")
        return feeds

    def select_feed(self, feed_id):
        # Check if the feed exists
        self.cursor.execute('''SELECT id FROM feeds WHERE id = ?''', (feed_id,))
        if self.cursor.fetchone():
            print(f"Selecting feed with ID: {feed_id}")
            return Posts(self.db, feed_id)
        else:
            print(f"Feed with ID {feed_id} does not exist.")
            return None

    def update_all_feeds(self):
        # Fetch and update posts for all feeds
        self.cursor.execute('''SELECT id, url FROM feeds''')
        feeds = self.cursor.fetchall()
        for feed_id, url in feeds:
            self.fetch_and_store_posts(feed_id, url)

class Posts(object):
    def __init__(self, db, feed_id):
        self.db = db
        self.cursor = self.db.cursor()
        self.feed_id = feed_id

    def list_posts(self):
        self.cursor.execute('''SELECT id, title FROM posts
                               WHERE feed_id = ? AND read = 0
                               ORDER BY created_at DESC''', (self.feed_id,))
        posts = self.cursor.fetchall()
        print(f"Listing unread posts for feed ID: {self.feed_id}")
        return posts

    def read_post(self, post_id):
        # Fetch the post content
        self.cursor.execute('''SELECT title, content FROM posts
                               WHERE id = ? AND feed_id = ?''', (post_id, self.feed_id))
        post = self.cursor.fetchone()
        if post:
            # Mark the post as read
            self.cursor.execute('''UPDATE posts SET read = 1 WHERE id = ?''', (post_id,))
            self.db.commit()
            print(f"Reading post ID: {post_id}")
            return {'title': post[0], 'content': post[1]}
        else:
            print(f"Post ID {post_id} not found in feed ID {self.feed_id}")
            return None

    def list_read(self):
        self.cursor.execute('''SELECT id, title FROM posts
                               WHERE feed_id = ? AND read = 1
                               ORDER BY created_at DESC''', (self.feed_id,))
        posts = self.cursor.fetchall()
        print(f"Listing read posts for feed ID: {self.feed_id}")
        return posts

    def mark_unread(self, post_id):
        self.cursor.execute('''UPDATE posts SET read = 0 WHERE id = ? AND feed_id = ?''',
                            (post_id, self.feed_id))
        self.db.commit()
        print(f"Marked post ID: {post_id} as unread")
        return self.cursor.rowcount > 0
