'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const ViewReturnLogPresenter = require('../../../app/presenters/return-logs/view-return-log.presenter.js')

// Test helpers
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const ReturnLogHelper = require('../../support/helpers/return-log.helper.js')
const ReturnSubmissionHelper = require('../../support/helpers/return-submission.helper.js')
const ReturnSubmissionLineHelper = require('../../support/helpers/return-submission-line.helper.js')
const ReturnVersionHelper = require('../../support/helpers/return-version.helper.js')

describe('View Return Log presenter', () => {
  let testReturnLog

  const auth = {
    credentials: {
      scope: ['returns']
    }
  }

  beforeEach(async () => {
    testReturnLog = await ReturnLogHelper.add({
      metadata: {
        ...ReturnLogHelper.defaults().metadata,
        purposes: [{ alias: 'PURPOSE_ALIAS' }]
      }
    })

    testReturnLog.siteDescription = testReturnLog.metadata.description
    testReturnLog.periodStartDay = testReturnLog.metadata.nald.periodStartDay
    testReturnLog.periodStartMonth = testReturnLog.metadata.nald.periodStartMonth
    testReturnLog.periodEndDay = testReturnLog.metadata.nald.periodEndDay
    testReturnLog.periodEndMonth = testReturnLog.metadata.nald.periodEndMonth
    testReturnLog.purposes = testReturnLog.metadata.purposes
    testReturnLog.twoPartTariff = testReturnLog.metadata.isTwoPartTariff
    testReturnLog.licence = await LicenceHelper.add()
  })

  describe('the "latest" property', () => {
    it('returns true when this is the latest return log', async () => {
      const result = ViewReturnLogPresenter.go(testReturnLog, auth)

      expect(result.latest).to.equal(true)
    })

    it("returns false when this isn't the latest return log", async () => {
      testReturnLog.versions = [
        await ReturnVersionHelper.add({ licenceId: testReturnLog.licence.id, version: 101 }),
        await ReturnVersionHelper.add({ licenceId: testReturnLog.licence.id, version: 102 })
      ]

      testReturnLog.returnSubmissions = [
        await ReturnSubmissionHelper.add({ returnLogId: testReturnLog.id, version: 1 }),
        await ReturnSubmissionHelper.add({ returnLogId: testReturnLog.id, version: 2 })
      ]

      for (const returnSubmission of testReturnLog.returnSubmissions) {
        returnSubmission.returnSubmissionLines = [
          await ReturnSubmissionLineHelper.add({
            returnSubmissionId: returnSubmission.id,
            startDate: new Date(`2022-01-01`),
            endDate: new Date(`2022-02-07`),
            quantity: 1234
          })
        ]
      }

      const result = ViewReturnLogPresenter.go(testReturnLog, auth)

      expect(result.latest).to.equal(false)
    })
  })
})
