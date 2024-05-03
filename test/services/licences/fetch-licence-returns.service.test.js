'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseSupport = require('../../support/database.js')
const ReturnLogHelper = require('../../support/helpers/return-log.helper.js')

// Thing under test
const FetchLicenceReturnsService = require('../../../app/services/licences/fetch-licence-returns.service')
const LicenceHelper = require('../../support/helpers/licence.helper')

describe('Fetch licence returns service', () => {
  let returnsLogData
  const licenceId = 'fef693fd-eb6f-478d-9f79-ab24749c5dc6'

  beforeEach(async () => {
    await DatabaseSupport.clean()
  })

  describe('when there is no optional data in the model', () => {
    const returnData = {
      dueDate: new Date('2020-04-01'),
      endDate: new Date('2020-06-01'),
      metadata: '323',
      returnReference: '32',
      startDate: new Date('2020-02-01'),
      status: '32'
    }

    beforeEach(async () => {
      const license = await LicenceHelper.add({
        id: licenceId
      })

      returnData.licenceRef = license.licenceRef
      returnsLogData = await ReturnLogHelper.add(returnData)
    })

    it('returns results', async () => {
      const result = await FetchLicenceReturnsService.go(licenceId, 1)

      expect(result.pagination).to.equal({
        total: 1
      })
      expect(result.returns).to.equal(
        [{
          dueDate: new Date('2020-04-01'),
          endDate: new Date('2020-06-01'),
          id: returnsLogData.id,
          metadata: 323,
          returnReference: '32',
          startDate: new Date('2020-02-01'),
          status: '32'
        }
        ]
      )
    })
  })
})
