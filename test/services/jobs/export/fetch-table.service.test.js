'use strict'

// Test framework dependencies
const { describe, it, after } = require('node:test')
const { expect } = require('@hapi/code')

// Test helpers
const { closeConnection } = require('../../../support/database.js')

// Thing under test
const FetchTableService = require('../../../../app/services/jobs/export/fetch-table.service.js')

const regionsColumnInfo = [
  'regionId',
  'chargeRegionId',
  'naldRegionId',
  'name',
  'displayName',
  'isTest',
  'dateCreated',
  'dateUpdated'
]

describe.skip('Fetch table service', () => {
  after(async () => {
    await closeConnection()
  })

  describe('when we connect to the db', () => {
    const tableName = 'regions'
    const schemaName = 'water'

    it('returns the table column names', async () => {
      const result = await FetchTableService.go(tableName, schemaName)

      expect(result.headers).to.equal(regionsColumnInfo)
    })

    it('returns the query to fetch the regions table', async () => {
      const result = await FetchTableService.go(tableName, schemaName)

      expect(result.rows).to.be.an.instanceof(Promise)
    })
  })
})
