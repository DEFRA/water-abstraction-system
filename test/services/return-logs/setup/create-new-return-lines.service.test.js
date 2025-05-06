'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateUUID } = require('../../../../app/lib/general.lib.js')
const ReturnSubmissionLineModel = require('../../../../app/models/return-submission-line.model.js')

// Thing under test
const CreateNewReturnLinesService = require('../../../../app/services/return-logs/setup/create-new-return-lines.service.js')

describe('Return Logs Setup - Create New Return Lines service', () => {
  let lines
  let returnSubmissionId

  describe('when called with valid data', () => {
    beforeEach(() => {
      lines = [
        {
          startDate: '2024-10-26T00:00:00.000Z',
          endDate: '2024-11-01T00:00:00.000Z',
          reading: 1234,
          quantity: 16
        }
      ]

      returnSubmissionId = generateUUID()
    })

    it('inserts the lines', async () => {
      await CreateNewReturnLinesService.go(lines, returnSubmissionId, 'week', 'cubic-metres', 'no')

      const [result] = await ReturnSubmissionLineModel.query().where('returnSubmissionId', returnSubmissionId)

      expect(result.startDate).to.equal(new Date('2024-10-26T00:00:00.000Z'))
      expect(result.endDate).to.equal(new Date('2024-11-01T00:00:00.000Z'))
      expect(result.quantity).to.equal(16)
      expect(result.timePeriod).to.equal('week')
      expect(result.readingType).to.equal('estimated')
      expect(result.userUnit).to.equal('m³')
      expect(result.returnSubmissionId).to.equal(returnSubmissionId)
    })

    it('correctly converts quantity', async () => {
      const [result] = await CreateNewReturnLinesService.go(lines, returnSubmissionId, 'week', 'megalitres', 'no')

      expect(result.quantity).to.equal(16000)
      expect(result.userUnit).to.equal('Ml')
    })

    it('sets readingType to "estimated" when meterProvided is "yes"', async () => {
      const [result] = await CreateNewReturnLinesService.go(lines, returnSubmissionId, 'week', 'megalitres', 'yes')

      expect(result.readingType).to.equal('measured')
    })
  })

  describe('when called with no lines', () => {
    it('returns an empty array', async () => {
      const result = await CreateNewReturnLinesService.go([], returnSubmissionId, 'week', 'cubic-metres', 'no')

      expect(result).to.equal([])
    })
  })
})
