

##  1. Clone the Repository
First, **open VS Code**, **open the terminal**  and run:
```bash
git clone https://github.com/MT-GC-Open-Soft-2025/Backend.git

```
Create your own branch and start working on it
```bash
git checkout -b <branch-name>
```
## 2. Install the required dependencies
```bash
poetry install
```
Make sure you have poetry installed. If not, you can install it using the following command:
```bash
    curl -sSL https://install.python-poetry.org | python3 -
```
or for windows
```bash
    (Invoke-WebRequest -Uri https://install.python-poetry.org -UseBasicParsing).Content | python -
```

## 3. Run the FastAPI server
```bash
poetry run uvicorn server:app --host 0.0.0.0 --port 8000 --reload
```


