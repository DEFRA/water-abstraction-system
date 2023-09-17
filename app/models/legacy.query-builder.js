'use strict'

/**
 * Wrapper around Objection.js QueryBuilder to add schema and alias support to Legacy Models
 * @module LegacyBaseModel
 */

const { QueryBuilder } = require('objection')

class LegacyQueryBuilder extends QueryBuilder {
  /**
   * Wrapper around Objection.js QueryBuilder to add schema and alias support to Legacy Models
   *
   * @param {Object} modelClass The Objection legacy model to which this QueryBuilder will be applied
   */
  constructor (modelClass) {
    super(modelClass)

    // ALL legacy models must implement a `schema` property. So, we always call this
    this.withSchema(modelClass.schema)

    // Only alias those that need to alias the table name to avoid errors, for example, needing to alias
    // `charge_elements` as 'charge_references' so we can link them to `charge_purposes` but call purposes
    // `ChargeElements`.
    if (modelClass.alias) {
      this.alias(modelClass.alias)
    }
  }
}

module.exports = LegacyQueryBuilder
