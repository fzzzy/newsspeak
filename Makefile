SHELL := /bin/zsh

all:
	cd src && source ../venv/bin/activate && uvicorn newsspeak:app --reload --host 0.0.0.0

test:
	source venv/bin/activate && python src/test.py

install:
	python3 -m venv venv
	source venv/bin/activate && pip install -r requirements.txt

freeze:
	source venv/bin/activate && pip freeze > requirements.txt
