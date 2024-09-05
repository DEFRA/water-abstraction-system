'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const ReturnLogHelper = require('../../support/helpers/return-log.helper.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')

// Thing under test
const FetchLicenceReturnsService = require('../../../app/services/licences/fetch-licence-returns.service.js')

describe('Fetch licence returns service', () => {
  let licenceId

  describe('when the licence has return logs', () => {
    const dueDate = new Date('2020-04-01')
    const endDate = new Date('2020-06-01')
    const startDate = new Date('2020-02-01')
    const latestDueDate = new Date('2020-05-01')
    const firstReturn = {
      id: generateUUID(),
      dueDate,
      endDate,
      metadata: '323',
      returnReference: '32',
      startDate,
      status: '32'
    }

    const latestReturn = {
      ...firstReturn,
      id: generateUUID(),
      returnReference: '123',
      dueDate: latestDueDate
    }

    beforeEach(async () => {
      const license = await LicenceHelper.add()

      licenceId = license.id

      firstReturn.licenceRef = license.licenceRef
      latestReturn.licenceRef = license.licenceRef

      await ReturnLogHelper.add(firstReturn)
      await ReturnLogHelper.add(latestReturn)
    })

    it('returns results', async () => {
      const result = await FetchLicenceReturnsService.go(licenceId, 1)

      expect(result.pagination).to.equal({
        total: 2
      })
      //  This should be ordered by due date
      expect(result.returns).to.equal(
        [
          {
            dueDate: latestDueDate,
            endDate,
            id: latestReturn.id,
            metadata: 323,
            returnReference: '123',
            startDate,
            status: '32'
          },
          {
            dueDate,
            endDate,
            id: firstReturn.id,
            metadata: 323,
            returnReference: '32',
            startDate,
            status: '32'
          }
        ]
      )
    })
  })
})
