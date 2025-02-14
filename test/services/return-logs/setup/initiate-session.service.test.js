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
    let metadata
    let returnLog

    before(async () => {
      metadata = {
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
    })

    describe('and the return log has NOT been received', () => {
      before(async () => {
        returnLog = await ReturnLogHelper.add({
          licenceRef: licence.licenceRef,
          metadata,
          receivedDate: null,
          endDate: new Date('2022-06-01')
        })
      })

      it('creates a new session record containing details of the return log', async () => {
        const result = await InitiateSessionService.go(returnLog.id)

        const matchingSession = await SessionModel.query().findById(result.id)

        expect(matchingSession.data).to.equal({
          beenReceived: false,
          dueDate: '2023-04-28T00:00:00.000Z',
          endDate: '2022-06-01T00:00:00.000Z',
          licenceId: licence.id,
          licenceRef: licence.licenceRef,
          lines: [
            {
              endDate: '2022-04-30T00:00:00.000Z',
              startDate: '2022-04-01T00:00:00.000Z'
            },
            {
              endDate: '2022-05-31T00:00:00.000Z',
              startDate: '2022-05-01T00:00:00.000Z'
            }
          ],
          periodStartDay: returnLog.metadata.nald.periodStartDay,
          periodStartMonth: returnLog.metadata.nald.periodStartMonth,
          periodEndDay: returnLog.metadata.nald.periodEndDay,
          periodEndMonth: returnLog.metadata.nald.periodEndMonth,
          purposes: ['Test description'],
          receivedDate: returnLog.receivedDate,
          returnLogId: returnLog.id,
          returnReference: returnLog.returnReference,
          returnsFrequency: 'month',
          siteDescription: returnLog.metadata.description,
          startDate: '2022-04-01T00:00:00.000Z',
          status: returnLog.status,
          twoPartTariff: returnLog.metadata.isTwoPartTariff,
          underQuery: returnLog.underQuery
        })
      })

      it('sets "beenReceived" to "false"', async () => {
        const result = await InitiateSessionService.go(returnLog.id)

        const matchingSession = await SessionModel.query().findById(result.id)

        expect(matchingSession.data.beenReceived).to.be.false()
      })
    })

    describe('and the return log has been received', () => {
      before(async () => {
        returnLog = await ReturnLogHelper.add({ licenceRef: licence.licenceRef, metadata, receivedDate: new Date() })
      })

      it('sets "beenReceived" to "true"', async () => {
        const result = await InitiateSessionService.go(returnLog.id)

        const matchingSession = await SessionModel.query().findById(result.id)

        expect(matchingSession.data.beenReceived).to.be.true()
      })
    })
  })
})
