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
  let licence
  let metadata

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

  describe('when the return log has been received and submitted', () => {
    let returnLog
    let returnSubmission

    before(async () => {
      returnLog = await ReturnLogHelper.add({
        licenceRef: licence.licenceRef,
        metadata,
        receivedDate: new Date('2025-03-06'),
        endDate: new Date('2022-06-01')
      })

      returnSubmission = await ReturnSubmissionHelper.add({
        returnLogId: returnLog.returnId,
        metadata: { method: 'abstractionVolumes' }
      })
      await ReturnSubmissionLineHelper.add({ returnSubmissionId: returnSubmission.id })
    })

    it('creates a new session record containing details of the return log', async () => {
      const result = await InitiateSessionService.go(returnLog.id)

      const sessionId = _getSessionId(result)

      const matchingSession = await SessionModel.query().findById(sessionId)

      expect(matchingSession.data).to.equal({
        beenReceived: true,
        dueDate: null,
        endDate: '2022-06-01T00:00:00.000Z',
        journey: 'enterReturn',
        licenceId: licence.id,
        licenceRef: licence.licenceRef,
        lines: [
          {
            startDate: '2021-12-26T00:00:00.000Z',
            endDate: '2022-01-01T00:00:00.000Z',
            quantity: 4380,
            quantityCubicMetres: 4380,
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
        receivedDate: '2025-03-06T00:00:00.000Z',
        receivedDateDay: '6',
        receivedDateMonth: '3',
        receivedDateOptions: 'custom-date',
        receivedDateYear: '2025',
        reported: 'abstractionVolumes',
        returnId: returnLog.returnId,
        returnLogId: returnLog.id,
        returnReference: returnLog.returnReference,
        returnsFrequency: 'month',
        siteDescription: returnLog.metadata.description,
        startDate: '2022-04-01T00:00:00.000Z',
        status: returnLog.status,
        submissionType: 'edit',
        twoPartTariff: returnLog.metadata.isTwoPartTariff,
        underQuery: returnLog.underQuery,
        units: 'cubicMetres',
        unitSymbol: 'm³'
      })
    })

    describe('and a zero quantity is specified', () => {
      before(async () => {
        returnLog = await ReturnLogHelper.add({
          licenceRef: licence.licenceRef,
          metadata,
          receivedDate: new Date('2025-03-06'),
          endDate: new Date('2022-06-01')
        })

        returnSubmission = await ReturnSubmissionHelper.add({
          returnLogId: returnLog.returnId,
          metadata: { method: 'abstractionVolumes' }
        })
        await ReturnSubmissionLineHelper.add({ quantity: 0, returnSubmissionId: returnSubmission.id })
      })

      it('returns the quantity as expected', async () => {
        const result = await InitiateSessionService.go(returnLog.id)

        const sessionId = _getSessionId(result)

        const matchingSession = await SessionModel.query().findById(sessionId)

        expect(matchingSession.data.lines[0].quantity).to.equal(0)
      })
    })

    describe('and a unit is specified', () => {
      before(async () => {
        returnLog = await ReturnLogHelper.add({
          licenceRef: licence.licenceRef,
          metadata,
          receivedDate: new Date('2025-03-06'),
          endDate: new Date('2022-06-01')
        })

        await ReturnSubmissionHelper.add({
          returnLogId: returnLog.returnId,
          metadata: { units: 'Ml' }
        })
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
          receivedDate: new Date('2025-03-06'),
          endDate: new Date('2022-06-01')
        })

        returnSubmission = await ReturnSubmissionHelper.add({ returnLogId: returnLog.returnId })
      })

      it('defaults the unit to cubicMetres', async () => {
        const result = await InitiateSessionService.go(returnLog.id)

        const sessionId = _getSessionId(result)

        const matchingSession = await SessionModel.query().findById(sessionId)

        expect(matchingSession.data.units).to.equal('cubicMetres')
      })
    })

    describe('and meter details are specified', () => {
      before(async () => {
        returnLog = await ReturnLogHelper.add({
          licenceRef: licence.licenceRef,
          metadata,
          receivedDate: new Date('2025-03-06'),
          endDate: new Date('2022-06-01')
        })

        await ReturnSubmissionHelper.add({
          returnLogId: returnLog.returnId,
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
        expect(matchingSession.reported).to.equal('meterReadings')
      })
    })

    describe('and it is a nil return', () => {
      before(async () => {
        returnLog = await ReturnLogHelper.add({
          licenceRef: licence.licenceRef,
          metadata,
          receivedDate: new Date('2025-03-06'),
          endDate: new Date('2022-06-01')
        })

        returnSubmission = await ReturnSubmissionHelper.add({
          returnLogId: returnLog.returnId,
          nilReturn: true
        })
      })

      it('sets the journey as expected', async () => {
        const result = await InitiateSessionService.go(returnLog.id)

        const sessionId = _getSessionId(result)

        const matchingSession = await SessionModel.query().findById(sessionId)

        expect(matchingSession.data.journey).to.equal('nilReturn')
      })

      it('populates the lines array with placeholder data', async () => {
        const result = await InitiateSessionService.go(returnLog.id)

        const sessionId = _getSessionId(result)

        const matchingSession = await SessionModel.query().findById(sessionId)

        expect(matchingSession.data.lines).to.equal([
          {
            endDate: '2022-04-30T00:00:00.000Z',
            startDate: '2022-04-01T00:00:00.000Z'
          },
          {
            endDate: '2022-05-31T00:00:00.000Z',
            startDate: '2022-05-01T00:00:00.000Z'
          }
        ])
      })
    })
  })

  describe('when the return log has been received but not submitted', () => {
    let returnLog

    before(async () => {
      returnLog = await ReturnLogHelper.add({
        licenceRef: licence.licenceRef,
        metadata,
        receivedDate: new Date('2025-03-06'),
        endDate: new Date('2022-06-01')
      })
    })

    it('sets beenReceived to true', async () => {
      const result = await InitiateSessionService.go(returnLog.id)

      const sessionId = _getSessionId(result)

      const matchingSession = await SessionModel.query().findById(sessionId)

      expect(matchingSession.data.beenReceived).to.be.true()
    })

    it('populates the lines array with placeholder data', async () => {
      const result = await InitiateSessionService.go(returnLog.id)

      const sessionId = _getSessionId(result)

      const matchingSession = await SessionModel.query().findById(sessionId)

      expect(matchingSession.data.lines).to.equal([
        {
          endDate: '2022-04-30T00:00:00.000Z',
          startDate: '2022-04-01T00:00:00.000Z'
        },
        {
          endDate: '2022-05-31T00:00:00.000Z',
          startDate: '2022-05-01T00:00:00.000Z'
        }
      ])
    })
  })

  describe('when the return log has not been received or submitted', () => {
    let returnLog

    before(async () => {
      returnLog = await ReturnLogHelper.add({
        licenceRef: licence.licenceRef,
        metadata,
        receivedDate: null,
        endDate: new Date('2022-06-01')
      })
    })

    it('sets beenReceived to false', async () => {
      const result = await InitiateSessionService.go(returnLog.id)

      const sessionId = _getSessionId(result)

      const matchingSession = await SessionModel.query().findById(sessionId)

      expect(matchingSession.data.beenReceived).to.be.false()
    })

    it('does not include submission-specific fields', async () => {
      const result = await InitiateSessionService.go(returnLog.id)

      const sessionId = _getSessionId(result)

      const matchingSession = await SessionModel.query().findById(sessionId)

      expect(matchingSession.data).to.not.include([
        'journey',
        'nilReturn',
        'meter10TimesDisplay',
        'meterMake',
        'meterProvided',
        'meterSerialNumber',
        'receivedDateOptions',
        'receivedDateDay',
        'receivedDateMonth',
        'receivedDateYear',
        'reported',
        'startReading',
        'units'
      ])
    })
  })
})

// InitiateSessionService returns a string in the format`/system/return-logs/setup/${sessionId}/${redirect}`. We extract
// the session id by splitting by '/' and taking the next-to-last element
function _getSessionId(url) {
  return url.split('/').at(-2)
}
