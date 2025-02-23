# vrc

## Prerequisites

- [Docker](https://www.docker.com/get-started)
- [Node.js](https://nodejs.org/) (for running the backend locally)
- [npm](https://www.npmjs.com/) (comes with Node.js)

## Running the Application for Local Development

### Running the SQL Database
The SQL database is set up using Docker. The initialization script is located in the `database/database/init` directory.

Navigate to the project root directory

   ```sh
   docker-compose up -d
   ```

### Running the Backend
1. Navigate to the backend directory

    ```sh
    cd backend
    ```

2. Install Dependencies:

    ```sh
    npm install
    ```

3. Start the Express server

    ```sh
    node server.js
    ```

### Running the Frontend

1. Navigate to the frontend directory:

    ```sh
    cd frontend
    ```

2. Install dependencies:

    ```sh
    npm install
    ```

3. Start the frontend server:

    ```sh
    npm run dev
    ```

4. Open the frontend in your browser:

    Open your browser and navigate to `http://localhost:5173` to view the frontend.
