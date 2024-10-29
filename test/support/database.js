'use strict'

/**
 * Use to help with cleaning the database between tests
 *
 * It's good practise to ensure the database is in a 'clean' state between tests to avoid any side effects caused by
 * data from one test being present in another.
 * @module DatabaseSupport
 */

const { db, dbConfig } = require('../../db/db.js')

const ChangeReasonsSeeder = require('../../db/seeds/12-change-reasons.seed.js')
const ChargeCategoriesSeeder = require('../../db/seeds/13-charge-categories.seed.js')
const FinancialAgreementsSeeder = require('../../db/seeds/11-financial-agreements.seed.js')
const GroupRolesSeeder = require('../../db/seeds/08-group-roles.seed.js')
const GroupsSeeder = require('../../db/seeds/06-groups.seed.js')
const LicenceRoleSeeder = require('../../db/seeds/14-licence-roles.seed.js')
const LicenceVersionPurposeConditionTypeSeeder = require('../../db/seeds/05-licence-version-purpose-condition-types.seed.js')
const PrimaryPurposesSeeder = require('../../db/seeds/03-primary-purposes.seed.js')
const PurposesSeeder = require('../../db/seeds/02-purposes.seed.js')
const RegionsSeeder = require('../../db/seeds/01-regions.seed.js')
const ReturnCycleSeeder = require('../../db/seeds/16-return-cycles.seed.js')
const RolesSeeder = require('../../db/seeds/07-roles.seed.js')
const SecondaryPurposesSeeder = require('../../db/seeds/04-secondary-purposes.seed.js')
const SourcesSeeder = require('../../db/seeds/15-sources.js')
const UserGroupsSeeder = require('../../db/seeds/10-user-groups.seed.js')
const UsersSeeder = require('../../db/seeds/09-users.seed.js')

const LEGACY_SCHEMAS = ['crm', 'crm_v2', 'idm', 'permit', 'returns', 'water']

/**
 * Call to clean the database of all data
 *
 * It works by identifying all the tables in each schema which we use.
 *
 * Once it has that info it creates a query that tells PostgreSQL to TRUNCATE all the tables and restart their
 * identity columns. For example, if a table relies on an incrementing ID the query will reset that to 1.
 */
async function clean () {
  const schemas = ['public', ...LEGACY_SCHEMAS]

  for (const schema of schemas) {
    const tables = await _tableNames(schema)

    await db.raw(`TRUNCATE TABLE ${tables.join(',')} RESTART IDENTITY;`)
  }

  // TODO: when all calls to DatabaseSupport.clean() (this function) have been removed from the tests we can drop this
  await _seed()
}

/**
 * Call to wipe the database of all tables, views and legacy schemas
 *
 * In order to test our code we have to recreate the legacy tables in our test DB. It is not uncommon for us to make
 * mistakes when we do because of their complexity. We could then create fix-migrations. But the number of legacy
 * migrations is already high. Adding fix-migrations to the folder will make it even more onerous to maintain.
 *
 * So, as a team we've opted when we spot an issue to go back and fix the original legacy migration file. The downside
 * of this is it will cause the next migration run to error. That was until we added this function to wipe the test DB
 * of all tables, views and schemas. If this gets run before the migrations it will be starting with a clean slate.
 */
async function wipe () {
  // Drop the public views first
  const viewNames = await _viewNames('public')

  for (const viewName of viewNames) {
    await db.raw(`DROP VIEW IF EXISTS ${viewName};`)
  }

  // Then drop the public tables (including the migration management tables)
  const tableNames = await _tableNames('public')

  tableNames.push(..._migrationTables())
  for (const tableName of tableNames) {
    await db.raw(`DROP TABLE IF EXISTS ${tableName};`)
  }

  // Then drop the legacy schemas
  for (const schemaName of LEGACY_SCHEMAS) {
    await db.raw(`DROP SCHEMA IF EXISTS  ${schemaName} CASCADE;`)
  }
}

function _migrationTables () {
  return [dbConfig.migrations.tableName, `${dbConfig.migrations.tableName}_lock`]
}

async function _seed () {
  // NOTE: Order matches the order they are seeded via Knex seeding. Do not alphabetize!
  await RegionsSeeder.seed()
  await PurposesSeeder.seed()
  await PrimaryPurposesSeeder.seed()
  await SecondaryPurposesSeeder.seed()
  await LicenceVersionPurposeConditionTypeSeeder.seed()
  await GroupsSeeder.seed()
  await RolesSeeder.seed()
  await GroupRolesSeeder.seed()
  await UsersSeeder.seed()
  await UserGroupsSeeder.seed()
  await FinancialAgreementsSeeder.seed()
  await ChangeReasonsSeeder.seed()
  await ChargeCategoriesSeeder.seed()
  await LicenceRoleSeeder.seed()
  await SourcesSeeder.seed()
  await ReturnCycleSeeder.seed()
}

async function _tableNames (schema) {
  const result = await db('pg_tables')
    .select('tablename')
    .where('schemaname', schema)
    .whereNotIn('tablename', _migrationTables())

  return result.map((table) => {
    return `"${schema}".${table.tablename}`
  })
}

async function _viewNames (schema) {
  const result = await db('pg_views')
    .select('viewname')
    .where('schemaname', schema)

  return result.map((view) => {
    return `"${schema}".${view.viewname}`
  })
}

/**
 * Close the connection to the database
 *
 */
async function closeConnection () {
  await db.destroy()
}

module.exports = {
  clean,
  closeConnection,
  wipe
}
