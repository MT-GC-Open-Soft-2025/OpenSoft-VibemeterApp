##  1. Clone the Repository
First, **open VS Code**, **open the terminal**  and run:
```bash
git clone https://github.com/MT-GC-Open-Soft-2025/Backend.git
cd Backend

```
Create your own branch and start working on it
```bash
git checkout -b <branch-name>
```

## 2. Set up the virtual environment
```bash
python -m venv venv
venv\Scripts\activate (for windows)
source venv/bin/activate (for linux/mac)
```
   

## 3. Install the required dependencies
```bash
pip install -r requirements.txt
```
In case you install a new package, make sure to update the requirements.txt file by running the following command:
```bash
pip freeze > requirements.txt
```


## 3. Run the FastAPI server
```bash
uvicorn server:app --host 0.0.0.0 --port 8000 --reload
```


## 4. Install and Run Dockerized image
```bash
# Install Docker
# For Windows: https://docs.docker.com/desktop/install/windows-install/
# For Linux: https://docs.docker.com/engine/install/
# For Mac: https://docs.docker.com/desktop/install/mac-install/
# Install Docker Compose
# For Windows: https://docs.docker.com/compose/install/
# For Linux: https://docs.docker.com/compose/install/
# For Mac: https://docs.docker.com/compose/install/
# Build the Docker image
   docker-compose build
   docker-compose up
 ```
 
## 4. Gemini API
[Docs](https://ai.google.dev/gemini-api/docs/text-generation#multi-turn-conversations)