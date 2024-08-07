# Seeds

> Seed files allow you to populate your database with test or seed data independent of your migration files.

Because we use [Objection.js](https://vincit.github.io/objection.js/) as our chosen [ORM](https://en.wikipedia.org/wiki/Object%E2%80%93relational_mapping), it depends on [Knex.js](https://knexjs.org/) for actually generating the queries and connecting to the database.

**Knex.js** also handles managing our [migrations](https://knexjs.org/guide/migrations.html). Not only that, it can handle [seeding](https://knexjs.org/guide/migrations.html#seed-files) a database.

We use the seed files to ensure a database has the necessary reference data and records need to allow us to interact with it. Being a legacy service, for the most part of the legacy apps' migrations currently handle seeding a DB with, for example, primary purposes i.e. the reference data.

But having our own version as a seed file has benefits. For example, we can add an additional test region to support our acceptance tests. We also extend the seeding to ensure there are users to allow us to access a freshly installed environment.

The seed files are also referenced by the unit tests. At the start of a test run the test database is automatically cleaned then seeded. This means the tests have access to the same reference data as the real service. It also save some time by ensuring, again, users exist for use within the tests.

## Adding a seed file

Tips and guidance for working with the seed files.

### Seeded as read from the folder

**KNex.js** will seed the files in the alphabetical order it finds them in the folder. There is no config to change this and all files are always processed. This is why we make an exception to our file naming convention and prefix the seed files with a number. Bear this in mind if you are adding something that relies on other reference data, for example, `UserGroups` relies on `Users` and `Groups` so they need to be seeded first.

### Write for production

Though you may be adding a seed file just to ensure some reference data exists for the unit tests, they should always be written with the intent of seeding a new 'production' environment. So any 'test' or non-production entities should have a check against `ServerConfig.environment === 'production` to prevent them being seeded in our `production` environment.

### Repeated use

As mentioned before, unlike migrations where **Knex.js** keeps track of what migrations have been run, _all_ seed files are run every time `nom run seed` is called. Because of this you should write your seed files with the expectation that the reference data you are seeding already exists.
