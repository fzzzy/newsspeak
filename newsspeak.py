import asyncio
from concurrent.futures import ThreadPoolExecutor
import json
import uuid

from fastapi import FastAPI, Form
from fastapi.responses import (
    FileResponse,
    HTMLResponse,
    RedirectResponse,
    Response,
    StreamingResponse
)

import anthropic
import newsaccounts


thread_pool = ThreadPoolExecutor()
convs = {}

app = FastAPI()

# Global tools dictionary and list
ALL_TOOLS = {}
ALL_TOOLS_LIST = []

def tool(tool_func, name, desc, params={}):
    """Registers a tool for use with the language model."""
    global ALL_TOOLS
    global ALL_TOOLS_LIST
    schema = {
        k: {"type": t, "description": d}
        for (k, (t, d)) in params.items()
    }
    result = {
        "tool": tool_func,
        "spec": {
            "name": name,
            "description": desc,
            "input_schema": {
                "type": "object",
                "properties": schema,
                "required": list(params.keys())
            }
        }
    }
    ALL_TOOLS[name] = result
    ALL_TOOLS_LIST.append(result['spec'])
    return result


def delete_feed_glue(db, feed_index):
    print(f"delete_feed called with feed_index={feed_index}")
    success = db.delete_feed(feed_index)
    return {"text": f"Feed with ID {feed_index} deleted." if success else f"Feed with ID {feed_index} not found."}


def list_feeds_glue(db):
    print("list_feeds called")
    feeds = db.list_feeds()
    feed_list_text = "\n".join(
        [f"{i}. Name: {feed[1]}, URL: {feed[2]}\n"
         for i, feed in enumerate(feeds)])
    return {"text": f"Subscribed feeds:\n{feed_list_text}" if feeds else "No subscribed feeds."}


def select_feed_glue(db, feed_index):
    print(f"select_feed called with feed_index={feed_index}")
    posts_instance = db.select_feed(feed_index)
    if posts_instance is None:
        return {"text": f"Feed with ID {feed_index} does not exist."}
    return {"text": "Feed selected."}


def list_posts_glue(db):
    print("list_posts called")
    feed = db.select_feed(db.selected_feed)
    posts = feed.list_posts()
    post_list_text = "\n".join([f"{i}. {post[1]}\n" for i, post in enumerate(posts)])
    return {"text": f"Unread posts:\n{post_list_text}" if posts else "No unread posts."}


def read_post_glue(db, post_index):
    print(f"read_post called with post_id={post_index}")
    feed = db.select_feed(db.selected_feed)
    post = feed.read_post(post_index)
    if post:
        return {"text": f"Reading post:\nTitle: {post['title']}\nContent: {post['content']}"}
    return {"text": f"Post with ID {post_index} not found or already read."}


def list_read_glue(db):
    print("list_read called")
    posts = db.list_read()
    post_list_text = "\n".join([f"ID: {post[0]}, Title: {post[1]}" for post in posts])
    return {"text": f"Read posts:\n{post_list_text}" if posts else "No read posts."}


def mark_unread_glue(db, post_index):
    print(f"mark_unread called with post_id={post_index}")
    success = db.mark_unread(post_index)
    return {"text": f"Post with index {post_index} marked as unread." if success else f"Post with index {post_index} not found or already unread."}


def do_not_understand_glue(db, error):
    print(f"do_not_understand called with error={error}")
    return {"text": f"I don't understand. {error}"}


delete_feed = tool(
    delete_feed_glue,
    "delete_feed",
    "Delete a feed by Index. Indexes start at one.",
    {
        "feed_index": ("number", "The index of the feed to delete.")
    }
)

list_feeds = tool(
    list_feeds_glue,
    "list_feeds",
    "List all subscribed feeds."
)

select_feed = tool(
    select_feed_glue,
    "select_feed",
    "Select a feed by index to perform actions on its posts.",
    {
        "feed_index": ("number", "The index of the feed to select.")
    }
)

list_posts = tool(
    list_posts_glue,
    "list_posts",
    "List all unread posts in the selected feed."
)


read_post = tool(
    read_post_glue,
    "read_post",
    "Read a post by index from the selected feed.",
    {
        "post_index": ("number", "The index of the post to read.")
    }
)

list_read = tool(
    list_read_glue,
    "list_read",
    "List all read posts in the selected feed."
)

mark_unread = tool(
    mark_unread_glue,
    "mark_unread",
    "Mark a read post as unread in the selected feed.",
    {
        "post_index": ("number", "The index of the post to mark as unread.")
    }
)

do_not_understand = tool(
    do_not_understand_glue,
    "do_not_understand",
    "Default tool when the user's input is not understood.",
    {
        "error": ("string", "The error message to display to the user.")
    }
)

@app.get("/", response_class=HTMLResponse)
async def root():
    return HTMLResponse(
        content=open("index.html").read(),
        status_code=200
    )

@app.get("/favicon.ico")
async def favicon():
    return FileResponse("favicon.ico")

@app.get("/account.css")
async def serve_css():
    with open("account.css", "r") as file:
        content = file.read()
    return Response(content=content, media_type="text/css")

