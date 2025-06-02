'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const LicenceModel = require('../../../app/models/licence.model.js')
const ReturnLogHelper = require('../../support/helpers/return-log.helper.js')
const ReturnLogModel = require('../../../app/models/return-log.model.js')
const ReturnSubmissionHelper = require('../../support/helpers/return-submission.helper.js')
const ReturnSubmissionModel = require('../../../app/models/return-submission.model.js')
const ReturnSubmissionLineHelper = require('../../support/helpers/return-submission-line.helper.js')

// Thing under test
const FetchReturnLogService = require('../../../app/services/return-logs/fetch-return-log.service.js')

describe('Fetch Return Log service', () => {
  let testLicence
  let testReturnLog
  let testSubmissions = []

  beforeEach(async () => {
    testLicence = await LicenceHelper.add()
    testReturnLog = await ReturnLogHelper.add({ licenceRef: testLicence.licenceRef })

    // We stub on the model prototype so that any created instances have $applyReadings stubbed. We don't set any return
    // value as we don't need it to actually do anything; we just want to be able to assert that it was called.
    Sinon.stub(ReturnSubmissionModel.prototype, '$applyReadings')
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when a return log with submissions exists', () => {
    beforeEach(async () => {
      testSubmissions = await Promise.all([
        ReturnSubmissionHelper.add({ returnLogId: testReturnLog.id, version: 1, notes: 'NOTES_V1' }),
        ReturnSubmissionHelper.add({ returnLogId: testReturnLog.id, version: 2, notes: 'NOTES_V2' }),
        ReturnSubmissionHelper.add({ returnLogId: testReturnLog.id, version: 3, notes: 'NOTES_V3' })
      ])

      await Promise.all([
        ReturnSubmissionLineHelper.add({
          returnSubmissionId: testSubmissions[0].id,
          startDate: '2023-03-01',
          quantity: 10
        }),
        ReturnSubmissionLineHelper.add({
          returnSubmissionId: testSubmissions[0].id,
          startDate: '2023-01-01',
          quantity: 5
        })
      ])
    })

    it('fetches the return log with basic metadata fields', async () => {
      const result = await FetchReturnLogService.go(testReturnLog.id)

      expect(result).to.include({
        id: testReturnLog.id,
        returnReference: testReturnLog.returnReference,
        siteDescription: testReturnLog.metadata.description,
        periodStartDay: testReturnLog.metadata.nald.periodStartDay,
        twoPartTariff: testReturnLog.metadata.isTwoPartTariff
      })
      expect(result).to.be.an.instanceOf(ReturnLogModel)
    })

    it('includes the linked licence', async () => {
      const result = await FetchReturnLogService.go(testReturnLog.id)
      const { licence } = result

      expect(licence).to.include({
        id: testLicence.id,
        licenceRef: testLicence.licenceRef
      })
      expect(licence).to.be.an.instanceOf(LicenceModel)
    })

    it('selects the latest version when no version specified', async () => {
      const result = await FetchReturnLogService.go(testReturnLog.id)
      const selectedSubmission = result.returnSubmissions[0]

      expect(selectedSubmission.version).to.equal(3)
      expect(selectedSubmission).to.be.an.instanceOf(ReturnSubmissionModel)
    })

    it('selects the correct version when specified', async () => {
      const result = await FetchReturnLogService.go(testReturnLog.id, 2)
      const selectedSubmission = result.returnSubmissions[0]

      expect(selectedSubmission.version).to.equal(2)
    })

    it('orders submission lines by start date', async () => {
      const result = await FetchReturnLogService.go(testReturnLog.id, 1)
      const lines = result.returnSubmissions[0].returnSubmissionLines

      expect(lines).to.have.length(2)
      expect(lines[0].startDate.toISOString()).to.equal('2023-01-01T00:00:00.000Z')
      expect(lines[1].startDate.toISOString()).to.equal('2023-03-01T00:00:00.000Z')
    })

    it('includes all versions ordered descending', async () => {
      const result = await FetchReturnLogService.go(testReturnLog.id)

      expect(result.versions).to.have.length(3)

      const versions = result.versions.map((v) => {
        return v.version
      })

      expect(versions).to.equal([3, 2, 1])
    })

    it('includes notes for the versions', async () => {
      const result = await FetchReturnLogService.go(testReturnLog.id)

      const notes = result.versions.map((v) => {
        return v.notes
      })

      expect(notes).to.equal(['NOTES_V3', 'NOTES_V2', 'NOTES_V1'])
    })

    it('applies readings to selected submission', async () => {
      const result = await FetchReturnLogService.go(testReturnLog.id)
      const selectedSubmission = result.returnSubmissions[0]

      expect(selectedSubmission.$applyReadings.calledOnce).to.be.true()
    })
  })

  describe('when a return log has no submissions', () => {
    it('returns the return log without submissions', async () => {
      const result = await FetchReturnLogService.go(testReturnLog.id)

      expect(result.returnSubmissions).to.be.undefined()
      expect(result.versions).to.be.empty()
    })
  })
})
