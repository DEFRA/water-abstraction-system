'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const ReturnLogHelper = require('../../../support/helpers/return-log.helper.js')
const ReturnSubmissionHelper = require('../../../support/helpers/return-submission.helper.js')
const ReturnSubmissionLineHelper = require('../../../support/helpers/return-submission-line.helper.js')
const SessionModel = require('../../../../app/models/session.model.js')

// Things we need to stub
const FeatureFlagsConfig = require('../../../../config/feature-flags.config.js')

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

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the return log has been received and submitted', () => {
    let returnLog
    let returnSubmission

    before(async () => {
      returnLog = await ReturnLogHelper.add({
        licenceRef: licence.licenceRef,
        metadata,
        receivedDate: new Date('2023-04-12')
      })

      returnSubmission = await ReturnSubmissionHelper.add({
        returnLogId: returnLog.id,
        metadata: { method: 'abstractionVolumes' }
      })

      await ReturnSubmissionLineHelper.add({
        returnSubmissionId: returnSubmission.id,
        timePeriod: 'month',
        startDate: new Date('2022-09-01'),
        endDate: new Date('2022-09-30')
      })
    })

    beforeEach(() => {
      // Enable our new submit/edit journey
      Sinon.stub(FeatureFlagsConfig, 'enableSystemReturnsSubmit').value(true)
    })

    it('creates a new session record containing details of the return log', async () => {
      const result = await InitiateSessionService.go(returnLog.id)

      const sessionId = _getSessionId(result)

      const matchingSession = await SessionModel.query().findById(sessionId)

      expect(matchingSession.data).to.equal({
        beenReceived: true,
        dueDate: '2023-04-28T00:00:00.000Z',
        endDate: '2023-03-31T00:00:00.000Z',
        journey: 'enter-return',
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
          },
          {
            endDate: '2022-06-30T00:00:00.000Z',
            startDate: '2022-06-01T00:00:00.000Z'
          },
          {
            endDate: '2022-07-31T00:00:00.000Z',
            startDate: '2022-07-01T00:00:00.000Z'
          },
          {
            endDate: '2022-08-31T00:00:00.000Z',
            startDate: '2022-08-01T00:00:00.000Z'
          },
          {
            endDate: '2022-09-30T00:00:00.000Z',
            reading: null,
            quantity: 4380,
            startDate: '2022-09-01T00:00:00.000Z'
          },
          {
            endDate: '2022-10-31T00:00:00.000Z',
            startDate: '2022-10-01T00:00:00.000Z'
          },
          {
            endDate: '2022-11-30T00:00:00.000Z',
            startDate: '2022-11-01T00:00:00.000Z'
          },
          {
            endDate: '2022-12-31T00:00:00.000Z',
            startDate: '2022-12-01T00:00:00.000Z'
          },
          {
            endDate: '2023-01-31T00:00:00.000Z',
            startDate: '2023-01-01T00:00:00.000Z'
          },
          {
            endDate: '2023-02-28T00:00:00.000Z',
            startDate: '2023-02-01T00:00:00.000Z'
          },
          {
            endDate: '2023-03-31T00:00:00.000Z',
            startDate: '2023-03-01T00:00:00.000Z'
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
        receivedDate: '2023-04-12T00:00:00.000Z',
        receivedDateDay: '12',
        receivedDateMonth: '4',
        receivedDateOptions: 'custom-date',
        receivedDateYear: '2023',
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

    describe('and a unit is specified', () => {
      before(async () => {
        returnLog = await ReturnLogHelper.add({
          licenceRef: licence.licenceRef,
          metadata,
          receivedDate: new Date('2025-03-06'),
          endDate: new Date('2022-06-01')
        })

        await ReturnSubmissionHelper.add({
          returnLogId: returnLog.id,
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

        returnSubmission = await ReturnSubmissionHelper.add({ returnLogId: returnLog.id })
      })

      it('defaults the unit to cubic-metres', async () => {
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
          receivedDate: new Date('2025-03-06'),
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
          receivedDate: new Date('2025-03-06'),
          endDate: new Date('2022-06-01')
        })

        returnSubmission = await ReturnSubmissionHelper.add({
          returnLogId: returnLog.id,
          nilReturn: true
        })
      })

      it('sets the journey as expected', async () => {
        const result = await InitiateSessionService.go(returnLog.id)

        const sessionId = _getSessionId(result)

        const matchingSession = await SessionModel.query().findById(sessionId)

        expect(matchingSession.data.journey).to.equal('nil-return')
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

    beforeEach(() => {
      // Enable our new submit/edit journey
      Sinon.stub(FeatureFlagsConfig, 'enableSystemReturnsSubmit').value(true)
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
        endDate: new Date('2022-06-01')
      })
    })

    beforeEach(() => {
      // Enable our new submit/edit journey
      Sinon.stub(FeatureFlagsConfig, 'enableSystemReturnsSubmit').value(true)
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

  describe('when the system submit/edit feature is not enabled', () => {
    let returnLog

    beforeEach(() => {
      // Disable our new submit/edit journey
      Sinon.stub(FeatureFlagsConfig, 'enableSystemReturnsSubmit').value(false)

      returnLog = { id: ReturnLogHelper.generateReturnLogId() }
    })

    it('the redirect URL it returns points to the legacy edit page', async () => {
      const result = await InitiateSessionService.go(returnLog.id)

      expect(result).to.equal(`/return/internal?returnId=${returnLog.id}`)
    })
  })
})

// InitiateSessionService returns a string in the format`/system/return-logs/setup/${sessionId}/${redirect}`. We extract
// the session id by splitting by '/' and taking the next-to-last element
function _getSessionId(url) {
  return url.split('/').at(-2)
}
