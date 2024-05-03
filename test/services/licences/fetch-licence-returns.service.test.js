'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseSupport = require('../../support/database.js')
const FetchLicenceReturnsService = require('../../../app/services/licences/fetch-licence-returns.service')
const ReturnLogHelper = require('../../support/helpers/return-log.helper.js')

// Thing under test
const LicenceHelper = require('../../support/helpers/licence.helper')

describe('Fetch licence returns service', () => {
  const licenceId = 'fef693fd-eb6f-478d-9f79-ab24749c5dc6'

  beforeEach(async () => {
    await DatabaseSupport.clean()
  })

  describe('when the licence has return logs', () => {
    const dueDate = new Date('2020-04-01')
    const endDate = new Date('2020-06-01')
    const startDate = new Date('2020-02-01')
    const latestDueDate = new Date('2020-05-01')
    const firstReturn = {
      id: '5fef371e-d0b5-4fd5-a7ff-a67d04b3f451',
      dueDate,
      endDate,
      metadata: '323',
      returnReference: '32',
      startDate,
      status: '32'
    }

    const latestReturn = {
      ...firstReturn,
      id: 'b80f87a3-a274-4232-b536-750670d79928',
      returnReference: '123',
      dueDate: latestDueDate
    }

    beforeEach(async () => {
      const license = await LicenceHelper.add({
        id: licenceId
      })

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
