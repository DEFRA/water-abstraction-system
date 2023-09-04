'use strict'

/**
 * Base class for all models based on tables in the legacy schemas
 * @module LegacyBaseModel
 */

const { QueryBuilder } = require('objection')
const path = require('path')

const BaseModel = require('./base.model.js')

class LegacyBaseModel extends BaseModel {
  /**
   * Array of paths to search for models used in relationships
   *
   * > See `modelPaths()` in `BaseModel` for more details on this getter
   *
   * We override the one provided in `BaseModel` to include our legacy folders.
   *
   * @returns {Array} array of paths to search for related models
   */
  static get modelPaths () {
    const currentPath = __dirname
    return [
      currentPath,
      path.join(currentPath, 'returns'),
      path.join(currentPath, 'water'),
      path.join(currentPath, 'crm-v2'),
      path.join(currentPath, 'idm')
    ]
  }

  /**
   * Returns a custom `QueryBuilder` which supports declaring the schema to use when connecting to the DB
   *
   * See `schema()` for further details.
   *
   * @returns {Object} a custom Objection `QueryBuilder`
   */
  static get QueryBuilder () {
    return SchemaQueryBuilder
  }

  /**
   * Name of the database schema a model belongs to
   *
   * All the legacy repos talk to the same PostgreSQL DB server but split their data using
   * {@link https://www.postgresql.org/docs/current/ddl-schemas.html schemas}. Objection.js however assumes you are
   * using the **public** schema which is the default in PostgreSQL if you don't specify one.
   *
   * So, when Objection is working with our legacy models it needs to know what schemas they belong to. There is no
   * out-of-the-box support for specifying this. But the maintainer behind Objection.js suggested this solution in
   * {@link https://github.com/Vincit/objection.js/issues/85#issuecomment-185183032 an issue} (which we've tweaked
   * slightly).
   *
   * You extend Objection's QueryBuilder (see `SchemaQueryBuilder`) and call Knex's `withSchema()` within it (Knex
   * _does_ understand schemas). It expects the Model generating the query to have a custom getter `schema` which
   * returns the schema name. You then override the getter `QueryBuilder` in your model and return your
   * {@link https://vincit.github.io/objection.js/recipes/custom-query-builder.html custom QueryBuilder}. This is then
   * used to build any queries, for example, `MyModel.query.find()` ensuring the schema name is declared and our data
   * layer knows where to find the data.
   *
   * > In this base model model we throw an exception to ensure any child classes override this getter.
   *
   * @returns {string} the schema name, for example, 'water'
   */
  static get schema () {
    throw new Error('defaultSchema() not implemented in child class')
  }

  /**
   * Translations for non-standard column names to our standardised ones
   *
   * The primary example of non-standard column names in the legacy data is timestamps. For example, we have found the
   * column which has the timestamp for when a record is created has been named `date_created`, 'created', 'modified',
   * and 'created_at`.
   *
   * Within our code we want to just be using `createdAt` (which would be `created_at` in the DB), as this is what the
   * field would have been called if Knex had been used to generate the migrations and build the tables.
   *
   * All models that extend `LegacyBaseModel` are expected to implement this getter. It should always return an array.
   * If there are no translations an empty array is valid.
   *
   * @example
   * ```javascript
   * static get translations () {
   *  return [
   *    { database: 'created', model: 'createdAt' },
   *    { database: 'modified', model: 'updatedAt' }
   *  ]
   * }
   * ```
   *
   */
  static get translations () {
    throw new Error('translations() not implemented in child class')
  }

