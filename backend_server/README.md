# Backend Server Demo

This is the backend service for the **Backend Server Demo** application.

## Prerequisites

Before you begin, ensure you have installed:

- [`NodeJS`](https://nodejs.org) >= `v22.15.1`
- [`MongoDB`](https://www.mongodb.com) >= `v8.0.8`
- [`Git (CLI Tool)`](https://git-scm.com)

_Optional (for containerized environment):_

- [`Docker`](https://www.docker.com)

## Clone the Repository

First, clone the repository to your local machine and jump to the project's root directory:

```bash
git clone https://github.com/hardikvkathiriya/backend_server_demo.git

cd backend_server_demo/src
```

## Running the Application

To run the application, follow these steps:

From the root directory of the project (_backend_server_demo/src_):

1. Duplicate the `.env.example` with new the name `.env` and change variable value as per your need.

2. Install dependencies:

   ```bash
   npm install
   ```

3. Star the application:

   ```bash
   npm start
   ```

4. The application should now be running and accessible at [`http://localhost:3000`](http://localhost:3000).

## Accessing MongoDB

To access the MongoDB database:

1. **Install a MongoDB Client**:
   - Install a MongoDB client on your laptop. [MongoDB Compass](https://www.mongodb.com/products/compass) is the official GUI for MongoDB and is easy to use.

2. **Connect Using Credentials**:
   - Use the MongoDB credentials specified in the `.env` or `docker-compose.yml` file (under your DB service's environment variables) to connect.
   - The typical connection URI format is: `mongodb://user:pass@localhost:27017/app_main_db`.
   - Replace `user`, `pass`, and `app_main_db` with the respective values you've set in your `.env` or `docker-compose.yml`.

3. **Explore and Manage the Database**:
   - Once connected, you can explore your database, run queries, and manage data using your MongoDB client.

## Troubleshooting

If you encounter issues, try these troubleshooting steps:

1. **Application Fails to Start**:
   - Ensure Docker and Docker Compose are running without errors (If you are using docker).
   - Check the console output for any error messages.

2. **Database Connection Issues**:
   - Confirm that the MongoDB service has enough time to start up before the application tries to connect.
   - Check the MongoDB service logs for any errors.

3. **Docker Compose Issues**:
   - Use `docker-compose logs` to view logs of all services.
   - Ensure the `docker-compose.yml` file is correctly formatted and paths are correctly set.

4. **Port Conflicts**:
   - If you face port conflict errors, ensure no other services are running on the same ports as defined in `docker-compose.yml`.

5. **Environment Variables**:
   - Make sure all necessary environment variables are correctly set in the `.env` file or the `docker-compose.yml` or passed to the `Docker container`.
