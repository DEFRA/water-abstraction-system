'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const FetchTableNames = require('../../../app/services/db-export/fetch-table-names.service')

const listOfTableNames = [
  'charge_versions',
  'billing_batches',
  'licences',
  'charge_elements',
  'charge_version_workflows',
  'change_reasons',
  'regions',
  'billing_invoice_licences',
  'billing_transactions',
  'charge_purposes',
  'billing_invoices',
  'events',
  'billing_charge_categories'
]

describe('Fetch table names', () => {
  describe('when given a schema name', () => {
    it('returns a list of the schemas table names', async () => {
      const result = await FetchTableNames.go('water')

      expect(result).to.equal(listOfTableNames)
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