  /**
   * Called when a Model is converted to database format.
   *
   * This is an Objection.js instance method which we are overriding. We use it to convert our standardised property
   * names into the legacy ones, for example `createdAt` to `dateCreated`. Timestamps is a primary example
   * where the legacy tables do not use a consistent naming convention. Various tables use different names for the same
   * thing. But we want few surprises and lots of consistency in our code. So, this allows us to translate the names of
   * properties before Objection.js finalises the database version.
   *
   * Each Model that extends `LegacyBaseModel` is expected to implement `static get translations` which defines the
   * database to model translations needed. Any fields listed in `translations` not found will be ignored.
   *
   * For more details see
   * {@link http://vincit.github.io/objection.js/api/model/instance-methods.html#parsedatabasejson $parseDatabaseJson()}
   * and the
   * {@link https://vincit.github.io/objection.js/api/model/overview.html#model-data-lifecycle Model data lifecycle}
   *
   * -------------------------------------------------------------------------------------------------------------------
   *
   * **WARNING!** This translation method _only_ works for instances. We do not yet have a solution that will also
   * work with static queries. Running the following will cause an exception because `createdAt` (automatically
   * converted to `created_at` in the final query) does not exist in the `water.events` table.
   *
   * ```javascript
   * EventModel.query().where('createdAt', '<', new Date().toISOString())
   * ```
   *
   * Overriding
   * {@link https://vincit.github.io/objection.js/api/model/static-properties.html#static-columnnamemappers columnNameMappers}
   * had the same result as what we're doing. We also looked into
   * {@link https://vincit.github.io/objection.js/api/objection/#knexidentifiermapping knexIdentifierMapping}. This
   * would do the mapping at a lower level, in the same way we've used
   * {@link https://vincit.github.io/objection.js/api/objection/#knexsnakecasemappers knexSnakeCaseMappers} to
   * make changes before Objection.js takes over.
   *
   * The first problem we hit was that you can only use one of these; you can't apply both to the config object based to
   * knex (see `knexfile.application.js` and `db/db.js` for how we currently do it). This is because both methods
   * return an object which defines `wrapIdentifier()` and `postProcessResponse()`. So, whichever is added last
   * overwrites what the previous one set.
   *
   * You can resolve this by importing `objection/lib/utils/identifierMapping.js` directly and doing something like this
   *
   * ```javascript
   * // https://gitter.im/Vincit/objection.js?at=5e25f065a259cb0f060754ee
   * const og = require('objection/lib/utils/identifierMapping');
   * const SNAKE_CASE_OVERRIDES = { col12: 'col_1_2' };
   *
   * function snakeCase(str, { upperCase = false, underscoreBeforeDigits = false } = {}) {
   *   // if this column has a manual override, return the snake-cased column name from the override
   *   if (str.length && str in SNAKE_CASE_OVERRIDES) {
   *     return SNAKE_CASE_OVERRIDES[str];
   *   }
   *
   *   // otherwise simply call the original snakeCase() function
   *   return og.snakeCase(str, { upperCase: upperCase, underscoreBeforeDigits: underscoreBeforeDigits});
   * }
   *
   * function knexSnakeCaseMappers(opt = {}) {
   *   return og.knexIdentifierMappers({
   *     parse: str => og.camelCase(str, opt),
   *     format: str => snakeCase(str, opt), // call overridden snakeCase() function
   *   });
   * }
   * ```
   *
   * But that leads us to the second problem; at this level translations are global. So, any reference to `date_created`
   * would get translated to `created_at`, irrespective of the table referenced. If we only had to worry about database
   * to model it would be okay. The problem is to make queries work we need to be able to translate back from our names
   * to the database version. That is impossible where `created_at` might need to become `date_created`, `created`,
   * or `modified`. With no access to the table name for context we cannot make that decision.
   *
   * This is why we have accepted we can only support translations when dealing with instances of a model for now.
   *
   * @param {Object} json The JSON POJO in internal format
   * @returns {Object} The JSON POJO in database format
   */
  $formatDatabaseJson (json) {
    json = super.$formatDatabaseJson(json)

    for (const translation of this.constructor.translations) {
      if (translation.model in json) {
        json[translation.database] = json[translation.model]

        delete json[translation.model]
      }
    }

    return json
  }

  /**
   * Called when a Model instance is created from a database JSON object. This method converts the JSON object from the
   * database format to the internal format.
   *
   * This is an Objection.js instance method which we are overriding. We use it to convert unconventional database
   * column names into standardised ones, for example `dateCreated` to `createdAt`. Timestamps is a primary example
   * where the legacy tables do not use a consistent naming convention. Various tables use different names for the same
   * thing. But we want few surprises and lots of consistency in our code. So, this allows us to translate the names of
   * columns before Objection.js finalises the model instance.
   *
   * Each Model that extends `LegacyBaseModel` is expected to implement `static get translations` which defines the
   * database to model translations needed. Any fields listed in `translations` not found will be ignored.
   *
   * For more details see
   * {@link http://vincit.github.io/objection.js/api/model/instance-methods.html#parsedatabasejson $parseDatabaseJson()}
   * and the
   * {@link https://vincit.github.io/objection.js/api/model/overview.html#model-data-lifecycle Model data lifecycle}
   *
   * @param {Object} json The JSON POJO in database format
   * @returns {Object} The JSON POJO in internal format
   */
  $parseDatabaseJson (json) {
    json = super.$parseDatabaseJson(json)

    for (const translation of this.constructor.translations) {
      if (translation.database in json) {
        json[translation.model] = json[translation.database]

        delete json[translation.database]
      }
    }

    return json
  }
}

class SchemaQueryBuilder extends QueryBuilder {
  constructor (modelClass) {
    super(modelClass)
    this.withSchema(modelClass.schema)
  }
}

module.exports = LegacyBaseModel
