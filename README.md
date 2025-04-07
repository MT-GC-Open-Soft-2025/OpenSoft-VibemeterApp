## Backend up at https://api.wellbee.live

## Steps to run the project locally


### 1. Clone the Repository
First, **open VS Code**, **open the terminal**  and run:
```bash
git clone https://github.com/MT-GC-Open-Soft-2025/Backend.git
cd Backend

```
Create your own branch and start working on it
```bash
git checkout -b <branch-name>
```

### 2. Set up the virtual environment
```bash
python -m venv venv
venv\Scripts\activate (for windows)
source venv/bin/activate (for linux/mac)
```
   

### 3. Install the required dependencies
```bash
pip install -r requirements.txt
```
In case you install a new package, make sure to update the requirements.txt file by running the following command:
```bash
pip freeze > requirements.txt
```

### 4. Make .env file at root directory
```bash
MONGO_URI=
JWT_SECRET= 
JWT_ALGORITHM= 
TOKEN_EXPIRY_SECONDS= 
DB_NAME= 
GEMINI_KEY= 
```

### 5. Run the FastAPI server in local
```bash
uvicorn server:app --host 0.0.0.0 --port 8000 --reload
```

### 4. Install and Run Dockerized image
```bash
   docker-compose build
   docker-compose up
```
 
## Endpoints
### Authentication API (`/auth`)
- **POST /signin** – Authenticate user and return a JWT token.

### Chat API (`/chat`) - Requires authenticate middleware
- **POST /initiate_chat/{convo_id}** – Start a new chat session with a given conversation ID.
- **POST /send** – Send a message in an active conversation.
- **GET /feedback** – Get feedback questions for the chat.
- **POST /end_chat/{convo_id}/{feedback}** – End the conversation and record overall feedback.
- **POST /add_feedback** – Submit detailed feedback ratings for a conversation.

### User API (`/user`) - Requires authenticate middleware
- **GET /getUserDetails** – Retrieve details of the currently logged-in user.
- **GET /getConvoids** – Fetch all conversation IDs associated with the user.

### Admin API (`/admin`) -  Requires adminauthenticate middleware
- **GET /get_details** – Get a list of all registered employees.
- **GET /get_detail/{employee_id}** – Get detailed info of a specific employee.
- **GET /get_conversations/{employee_id}** – Get all conversations of a specific employee.
- **GET /get_conversation/{employee_id}/{convo_id}** – Get details of a specific conversation.
- **GET /get_conversationFeedback/{emp_id}/{convo_id}** – Get feedback for a specific conversation.
- **GET /get_conversationSummary/{emp_id}/{convo_id}** – Get summary of a specific conversation.
- **GET /get_aggregate_feedback** – Get the average feedback score across conversations.

