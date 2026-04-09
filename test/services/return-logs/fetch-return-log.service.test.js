'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, after } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const ReturnLogHelper = require('../../support/helpers/return-log.helper.js')

// Thing under test
const FetchReturnLogService = require('../../../app/services/return-logs/fetch-return-log.service.js')

describe('Return Logs - Fetch Return Log service', () => {
  let licence
  let returnLog

  before(async () => {
    licence = await LicenceHelper.add()
    returnLog = await ReturnLogHelper.add({ licenceRef: licence.licenceRef })
  })

  after(async () => {
    await returnLog.$query().delete()
    await licence.$query().delete()
  })

  describe('when called', () => {
    it('fetches the matching return log with the linked licence', async () => {
      const result = await FetchReturnLogService.go(returnLog.id)

      expect(result).to.equal({
        id: returnLog.id,
        licence: {
          id: licence.id,
          licenceRef: licence.licenceRef
        }
      })
    })
  })
})
