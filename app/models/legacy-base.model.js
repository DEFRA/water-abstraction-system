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
      path.join(currentPath, 'water')
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

  static get translations () {
    return []
  }

  $parseDatabaseJson (json) {
    json = super.$parseDatabaseJson(json)

    for (const translation of this.constructor.translations) {
      json[translation.model] = json[translation.database]

      delete json[translation.database]
    }

    return json
  }

  $formatDatabaseJson (json) {
    json = super.$formatDatabaseJson(json)

    for (const translation of this.constructor.translations) {
      json[translation.database] = json[translation.model]

      delete json[translation.model]
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
