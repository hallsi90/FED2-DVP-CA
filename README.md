# Development Platforms Course Assignment - Option 1

## Description

This project is a REST API for a news platform, built with Express, TypeScript, and MySQL.

Users can register, log in, retrieve articles, and publish articles. Article retrieval is public, while publishing requires authentication with a JSON Web Token (JWT).

## Features

- User registration
- Password hashing with bcrypt
- User login with JWT authentication
- Public article retrieval
- Protected article creation
- MySQL database integration
- Parameterized SQL queries
- Input validation
- Consistent JSON error responses
- TypeScript type checking

## Technologies

- Node.js
- Express
- TypeScript
- MySQL
- mysql2
- bcrypt
- JSON Web Token
- dotenv

## Project structure

```text
database/
  news_api.sql
src/
  config/
    database.ts
    env.ts
  controllers/
    article.controller.ts
    auth.controller.ts
  middleware/
    auth.middleware.ts
    error.middleware.ts
  routes/
    article.routes.ts
    auth.routes.ts
  services/
    article.service.ts
    auth.service.ts
  types/
    express.d.ts
  server.ts
```

The project separates responsibilities into routes, controllers, services, middleware, and configuration files.

## Requirements

Before starting the project, install:

- Node.js and npm
- MySQL Community Server

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/hallsi90/FED2-DVP-CA.git
cd FED2-DVP-CA
```

### 2. Install dependencies

```bash
npm install
```

### 3. Import the database

Import the included SQL file using the MySQL command-line client:

```bash
mysql -u root -p < database/news_api.sql
```

Enter the MySQL root password when prompted.

The SQL file creates the `news_api` database and the following tables:

- `users`
- `articles`

### 4. Create the application database user

Connect to MySQL as the root user:

```bash
mysql -u root -p
```

Create a restricted user for the application:

```sql
CREATE USER IF NOT EXISTS 'news_api_app'@'localhost'
IDENTIFIED BY 'choose_a_database_password';

GRANT SELECT, INSERT
ON news_api.*
TO 'news_api_app'@'localhost';

EXIT;
```

Replace `choose_a_database_password` with a password of your choice. The same password must be used as `DB_PASSWORD` in the `.env` file.

The application user only receives the database permissions required by the current API.

### 5. Configure environment variables

Create a local `.env` file from the supplied example:

```bash
cp .env.example .env
```

Configure the values in `.env`:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=news_api_app
DB_PASSWORD=your_database_password
DB_NAME=news_api
JWT_SECRET=your_long_random_secret
```

A secure JWT secret can be generated with:

```bash
openssl rand -hex 32
```

Never commit the `.env` file or real passwords, tokens, and secrets to GitHub.

## Running the project

### Development mode

```bash
npm run dev
```

The server restarts automatically when a source file changes.

### Production build

Compile the TypeScript project:

```bash
npm run build
```

Start the compiled server:

```bash
npm start
```

The API runs at:

```text
http://localhost:3000
```

## Available scripts

| Command             | Description                                           |
| ------------------- | ----------------------------------------------------- |
| `npm run dev`       | Starts the development server with automatic restarts |
| `npm run typecheck` | Checks the TypeScript code without generating files   |
| `npm run build`     | Compiles TypeScript into the `dist` directory         |
| `npm start`         | Starts the compiled application                       |

## API endpoints

| Method | Endpoint         | Authentication | Description                            |
| ------ | ---------------- | -------------- | -------------------------------------- |
| `POST` | `/auth/register` | No             | Registers a new user                   |
| `POST` | `/auth/login`    | No             | Authenticates a user and returns a JWT |
| `GET`  | `/articles`      | No             | Returns all articles                   |
| `POST` | `/articles`      | Bearer token   | Creates a new article                  |

## Register a user

```http
POST /auth/register
Content-Type: application/json
```

Example request body:

```json
{
  "email": "student@example.com",
  "password": "SecurePass123"
}
```

A successful registration returns status `201 Created`.

Registration validation includes:

- A valid email address is required
- Email addresses cannot exceed 255 characters
- Passwords must contain at least 8 characters
- Passwords cannot consist only of whitespace
- Passwords cannot exceed bcrypt's 72-byte limit
- Duplicate email addresses return `409 Conflict`

Passwords are hashed with bcrypt before they are stored. Plain-text passwords are never saved in the database.

## Log in

```http
POST /auth/login
Content-Type: application/json
```

Example request body:

```json
{
  "email": "student@example.com",
  "password": "SecurePass123"
}
```

A successful login returns status `200 OK` and a JWT:

```json
{
  "message": "Login successful",
  "token": "your-json-web-token"
}
```

Invalid credentials return `401 Unauthorized`.

## Retrieve articles

```http
GET /articles
```

This is a public endpoint and does not require authentication.

A successful request returns status `200 OK`:

```json
{
  "articles": []
}
```

## Create an article

```http
POST /articles
Content-Type: application/json
Authorization: Bearer your-json-web-token
```

Example request body:

```json
{
  "title": "My first article",
  "body": "This article was created through my own API.",
  "category": "Technology"
}
```

A successful request returns status `201 Created`.

The authenticated user is taken from the verified JWT. Clients cannot choose another user's ID when publishing an article.

Article validation includes:

- Title, body, and category are required
- Titles cannot exceed 255 characters
- Categories cannot exceed 100 characters

## Error responses

The API returns errors as JSON:

```json
{
  "message": "Description of the error"
}
```

Examples include:

- `400 Bad Request` for invalid request data
- `401 Unauthorized` for missing, invalid, or expired authentication
- `404 Not Found` for unknown routes
- `409 Conflict` for an email address that already exists
- `500 Internal Server Error` for unexpected server errors

## Database

The database contains two related tables.

### Users

The `users` table stores:

- User ID
- Unique email address
- bcrypt password hash
- Creation timestamp

### Articles

The `articles` table stores:

- Article ID
- Title
- Body
- Category
- Author ID
- Creation timestamp

`articles.submitted_by` is a foreign key referencing `users.id`. This creates a one-to-many relationship where one user can publish multiple articles.

## Security

- Passwords are hashed with bcrypt
- Authentication tokens are signed with a secret stored outside the repository
- Protected routes verify JWT Bearer tokens
- SQL queries use placeholders to reduce SQL injection risk
- The database user follows the principle of least privilege
- Environment secrets are excluded through `.gitignore`
- Express does not expose the `X-Powered-By` header

## Testing and quality checks

The API has been tested manually with curl requests covering:

- Successful and unsuccessful user registration
- Duplicate email registration
- Successful and unsuccessful login
- Missing, invalid, and valid JWT authentication
- Public article retrieval
- Protected article creation
- Article input validation
- Authentication input boundaries
- Unknown routes
- Malformed JSON request bodies

The project also passes:

```bash
npm run typecheck
npm run build
git diff --check
```

## Credits

Developed by Ingelinn Hallseth as part of the Development Platforms Course Assignment at Noroff.

## AI usage

OpenAI Codex was used as a support tool for project planning, concept explanations, troubleshooting, code review, manual test planning, and documentation guidance.

All suggestions were reviewed, adapted, implemented, and tested by me. A detailed record of the AI-assisted work is maintained separately for the project submission.

## Contact

**Ingelinn Hallseth**

- Email: [ingelinn@hotmail.com](mailto:ingelinn@hotmail.com)
- GitHub: [github.com/hallsi90](https://github.com/hallsi90)

## Acknowledgements

- Noroff for the assignment brief and course material

## Repository

[GitHub Repository](https://github.com/hallsi90/FED2-DVP-CA)
