'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const FetchTableNames = require('../../../app/services/db-export/fetch-table-names.service')

describe('Fetch table names', () => {
  describe('when given a schema name', () => {
    it('returns a list of the schemas table names', async () => {
      const result = await FetchTableNames.go('water')

      expect(result).to.include('billing_charge_categories')
      expect(result).to.include('charge_purposes')
      expect(result).to.include('billing_batches')
    })
  })

  describe('when not given a schema name', () => {
    it('throws an error', async () => {
      const result = await expect(FetchTableNames.go()).to.reject()

      expect(result).to.be.an.error()
      expect(result.message).to.equal('Error: Unable to fetch table names')
    })
  })
})
