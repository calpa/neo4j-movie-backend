var express = require('express');
var router = express.Router();

require('dotenv').config();
console.log(process.env.neo4j_address);

const neo4j = require('neo4j-driver');

const driver = neo4j.driver(
  process.env.neo4j_address,
  neo4j.auth.basic(process.env.neo4j_username, process.env.neo4j_password),
  {
    /* encrypted: 'ENCRYPTION_OFF' */
  }
);

const session = driver.session({ database: 'neo4j' });

/* GET Movie. */
router.get('/', async (req, res, next) => {
  let filterParams = '';
  let filterParams2 = '';
  let params = {};
  if (req.query) {
    if (req.query.title) {
      filterParams += 'title: $title';
      params.title = req.query.title;
    }

    // For Have a date range slider that will update the list based on movies released between the 2 years selected
    if (req.query.first_year && req.query.last_year) {
      filterParams2 = `(movie.released > ${req.query.first_year} and movie.released < ${req.query.last_year})`;
    }

    // Allow the table to be filtered based on the type of relationship
    // MATCH (m:Movie)-[relatedTo]-(p:Person) where Type(relatedTo) = "PRODUCED" RETURN m
    if (req.query.relationships) {
      if (filterParams2) {
        filterParams2 += ' and ';
      }
      filterParams2 += `(Type(relatedTo) = $relationships)`;
    }

    if (filterParams2 !== '') {
      filterParams2 = 'where ' + filterParams2;
    }
  }
  // Default: Have a movie selector dropdown populated with all movies in the Neo4j instance listed
  let query = `MATCH (movie:Movie {${filterParams}}) ${filterParams2} return movie`;
  console.log(query);
  let result = [];
  try {
    result = await session.run(query, params);
    result = result.records.map((record) => record.get('movie').properties);
  } catch (err) {
    console.error(err);
  }
  res.send(result);
});

router.get('/:movieName/people', async (req, res, next) => {
  // Use the selected movie to find all the people associated with it and how they are connected to the movie in question
  const query =
    'MATCH (people:Person)-[relatedTo]-(m:Movie {title: $title}) RETURN people, Type(relatedTo)';
  const params = {
    title: req.params.movieName,
  };
  let result = [];
  try {
    result = await session.run(query, params);
    result = result.records.map((record) => ({
      ...record.get('people').properties,
      relationships: record.get('Type(relatedTo)'),
    }));
  } catch (err) {
    console.error(err);
  }
  res.send(result);
});

module.exports = router;
