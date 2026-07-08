'use strict'

// Thing under test
const FetchTableNamesService = require('../../../../app/services/jobs/export/fetch-table-names.service.js')

describe('Fetch table names', () => {
  describe('when given a schema name', () => {
    it('returns a list of the schemas table names', async () => {
      const result = await FetchTableNamesService('water')

      expect(result).toContain('billing_charge_categories')
      expect(result).toContain('charge_purposes')
      expect(result).toContain('billing_batches')
    })
  })

  describe('when not given a schema name', () => {
    it('throws an error', async () => {
      const result = await FetchTableNamesService().catch((e) => {
        return e
      })

      expect(result).toBeInstanceOf(Error)
      expect(result.message).toEqual('Error: Unable to fetch table names')
    })
  })
})
