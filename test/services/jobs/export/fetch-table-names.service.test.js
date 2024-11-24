'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const FetchTableNamesService = require('../../../../app/services/jobs/export/fetch-table-names.service.js')

describe('Fetch table names', () => {
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
