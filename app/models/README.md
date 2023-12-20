# Models

Our models need a little explaining because unlike other services there is some context new contributors need to be aware of.

## The context

This repo (at time of writing) is overtime replacing features in the legacy code. The legacy service built by the previous team is a series of apps each talking to their own schema. It uses a microservice architecture. If one app needs returns data, for example, it needs to request it from the returns app.

Our new 'system' app ignores the microservice architecture. It queries the database for all the data it needs. But should it wish, for example, to join licence data with returns data it can't because they are in different schemas.

There are also issues in the existing tables. Some common fields are not consistently named across tables. They also didn't follow standard naming conventions, for example, primary keys being named `id`. This makes working with queried data 'messy'.

## The solution

By connecting to the legacy tables via [Updateable views](https://www.postgresql.org/docs/current/sql-createview.html) we have solved these problems.

For each legacy table we create a view in the `public` schema. In the view we can correct field name inconsistencies and patterns we don't wish to use. With them being in one schema we can also join tables that underneath are held in different schemas.

## Views and tables

Where new tables are needed we have created them in the `public` schema as well. So, be aware that models can be based on views or tables.
