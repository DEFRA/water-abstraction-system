'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const ReturnLogHelper = require('../../../support/helpers/return-log.helper.js')
const ReturnSubmissionHelper = require('../../../support/helpers/return-submission.helper.js')
const ReturnSubmissionLineHelper = require('../../../support/helpers/return-submission-line.helper.js')
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

        const returnSubmission = await ReturnSubmissionHelper.add({
          returnLogId: returnLog.id,
          metadata: { method: 'abstractionVolumes' }
        })
        await ReturnSubmissionLineHelper.add({ returnSubmissionId: returnSubmission.id })
      })

      it('creates a new session record containing details of the return log', async () => {
        const result = await InitiateSessionService.go(returnLog.id)

        const sessionId = _getSessionId(result)

        const matchingSession = await SessionModel.query().findById(sessionId)

        expect(matchingSession.data).to.equal({
          beenReceived: false,
          dueDate: '2023-04-28T00:00:00.000Z',
          endDate: '2022-06-01T00:00:00.000Z',
          journey: 'enter-return',
          licenceId: licence.id,
          licenceRef: licence.licenceRef,
          lines: [
            {
              startDate: '2021-12-26T00:00:00.000Z',
              endDate: '2022-01-01T00:00:00.000Z',
              quantity: 4380,
              reading: null
            }
          ],
          meter10TimesDisplay: null,
          meterMake: null,
          meterProvided: 'no',
          meterSerialNumber: null,
          nilReturn: false,
          periodStartDay: returnLog.metadata.nald.periodStartDay,
          periodStartMonth: returnLog.metadata.nald.periodStartMonth,
          periodEndDay: returnLog.metadata.nald.periodEndDay,
          periodEndMonth: returnLog.metadata.nald.periodEndMonth,
          purposes: ['Test description'],
          receivedDate: null,
          receivedDateDay: null,
          receivedDateMonth: null,
          receivedDateOptions: 'custom-date',
          receivedDateYear: null,
          reported: 'abstraction-volumes',
          returnLogId: returnLog.id,
          returnReference: returnLog.returnReference,
          returnsFrequency: 'month',
          siteDescription: returnLog.metadata.description,
          startDate: '2022-04-01T00:00:00.000Z',
          status: returnLog.status,
          submissionType: 'edit',
          twoPartTariff: returnLog.metadata.isTwoPartTariff,
          underQuery: returnLog.underQuery,
          units: 'cubic-metres'
        })
      })

      it('sets "beenReceived" to "false"', async () => {
        const result = await InitiateSessionService.go(returnLog.id)

        const sessionId = _getSessionId(result)

        const matchingSession = await SessionModel.query().findById(sessionId)

        expect(matchingSession.data.beenReceived).to.be.false()
      })
    })

    describe('and the return log has been received', () => {
      before(async () => {
        returnLog = await ReturnLogHelper.add({
          licenceRef: licence.licenceRef,
          metadata,
          receivedDate: new Date('2025-03-06')
        })

        await ReturnSubmissionHelper.add({ returnLogId: returnLog.id })
      })

      it('sets "beenReceived" to "true"', async () => {
        const result = await InitiateSessionService.go(returnLog.id)

        const sessionId = _getSessionId(result)

        const matchingSession = await SessionModel.query().findById(sessionId)

        expect(matchingSession.data.beenReceived).to.be.true()
      })

      it('sets the received date fields accordingly', async () => {
        const result = await InitiateSessionService.go(returnLog.id)

        const sessionId = _getSessionId(result)

        const matchingSession = await SessionModel.query().findById(sessionId)

        expect(matchingSession.data.receivedDateOptions).to.equal('custom-date')
        expect(matchingSession.data.receivedDateDay).to.equal('6')
        expect(matchingSession.data.receivedDateMonth).to.equal('3')
        expect(matchingSession.data.receivedDateYear).to.equal('2025')
      })
    })

    describe('and a unit is specified', () => {
      before(async () => {
        returnLog = await ReturnLogHelper.add({
          licenceRef: licence.licenceRef,
          metadata,
          receivedDate: null,
          endDate: new Date('2022-06-01')
        })

        await ReturnSubmissionHelper.add({ returnLogId: returnLog.id, metadata: { units: 'Ml' } })
      })

      it('formats the unit as expected', async () => {
        const result = await InitiateSessionService.go(returnLog.id)

        const sessionId = _getSessionId(result)

        const matchingSession = await SessionModel.query().findById(sessionId)

        expect(matchingSession.data.units).to.equal('megalitres')
      })
    })

    describe('and no unit is specified', () => {
      before(async () => {
        returnLog = await ReturnLogHelper.add({
          licenceRef: licence.licenceRef,
          metadata,
          receivedDate: null,
          endDate: new Date('2022-06-01')
        })

        await ReturnSubmissionHelper.add({ returnLogId: returnLog.id })
      })

      it("defaults the unit to 'cubic-metres'", async () => {
        const result = await InitiateSessionService.go(returnLog.id)

        const sessionId = _getSessionId(result)

        const matchingSession = await SessionModel.query().findById(sessionId)

        expect(matchingSession.data.units).to.equal('cubic-metres')
      })
    })

    describe('and meter details are specified', () => {
      before(async () => {
        returnLog = await ReturnLogHelper.add({
          licenceRef: licence.licenceRef,
          metadata,
          receivedDate: null,
          endDate: new Date('2022-06-01')
        })

        await ReturnSubmissionHelper.add({
          returnLogId: returnLog.id,
          metadata: {
            type: 'measured',
            total: null,
            units: 'm³',
            method: 'oneMeter',
            meters: [
              {
                manufacturer: 'METER_MAKE',
                multiplier: 10,
                serialNumber: 'METER_SERIAL_NUMBER'
              }
            ]
          }
        })
      })

      it('includes the meter details', async () => {
        const result = await InitiateSessionService.go(returnLog.id)

        const sessionId = _getSessionId(result)

        const matchingSession = await SessionModel.query().findById(sessionId)

        expect(matchingSession.data.meter10TimesDisplay).to.equal('yes')
        expect(matchingSession.data.meterMake).to.equal('METER_MAKE')
        expect(matchingSession.data.meterSerialNumber).to.equal('METER_SERIAL_NUMBER')
        expect(matchingSession.data.meterProvided).to.equal('yes')
        expect(matchingSession.reported).to.equal('meter-readings')
      })
    })

    describe('and it is a nil return', () => {
      before(async () => {
        returnLog = await ReturnLogHelper.add({
          licenceRef: licence.licenceRef,
          metadata,
          receivedDate: null,
          endDate: new Date('2022-06-01')
        })

        await ReturnSubmissionHelper.add({ returnLogId: returnLog.id, nilReturn: true })
      })

      it('sets the journey as expected', async () => {
        const result = await InitiateSessionService.go(returnLog.id)

        const sessionId = _getSessionId(result)

        const matchingSession = await SessionModel.query().findById(sessionId)

        expect(matchingSession.data.journey).to.equal('nil-return')
      })
    })
  })
})

// InitiateSessionService returns a string in the format`/system/return-logs/setup/${sessionId}/${redirect}`. We extract
// the session id by splitting by '/' and taking the next-to-last element
function _getSessionId(url) {
  return url.split('/').at(-2)
}
