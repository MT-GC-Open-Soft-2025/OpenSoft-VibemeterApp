# Open Soft 2025 Frontend

The website is live at [www.wellbee.live](https://www.wellbee.live) [Currently not active]

### Setup

- Clone the frontend repository `frontend` to your local machine.
- Change your current directory to the cloned repository.
- Run the backend server on your local machine.



### Install Dependencies

Run the following command in your terminal to install the necessary dependencies:

```bash
npm install
```

### Run the Application

To start the application, execute:

```bash
npm start
```

The application will be available at `http://localhost:3000` by default.

## Routes

The application includes several routes, each serving different content:

- `/` - Home Page
- `/user` - User/Employee Page
- `/chat` - Chatbot Page
- `/admin` - Admin/HR Page
- `/feedback` - Chat feedback Page 
- `/surveyform` - Anonymous survey form Page
- `/contact` - Contact us Page
- `/login` - Landing Page


## Features


### Chatbot Integration

  - The chatbot delivers dynamic and context-aware responses, focusing on the key factors that are most significantly impacting the logged in employee's mood.

  - If the user shows disinterest or disengagement with a topic, the chatbot seamlessly transitions to the next relevant factor, ensuring the interaction remains engaging and personalized.

### Chat focus on low vibescore employees

  - Chat bot pop up messages are customized to attract the attention of employees as per their vibescore.

### Analysis of employees through anonymous survey response

  - An anonymous survey form is created in user page which will capture the features that are contributing to the low vibescore of most of the employees.   

  - The aggregated survey results are visualized in the admin dashboard as interactive graphs, enabling quick identification of common stressors or dissatisfaction triggers among employees.
