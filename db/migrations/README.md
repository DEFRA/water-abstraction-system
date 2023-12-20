# Migrations

The database migrations are run whenever **water-abstraction-system** is deployed to an AWS environment. They are built using [Knex](https://knexjs.org/guide/migrations.html).

## Legacy VS public

Any migrations in [/db/migrations/legacy](/db/migrations/legacy) are used to support unit testing. These recreate legacy tables in their various legacy schemas.

Migrations in [/db/migrations/public](/db/migrations/public) are run both in `production` and `test` environments against the **public** schema. They create and alter the views and tables we rely on.

## Creating a migration

> We assume you are running the [wal-dev-environment](https://gitlab-dev.aws-int.defra.cloud/water-abstraction/wal-dev-environment)

We use npm scripts in `package.json` to trigger **Knex** to create a 'blank' migration file. We then update the file to implement whatever the change is; create a new table or view, or alter an existing one.

Use the **💻 Open** helper task and then navigate to `/home/repos/water-abstraction-system`. If creating a _legacy migration_ run

```bash
npm run migrate:make:test [migration-file-name]
```

Else run

```bash
npm run migrate:make [migration-file-name]
```

Replace `[migration-file-name]` with a filename that matches the migration you are creating. For example

- `create-return-logs-view`
- `create-review-results`
- `alter-bill-runs-view`
- `alter-review-return-results`

## Applying a migration

After creating the migration and updating it to make the changes you need you can apply it to the environment. If the migration is a `/public` one you'll need to apply it to both the main DB and the test one.

```bash
npm run migrate
npm run migrate:test
```

If the migration is just to recreate a legacy table you only need to apply it to the test DB.

```bash
npm run migrate:test
```

## Rolling back a migration

The most common scenario is having created a new migration and applied it to your local DB, you realise a change is needed or a mistake needs correcting. You can rollback the last migrations applied using

```bash
npm run rollback
```

If the migrations were applied against the test DB you can use

```bash
npm run rollback:test
```

## Rolling back all migrations

Should you ever need to completely reset your migrations you can do so. Use the following to reset the main DB (`public schema` only)

```bash
npm run rollback:all
```

The same goes for the test DB.

```bash
npm run rollback:all:test
```
