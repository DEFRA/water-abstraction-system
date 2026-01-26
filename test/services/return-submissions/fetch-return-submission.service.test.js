'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const ReturnLogHelper = require('../../support/helpers/return-log.helper.js')
const ReturnLogModel = require('../../../app/models/return-log.model.js')
const ReturnSubmissionHelper = require('../../support/helpers/return-submission.helper.js')
const ReturnSubmissionModel = require('../../../app/models/return-submission.model.js')
const ReturnSubmissionLineHelper = require('../../support/helpers/return-submission-line.helper.js')
const ReturnSubmissionLineModel = require('../../../app/models/return-submission-line.model.js')

// Thing under test
const FetchReturnSubmissionService = require('../../../app/services/return-submissions/fetch-return-submission.service.js')

describe('Fetch Return Submission service', () => {
  let testReturnSubmission
  let testReturnLog

  beforeEach(async () => {
    testReturnSubmission = await ReturnSubmissionHelper.add({
      metadata: {
        units: 'Ml'
      }
    })
    testReturnLog = await ReturnLogHelper.add({ id: testReturnSubmission.returnLogId })

    await Promise.all([
      ReturnSubmissionLineHelper.add({
        returnSubmissionId: testReturnSubmission.id,
        startDate: '2023-03-01',
        quantity: 10
      }),
      ReturnSubmissionLineHelper.add({
        returnSubmissionId: testReturnSubmission.id,
        startDate: '2023-01-01',
        quantity: 5
      })
    ])
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the service is called', () => {
    it('fetches the return submission', async () => {
      const result = await FetchReturnSubmissionService.go(testReturnSubmission.id)

      expect(result).to.be.an.instanceOf(ReturnSubmissionModel)
      expect(result.id).to.equal(testReturnSubmission.id)
    })

    it('includes the expected metadata', async () => {
      const result = await FetchReturnSubmissionService.go(testReturnSubmission.id)

      expect(result.metadata.units).to.equal('Ml')
    })

    it('includes the return log id, submission version and current version used for the back link', async () => {
      const result = await FetchReturnSubmissionService.go(testReturnSubmission.id)

      expect(result.returnLogId).to.equal(testReturnSubmission.returnLogId)
      expect(result.version).to.equal(testReturnSubmission.version)
      expect(result.current).to.equal(testReturnSubmission.current)
    })

    it('includes the linked return submission lines, ordered by start date', async () => {
      const result = await FetchReturnSubmissionService.go(testReturnSubmission.id)
      const { returnSubmissionLines } = result

      expect(returnSubmissionLines).to.have.length(2)
      expect(returnSubmissionLines[0]).to.be.an.instanceOf(ReturnSubmissionLineModel)
      expect(returnSubmissionLines[1]).to.be.an.instanceOf(ReturnSubmissionLineModel)
      expect(returnSubmissionLines[0].startDate.toISOString()).to.equal('2023-01-01T00:00:00.000Z')
      expect(returnSubmissionLines[1].startDate.toISOString()).to.equal('2023-03-01T00:00:00.000Z')
    })

    it('includes the linked return log with its reference and frequency', async () => {
      const result = await FetchReturnSubmissionService.go(testReturnSubmission.id)
      const { returnLog } = result

      expect(returnLog).to.be.an.instanceOf(ReturnLogModel)
      expect(returnLog.returnReference).to.equal(testReturnLog.returnReference)
      expect(returnLog.returnsFrequency).to.equal(testReturnLog.returnsFrequency)
    })
  })
})
