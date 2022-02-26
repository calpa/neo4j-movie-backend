## Neo4j movie backend

## How to start this project

1. Copy the neo4j configuration in neo4j website
2. Add .env in root directory

```
neo4j_address =
neo4j_username =
neo4j_password =
```

3. Run `npm install` to install the dependencies
4. Run `nodemon` to run the project

## Endpoints

### Example

- Get All movies: `/movie`
- Query Movie by title: `/movie?title=The Matrix Reloaded`
- Query Movie by title, within released year range: `/movie?title=The Matrix&first_year=2000&last_year=2015`

- Get All people involved in the movie: `/movie/The Matrix/people`

## Packages

- Express.js
- dotenv
- neo4j-driver
