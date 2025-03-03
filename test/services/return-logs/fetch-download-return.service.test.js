'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const ReturnLogHelper = require('../../support/helpers/return-log.helper.js')
const ReturnSubmissionHelper = require('../../support/helpers/return-submission.helper.js')
const ReturnSubmissionModel = require('../../../app/models/return-submission.model.js')
const ReturnSubmissionLineHelper = require('../../support/helpers/return-submission-line.helper.js')

// Thing under test
const FetchDownloadReturnService = require('../../../app/services/return-logs/fetch-download-return.service.js')

describe('Fetch Download Return Log service', () => {
  let returnLog
  let returnSubmissions = []

  beforeEach(async () => {
    returnLog = await ReturnLogHelper.add()

    // We stub on the model prototype so that any created instances have $applyReadings stubbed. We don't set any return
    // value as we don't need it to actually do anything; we just want to be able to assert that it was called.
    Sinon.stub(ReturnSubmissionModel.prototype, '$applyReadings')
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the return log with submissions exists', () => {
    beforeEach(async () => {
      returnSubmissions = await Promise.all([
        ReturnSubmissionHelper.add({ returnLogId: returnLog.id, version: 1 }),
        ReturnSubmissionHelper.add({ returnLogId: returnLog.id, version: 2 }),
        ReturnSubmissionHelper.add({ returnLogId: returnLog.id, version: 3 })
      ])

      await Promise.all([
        ReturnSubmissionLineHelper.add({
          returnSubmissionId: returnSubmissions[0].id,
          startDate: '2023-03-01',
          quantity: 10
        }),
        ReturnSubmissionLineHelper.add({
          returnSubmissionId: returnSubmissions[0].id,
          startDate: '2023-01-01',
          quantity: 5
        })
      ])
    })

    describe('when a specified version is not selected', () => {
      it('returns the return log with most recent related return submission and return submission lines', async () => {
        // We call the Fetch Download Return Log Service with version 0 (the default), which returns the most recent
        // return submission.
        const results = await FetchDownloadReturnService.go(returnLog.id, 0)

        expect(results).to.equal({
          id: returnLog.id,
          returnReference: returnLog.returnReference,
          startDate: returnLog.startDate,
          endDate: returnLog.endDate,
          returnSubmissions: [
            {
              id: returnSubmissions[2].id,
              metadata: {},
              version: returnSubmissions[2].version,
              returnSubmissionLines: []
            }
          ]
        })
      })
    })

    describe('when a specified version is selected', () => {
      it('returns the return log with the specified related return submission and return submission lines', async () => {
        const results = await FetchDownloadReturnService.go(returnLog.id, 2)

        expect(results).to.equal({
          id: returnLog.id,
          returnReference: returnLog.returnReference,
          startDate: returnLog.startDate,
          endDate: returnLog.endDate,
          returnSubmissions: [
            {
              id: returnSubmissions[1].id,
              metadata: {},
              version: returnSubmissions[1].version,
              returnSubmissionLines: []
            }
          ]
        })
      })
    })

    it('orders submission lines by start date', async () => {
      const result = await FetchDownloadReturnService.go(returnLog.id, 1)
      const lines = result.returnSubmissions[0].returnSubmissionLines

      expect(lines).to.have.length(2)
      expect(lines[0].startDate.toISOString()).to.equal('2023-01-01T00:00:00.000Z')
      expect(lines[1].startDate.toISOString()).to.equal('2023-03-01T00:00:00.000Z')
    })

    it('applies readings to selected submission', async () => {
      const result = await FetchDownloadReturnService.go(returnLog.id, 1)
      const selectedSubmission = result.returnSubmissions[0]

      expect(selectedSubmission.$applyReadings.calledOnce).to.be.true()
    })
  })

  describe('when a return log has no submissions', () => {
    it('returns the return log without submissions', async () => {
      const result = await FetchDownloadReturnService.go(returnLog.id)

      expect(result.returnSubmissions).to.be.undefined()
    })
  })
})