@app.get("/account.js")
async def serve_js():
    with open("account.js", "r") as file:
        content = file.read()
    return Response(content=content, media_type="application/javascript")

@app.get("/help.js")
async def serve_help():
    with open("help.js", "r") as file:
        content = file.read()
    return Response(content=content, media_type="application/javascript")

@app.post("/account/")
async def create_account(name: str = Form(...)):
    a = newsaccounts.Accounts()
    user_id = str(uuid.uuid4())
    if a.add_account(name, user_id):
        print(f"Account created for: {name} {user_id}")
    return RedirectResponse(url=f"/account/{user_id}/", status_code=303)

@app.get("/account/{account_id}/")
async def render_account(account_id: str):
    a = newsaccounts.Accounts()
    acc = a.get_account(account_id)
    if acc is None:
        return Response(status_code=404)
    return HTMLResponse(
        content=open("account.html").read(),
        status_code=200
    )



@app.get("/account/{account_id}.json")
async def render_accountjson(account_id: str):
    a = newsaccounts.Accounts()
    acc = a.get_account(account_id)
    if acc is None:
        return Response(status_code=404)
    return {
        "feeds": [
            {
                "id": feed[0],
                "name": feed[1],
                "url": feed[2]
            }
            for feed in acc.list_feeds()
        ]
    }

@app.post("/account/{account_id}/feed")
async def create_feed(account_id: str):
    a = newsaccounts.Accounts()
    feeds = a.get_account(account_id)
    if feeds is not None:
        feeds.add_feed
    return RedirectResponse(url=f"/account/{account_id}/", status_code=303)





async def event_generator(db, q, initial=None):
    loop = asyncio.get_running_loop()
    client = anthropic.Anthropic()
    initial_message = "You are a natural language interface interpreter for a news reader app. User input has been translated through speech to text so interpret the request assuming minor transcription errors.\n\nFeeds:\n"
    feeds_list = ""

    feeds = db.list_feeds()
    selected = db.select_feed(1)
    selected_feed = selected.name
    for feed in feeds:
        feeds_list += f"{feed[0]}. {feed[1]}\n"

    initial_message += feeds_list

    initial_message += "\nSelected Feed: {selected_feed}\n\n"

    history = []

    if initial is not None:
        jsondata = json.dumps(initial)
        yield f"data: {jsondata}\n\n"
        yield 'data: {"finish_reason": "stop"}\n\n'

    jsondata = json.dumps({
        "content": {"title": db.name, "text": f"""Welcome, {db.name}.

Please save this URL somewhere safe and use it to access your feeds in the future.

Do not share the URL.

Your Feeds:

{feeds_list}

Selected Feed:

{selected_feed}
"""}})

    yield f"data: {jsondata}\n\n"
    yield 'data: {"finish_reason": "stop"}\n\n'

    while True:
        chat = await q.get()
        print("Received chat:", chat)
        if chat is None:
            print("Exiting event generator.")
            break
        if len(history) and history[-1]['role'] == "user":
            history[-1]['content'].append(
                {"type": "text", "text": chat["content"]})
        else:
            history.append(chat)
        result = await loop.run_in_executor(
            thread_pool,
            lambda: client.messages.create(
                model="claude-3-haiku-20240307",
                max_tokens=1024,
                tools=ALL_TOOLS_LIST,
                tool_choice={"type": "any"},
                system=initial_message,
                messages=history))

        assistant_content = []
        for x in result.content:
            if x.type == "text":
                assistant_content.append({"type": "text", "text": x.text})
                jsondata = json.dumps({"content": {"text": x.text}})
                yield f"data: {jsondata}\n\n"
            elif x.type == "tool_use":
                tool_id = x.id
                tool_name = x.name
                tool_input = x.input
                assistant_content.append({
                    "type": "tool_use",
                    "id": tool_id,
                    "name": tool_name,
                    "input": tool_input,
                })
                tool_output = ALL_TOOLS[tool_name]["tool"](db, **tool_input)
                history.append({
                    "role": "assistant",
                    "content": assistant_content})
                assistant_content = []
                history.append({
                    "role": "user",
                    "content": [
                        {
                            "type": "tool_result",
                            "tool_use_id": tool_id,
                            "content": tool_output.get("text", "")
                        }
                    ]
                })
                print("Tool output:", tool_output)
                jsondata = json.dumps({
                    "content": tool_output
                })
                yield f"data: {jsondata}\n\n"
                yield 'data: {"finish_reason": "stop"}\n\n'
        if len(assistant_content):
            history.append({"role": "assistant", "content": assistant_content})
        print("Updated history:", history)
        yield 'data: {"finish_reason": "stop"}\n\n'


@app.get("/account/{account_id}/conversation")
async def conversation(account_id: str):
    conv_id = str(uuid.uuid4())
    queue = asyncio.Queue()
    a = newsaccounts.Accounts()
    db = a.get_account(account_id)
    convs[conv_id] = queue
    return StreamingResponse(
        event_generator(db, queue, initial={"id": conv_id}),
        media_type="text/event-stream"
    )

@app.post("/chat/{cid}")
async def chat(cid, text: str = Form(...)):
    await convs[cid].put({"role": "user", "content": text})
    return {}
