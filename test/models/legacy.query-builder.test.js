'use strict'

// Test helpers
const LegacyBaseModel = require('../../app/models/legacy-base.model.js')

// Thing under test
const LegacyQueryBuilder = require('../../app/models/legacy.query-builder.js')

describe('Legacy Base model', () => {
  describe('when given a model class with only a schema', () => {
    class SchemaLegacyModel extends LegacyBaseModel {
      static get tableName () {
        return 'schemaTable'
      }

      static get schema () {
        return 'water'
      }

      static get QueryBuilder () {
        return LegacyQueryBuilder
      }
    }

    it('adds the schema name to the table in the queries it generates', () => {
      const result = SchemaLegacyModel.query().toKnexQuery().toQuery()

      expect(result).toMatch(/from "water"\."schema_table"$/)
    })
  })

  describe('when given a model class with an alias', () => {
    class AliasLegacyModel extends LegacyBaseModel {
      static get tableName () {
        return 'aliasTable'
      }

      static get schema () {
        return 'water'
      }

      static get alias () {
        return 'chargeReferences'
      }

      static get QueryBuilder () {
        return LegacyQueryBuilder
      }
    }

    it('aliases the table in the queries it generates', () => {
      const result = AliasLegacyModel.query().toKnexQuery().toQuery()

      expect(result).toMatch(/from "water"\."alias_table" as "charge_references"$/)
    })
  })
})
