'use strict'

// Test framework dependencies
const { describe, it, after } = require('node:test')
const { expect } = require('@hapi/code')

// Test helpers
const { closeConnection } = require('../../../support/database.js')

// Thing under test
const FetchTableNamesService = require('../../../../app/services/jobs/export/fetch-table-names.service.js')

describe('Fetch table names', () => {
  after(async () => {
    await closeConnection()
  })

  describe('when given a schema name', () => {
    it('returns a list of the schemas table names', async () => {
      const result = await FetchTableNamesService.go('water')

      expect(result).to.include('billing_charge_categories')
      expect(result).to.include('charge_purposes')
      expect(result).to.include('billing_batches')
    })
  })

  describe('when not given a schema name', () => {
    it('throws an error', async () => {
      const result = await expect(FetchTableNamesService.go()).to.reject()

      expect(result).to.be.an.error()
      expect(result.message).to.equal('Error: Unable to fetch table names')
    })
  })
})
