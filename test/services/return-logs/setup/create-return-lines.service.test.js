// Test helpers
import { generateUUID, timestampForPostgres } from '../../../../app/lib/general.lib.js'
import ReturnSubmissionLineModel from '../../../../app/models/return-submission-line.model.js'

// Thing under test
import CreateReturnLinesService from '../../../../app/services/return-logs/setup/create-return-lines.service.js'

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
      await CreateReturnLinesService(returnSubmissionId, session, timestamp)

      const result = await ReturnSubmissionLineModel.query().where('returnSubmissionId', returnSubmissionId)

      expect(result[0].createdAt).toEqual(new Date(timestamp))
      expect(result[0].endDate).toEqual(new Date('2024-11-01T00:00:00.000Z'))
      expect(result[0].quantity).toEqual(16)
      expect(result[1].quantity).toEqual(0)
      expect(result[2].quantity).toBeNull()
      expect(result[0].readingType).toEqual('estimated')
      expect(result[0].returnSubmissionId).toEqual(returnSubmissionId)
      expect(result[0].startDate).toEqual(new Date('2024-10-26T00:00:00.000Z'))
      expect(result[0].timePeriod).toEqual('week')
      expect(result[0].userUnit).toEqual('m³')
    })

    describe('when called for a nil return', () => {
      beforeEach(() => {
        session.journey = 'nilReturn'
      })

      it('returns an empty array', async () => {
        const result = await CreateReturnLinesService(returnSubmissionId, session, timestamp)

        expect(result).toEqual([])
      })
    })

    describe('when called with a transaction', () => {
      it('does not persist anything if an error occurs', async () => {
        try {
          await ReturnSubmissionLineModel.transaction(async (trx) => {
            await CreateReturnLinesService(returnSubmissionId, session, timestamp, trx)
            throw new Error()
          })
        } catch (_error) {
          // Ignore the error, we just want to test that nothing was persisted
        }

        const [result] = await ReturnSubmissionLineModel.query().where('returnSubmissionId', returnSubmissionId)

        expect(result).toBeUndefined()
      })
    })
  })
})
