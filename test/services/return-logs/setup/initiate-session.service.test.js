'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const ReturnLogHelper = require('../../../support/helpers/return-log.helper.js')
const SessionModel = require('../../../../app/models/session.model.js')

// Thing under test
const InitiateSessionService = require('../../../../app/services/return-logs/setup/initiate-session.service.js')

describe('Return Logs - Setup - Initiate Session service', () => {
  describe('when called', () => {
    let licence
    let returnLog

    before(async () => {
      const metadata = {
        description: 'BOREHOLE AT AVALON',
        isCurrent: true,
        isFinal: false,
        isSummer: false,
        isTwoPartTariff: false,
        isUpload: false,
        nald: {
          regionCode: 9,
          areaCode: 'ARCA',
          formatId: '1234567',
          periodStartDay: 1,
          periodStartMonth: 4,
          periodEndDay: 28,
          periodEndMonth: 4
        },
        points: [],
        purposes: [{ tertiary: { description: 'Test description' } }],
        version: 1
      }

      licence = await LicenceHelper.add()
      returnLog = await ReturnLogHelper.add({ licenceRef: licence.licenceRef, metadata })
    })

    it('creates a new session record containing details of the return log', async () => {
      const result = await InitiateSessionService.go(returnLog.id)

      const matchingSession = await SessionModel.query().findById(result.id)

      expect(matchingSession.data).to.equal({
        returnLogId: returnLog.id,
        licenceId: licence.id,
        licenceRef: licence.licenceRef,
        startDate: '2022-04-01T00:00:00.000Z',
        endDate: '2023-03-31T00:00:00.000Z',
        returnReference: returnLog.returnReference,
        status: returnLog.status,
        underQuery: returnLog.underQuery,
        periodStartDay: returnLog.metadata.nald.periodStartDay,
        periodStartMonth: returnLog.metadata.nald.periodStartMonth,
        periodEndDay: returnLog.metadata.nald.periodEndDay,
        periodEndMonth: returnLog.metadata.nald.periodEndMonth,
        siteDescription: returnLog.metadata.description,
        purposes: 'Test description',
        twoPartTariff: returnLog.metadata.isTwoPartTariff
      })
    })
  })
})
