// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import ReturnLogModel from 'water-abstraction-engine/models/return-log.model.js'
import SessionModel from 'water-abstraction-engine/models/session.model.js'
import { generateLicenceRef, generateReference, generateUUID } from 'water-abstraction-engine/test/generators.js'

// Things we need to stub
import * as FetchReturnLogDal from '../../../../src/dal/return-logs/setup/fetch-return-log.dal.js'

// Thing under test
import InitiateSessionService from '../../../../src/services/return-logs/setup/initiate-session.service.js'

describe('Return Logs - Setup - Initiate Session service', () => {
  let licence
  let returnLog

  beforeEach(() => {
    licence = { id: generateUUID(), licenceRef: generateLicenceRef() }
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when the return log has been received and submitted', () => {
    beforeEach(() => {
      returnLog = _returnLog(licence, [_returnSubmission({ method: 'abstractionVolumes' }, [_returnSubmissionLine()])])

      vi.spyOn(FetchReturnLogDal, 'default').mockResolvedValue(returnLog)
    })

    it('creates a new session record containing details of the return log', async () => {
      const result = await InitiateSessionService(returnLog.id)

      const sessionId = _getSessionId(result)

      const matchingSession = await SessionModel.query().findById(sessionId)

      expect(matchingSession.data).toEqual({
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
      beforeEach(() => {
        returnLog = _returnLog(licence, [
          _returnSubmission({ method: 'abstractionVolumes' }, [_returnSubmissionLine(0)])
        ])

        vi.spyOn(FetchReturnLogDal, 'default').mockResolvedValue(returnLog)
      })

      it('returns the quantity as expected', async () => {
        const result = await InitiateSessionService(returnLog.id)

        const sessionId = _getSessionId(result)

        const matchingSession = await SessionModel.query().findById(sessionId)

        expect(matchingSession.data.lines[0].quantity).toEqual(0)
      })
    })

    describe('and a unit is specified', () => {
      beforeEach(() => {
        returnLog = _returnLog(licence, [_returnSubmission({ units: 'Ml' })])

        vi.spyOn(FetchReturnLogDal, 'default').mockResolvedValue(returnLog)
      })

      it('formats the unit as expected', async () => {
        const result = await InitiateSessionService(returnLog.id)

        const sessionId = _getSessionId(result)

        const matchingSession = await SessionModel.query().findById(sessionId)

        expect(matchingSession.data.units).toEqual('megalitres')
      })
    })

    describe('and no unit is specified', () => {
      beforeEach(() => {
        returnLog = _returnLog(licence, [_returnSubmission({})])

        vi.spyOn(FetchReturnLogDal, 'default').mockResolvedValue(returnLog)
      })

      it('defaults the unit to cubicMetres', async () => {
        const result = await InitiateSessionService(returnLog.id)

        const sessionId = _getSessionId(result)

        const matchingSession = await SessionModel.query().findById(sessionId)

        expect(matchingSession.data.units).toEqual('cubicMetres')
      })
    })

    describe('and meter details are specified', () => {
      beforeEach(() => {
        returnLog = _returnLog(licence, [
          _returnSubmission({
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
          })
        ])

        vi.spyOn(FetchReturnLogDal, 'default').mockResolvedValue(returnLog)
      })

      it('includes the meter details', async () => {
        const result = await InitiateSessionService(returnLog.id)

        const sessionId = _getSessionId(result)

        const matchingSession = await SessionModel.query().findById(sessionId)

        expect(matchingSession.data.meter10TimesDisplay).toEqual('yes')
        expect(matchingSession.data.meterMake).toEqual('METER_MAKE')
        expect(matchingSession.data.meterSerialNumber).toEqual('METER_SERIAL_NUMBER')
        expect(matchingSession.data.meterProvided).toEqual('yes')
        expect(matchingSession.reported).toEqual('meterReadings')
      })
    })

    describe('and it is a nil return', () => {
      beforeEach(() => {
        returnLog = _returnLog(licence, [_returnSubmission({}, [], true)])

        vi.spyOn(FetchReturnLogDal, 'default').mockResolvedValue(returnLog)
      })

      it('sets the journey as expected', async () => {
        const result = await InitiateSessionService(returnLog.id)

        const sessionId = _getSessionId(result)

        const matchingSession = await SessionModel.query().findById(sessionId)

        expect(matchingSession.data.journey).toEqual('nilReturn')
      })

      it('populates the lines array with placeholder data', async () => {
        const result = await InitiateSessionService(returnLog.id)

        const sessionId = _getSessionId(result)

        const matchingSession = await SessionModel.query().findById(sessionId)

        expect(matchingSession.data.lines).toEqual([
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
          }
        ])
      })
    })
  })

  describe('when the return log has been received but not submitted', () => {
    beforeEach(() => {
      returnLog = _returnLog(licence)

      vi.spyOn(FetchReturnLogDal, 'default').mockResolvedValue(returnLog)
    })

    it('sets beenReceived to true', async () => {
      const result = await InitiateSessionService(returnLog.id)

      const sessionId = _getSessionId(result)

      const matchingSession = await SessionModel.query().findById(sessionId)

      expect(matchingSession.data.beenReceived).toBe(true)
    })

    it('populates the lines array with placeholder data', async () => {
      const result = await InitiateSessionService(returnLog.id)

      const sessionId = _getSessionId(result)

      const matchingSession = await SessionModel.query().findById(sessionId)

      expect(matchingSession.data.lines).toEqual([
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
        }
      ])
    })
  })

  describe('when the return log has not been received or submitted', () => {
    beforeEach(() => {
      returnLog = _returnLog(licence)
      returnLog.receivedDate = null

      vi.spyOn(FetchReturnLogDal, 'default').mockResolvedValue(returnLog)
    })

    it('sets beenReceived to false', async () => {
      const result = await InitiateSessionService(returnLog.id)

      const sessionId = _getSessionId(result)

      const matchingSession = await SessionModel.query().findById(sessionId)

      expect(matchingSession.data.beenReceived).toBe(false)
    })

    it('does not include submission-specific fields', async () => {
      const result = await InitiateSessionService(returnLog.id)

      const sessionId = _getSessionId(result)

      const matchingSession = await SessionModel.query().findById(sessionId)

      expect(matchingSession.data).not.toContain([
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

function _returnLog(licence, returnSubmissions = []) {
  return ReturnLogModel.fromJson({
    id: generateUUID(),
    dueDate: null,
    endDate: new Date('2022-06-01'),
    licence,
    metadata: {
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
    },
    receivedDate: new Date('2025-03-06'),
    returnId: `v1:9:${licence.licenceRef}:10021668:2022-04-01:2022-06-01`,
    returnReference: generateReference(),
    returnsFrequency: 'month',
    returnSubmissions,
    startDate: new Date('2022-04-01'),
    status: 'due',
    underQuery: false
  })
}

function _returnSubmission(metadata, returnSubmissionLines = [], nilReturn = false) {
  return { metadata, nilReturn, returnSubmissionLines }
}

function _returnSubmissionLine(quantity = 4380) {
  return {
    id: generateUUID(),
    startDate: new Date('2021-12-26'),
    endDate: new Date('2022-01-01'),
    quantity,
    userUnit: 'm³'
  }
}
