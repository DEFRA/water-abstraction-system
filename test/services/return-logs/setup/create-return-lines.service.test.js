'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateUUID, timestampForPostgres } = require('../../../../app/lib/general.lib.js')
const ReturnSubmissionLineModel = require('../../../../app/models/return-submission-line.model.js')

// Thing under test
const CreateReturnLinesService = require('../../../../app/services/return-logs/setup/create-return-lines.service.js')

describe('Return Logs Setup - Create New Return Lines service', () => {
  const timestamp = timestampForPostgres()

  let returnSubmissionId
  let session

  describe('when called with valid data', () => {
    beforeEach(() => {
      returnSubmissionId = generateUUID()
      session = {
        lines: [
          {
            startDate: '2024-10-26T00:00:00.000Z',
            endDate: '2024-11-01T00:00:00.000Z',
            reading: 1234,
            quantity: 16
          },
          {
            startDate: '2024-11-02T00:00:00.000Z',
            endDate: '2024-11-08T00:00:00.000Z',
            reading: 2345,
            quantity: 32
          },
          {
            startDate: '2024-11-09T00:00:00.000Z',
            endDate: '2024-11-15T00:00:00.000Z',
            reading: 3456,
            quantity: 64
          }
        ],
        meter10TimesDisplay: 'no',
        meterProvided: 'no',
        returnsFrequency: 'week',
        startReading: null,
        units: 'cubic-metres',
        reported: 'abstraction-volumes'
      }
    })

    it('inserts the lines', async () => {
      await CreateReturnLinesService.go(returnSubmissionId, session, timestamp)

      const [result] = await ReturnSubmissionLineModel.query().where('returnSubmissionId', returnSubmissionId)

      expect(result.createdAt).to.equal(new Date(timestamp))
      expect(result.endDate).to.equal(new Date('2024-11-01T00:00:00.000Z'))
      expect(result.quantity).to.equal(16)
      expect(result.readingType).to.equal('estimated')
      expect(result.returnSubmissionId).to.equal(returnSubmissionId)
      expect(result.startDate).to.equal(new Date('2024-10-26T00:00:00.000Z'))
      expect(result.timePeriod).to.equal('week')
      expect(result.userUnit).to.equal('m³')
    })

    describe('when the unit of measurement is megalitres', () => {
      beforeEach(() => {
        session.units = 'megalitres'
      })

      it('correctly converts quantity', async () => {
        const [result] = await CreateReturnLinesService.go(returnSubmissionId, session, timestamp)

        expect(result.quantity).to.equal(16000)
        expect(result.userUnit).to.equal('Ml')
      })
    })

    describe('when meterProvided is "yes"', () => {
      beforeEach(() => {
        session.meterProvided = 'yes'
      })

      it('sets readingType to "measured"', async () => {
        const [result] = await CreateReturnLinesService.go(returnSubmissionId, session, timestamp)

        expect(result.readingType).to.equal('measured')
      })
    })

    describe('when measured using meter readings', () => {
      beforeEach(() => {
        session.reported = 'meter-readings'
        session.startReading = 1000
      })

      it('recalculates quantities from meter readings', async () => {
        const result = await CreateReturnLinesService.go(returnSubmissionId, session, timestamp)

        const quantities = result.map((line) => {
          return line.quantity
        })

        // First quantity is 1234 - 1000
        // Second quantity is 2345 - 1234
        // Third quantity is 3456 - 2345
        expect(quantities).to.equal([234, 1111, 1111])
      })

      describe('and the meter has a 10x display', () => {
        beforeEach(() => {
          session.meter10TimesDisplay = 'yes'
        })

        it('correctly handles 10x display by multiplying calculated quantities by 10', async () => {
          const result = await CreateReturnLinesService.go(returnSubmissionId, session, timestamp)

          const quantities = result.map((line) => {
            return line.quantity
          })

          expect(quantities).to.equal([2340, 11110, 11110])
        })
      })
    })

    describe('when called for a nil return', () => {
      beforeEach(() => {
        session.journey = 'nilReturn'
      })

      it('returns an empty array', async () => {
        const result = await CreateReturnLinesService.go(returnSubmissionId, session, timestamp)

        expect(result).to.equal([])
      })
    })

    describe('when called with a transaction', () => {
      it('does not persist anything if an error occurs', async () => {
        try {
          await ReturnSubmissionLineModel.transaction(async (trx) => {
            await CreateReturnLinesService.go(returnSubmissionId, session, timestamp, trx)
            throw new Error()
          })
        } catch (_error) {
          // Ignore the error, we just want to test that nothing was persisted
        }

        const [result] = await ReturnSubmissionLineModel.query().where('returnSubmissionId', returnSubmissionId)

        expect(result).to.not.exist()
      })
    })
  })
})
