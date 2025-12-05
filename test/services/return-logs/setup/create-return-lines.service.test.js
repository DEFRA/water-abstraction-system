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

describe('Return Logs - Setup - Create New Return Lines service', () => {
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
            quantity: 16,
            quantityCubicMetres: 16,
            reading: 1234
          },
          {
            startDate: '2024-11-02T00:00:00.000Z',
            endDate: '2024-11-08T00:00:00.000Z',
            quantity: 0,
            quantityCubicMetres: 0,
            reading: 2345
          },
          {
            startDate: '2024-11-09T00:00:00.000Z',
            endDate: '2024-11-15T00:00:00.000Z'
          }
        ],
        meter10TimesDisplay: 'no',
        meterProvided: 'no',
        reported: 'abstractionVolumes',
        returnsFrequency: 'week',
        startReading: null,
        unitSymbol: 'm³'
      }
    })

    it('inserts the lines', async () => {
      await CreateReturnLinesService.go(returnSubmissionId, session, timestamp)

      const result = await ReturnSubmissionLineModel.query().where('returnSubmissionId', returnSubmissionId)

      expect(result[0].createdAt).to.equal(new Date(timestamp))
      expect(result[0].endDate).to.equal(new Date('2024-11-01T00:00:00.000Z'))
      expect(result[0].quantity).to.equal(16)
      expect(result[1].quantity).to.equal(0)
      expect(result[2].quantity).to.be.null()
      expect(result[0].readingType).to.equal('estimated')
      expect(result[0].returnSubmissionId).to.equal(returnSubmissionId)
      expect(result[0].startDate).to.equal(new Date('2024-10-26T00:00:00.000Z'))
      expect(result[0].timePeriod).to.equal('week')
      expect(result[0].userUnit).to.equal('m³')
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
