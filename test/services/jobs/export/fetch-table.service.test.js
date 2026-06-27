'use strict'

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

describe('Fetch table service', () => {
  describe('when we connect to the db', () => {
    const tableName = 'regions'
    const schemaName = 'water'

    it('returns the table column names', async () => {
      const result = await FetchTableService.go(tableName, schemaName)

      expect(result.headers).toEqual(regionsColumnInfo)
    })

    it('returns the query to fetch the regions table', async () => {
      const result = await FetchTableService.go(tableName, schemaName)

      expect(result.rows).toBeInstanceOf(Promise)
    })
  })
})
