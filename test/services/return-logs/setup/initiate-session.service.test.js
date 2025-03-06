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

        await ReturnSubmissionHelper.add({ returnLogId: returnLog.id, metadata: { method: 'abstractionVolumes' } })
      })

      it('creates a new session record containing details of the return log', async () => {
        const result = await InitiateSessionService.go(returnLog.id)

        const matchingSession = await SessionModel.query().findById(result.id)

        expect(matchingSession.data).to.equal({
          beenReceived: false,
          dueDate: '2023-04-28T00:00:00.000Z',
          endDate: '2022-06-01T00:00:00.000Z',
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
            }
          ],
          meterMake: null,
          meterProvided: 'no',
          meterSerialNumber: null,
          periodStartDay: returnLog.metadata.nald.periodStartDay,
          periodStartMonth: returnLog.metadata.nald.periodStartMonth,
          periodEndDay: returnLog.metadata.nald.periodEndDay,
          periodEndMonth: returnLog.metadata.nald.periodEndMonth,
          purposes: ['Test description'],
          receivedDate: returnLog.receivedDate,
          reported: 'abstraction-volumes',
          returnLogId: returnLog.id,
          returnReference: returnLog.returnReference,
          returnsFrequency: 'month',
          siteDescription: returnLog.metadata.description,
          startDate: '2022-04-01T00:00:00.000Z',
          status: returnLog.status,
          twoPartTariff: returnLog.metadata.isTwoPartTariff,
          underQuery: returnLog.underQuery,
          units: 'cubic-metres'
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

        await ReturnSubmissionHelper.add({ returnLogId: returnLog.id })
      })

      it('sets "beenReceived" to "true"', async () => {
        const result = await InitiateSessionService.go(returnLog.id)

        const matchingSession = await SessionModel.query().findById(result.id)

        expect(matchingSession.data.beenReceived).to.be.true()
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

        const matchingSession = await SessionModel.query().findById(result.id)

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

        const matchingSession = await SessionModel.query().findById(result.id)

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
                serialNumber: 'METER_SERIAL_NUMBER'
              }
            ]
          }
        })
      })

      it('includes the meter details', async () => {
        const result = await InitiateSessionService.go(returnLog.id)

        const matchingSession = await SessionModel.query().findById(result.id)

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

        const matchingSession = await SessionModel.query().findById(result.id)

        expect(matchingSession.data.journey).to.equal('nil-return')
      })
    })
  })
})
