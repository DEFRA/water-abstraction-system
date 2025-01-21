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

const { unitNames } = require('../../../app/lib/static-lookups.lib.js')

describe.only('View Return Log presenter', () => {
  let auth
  let testReturnLog

  beforeEach(async () => {
    auth = {
      credentials: {
        scope: ['returns']
      }
    }

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

  describe('the "abstractionPeriod" property', () => {
    it('returns the correctly-formatted date', () => {
      const result = ViewReturnLogPresenter.go(testReturnLog, auth)

      expect(result.abstractionPeriod).to.equal('1 April to 28 April')
    })
  })

  describe('the "actionButton" property', () => {
    it('returns null if this is a void return', () => {
      testReturnLog.status = 'void'

      const result = ViewReturnLogPresenter.go(testReturnLog, auth)

      expect(result.actionButton).to.equal(null)
    })

    it("returns null if auth credentials don't include returns", () => {
      auth.credentials.scope = ['NOT_RETURNS']

      const result = ViewReturnLogPresenter.go(testReturnLog, auth)

      expect(result.actionButton).to.equal(null)
    })

    it('returns the expected "Edit return" result if the return is completed', () => {
      testReturnLog.status = 'completed'

      const result = ViewReturnLogPresenter.go(testReturnLog, auth)

      expect(result.actionButton).to.equal({
        href: `/return/internal?returnId=${testReturnLog.id}`,
        text: 'Edit return'
      })
    })

    it('returns the expected "Submit return" result if the return is due', () => {
      const result = ViewReturnLogPresenter.go(testReturnLog, auth)

      expect(result.actionButton).to.equal({
        href: `/system/return-logs/setup?returnLogId=${testReturnLog.id}`,
        text: 'Submit return'
      })
    })
  })

  describe('the "backLink" property', () => {
    it('returns the expected "Go back to summary" result when this is the latest return log', () => {
      const result = ViewReturnLogPresenter.go(testReturnLog, auth)

      expect(result.backLink).to.equal({
        href: `/system/licences/${testReturnLog.licence.id}/returns`,
        text: 'Go back to summary'
      })
    })

    it('returns the expected "Go back to the latest version" result when this isn\'t the latest return log', async () => {
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

      expect(result.backLink).to.equal({
        href: `/system/return-logs?id=${testReturnLog.id}`,
        text: 'Go back to the latest version'
      })
    })
  })

  describe('the "displayReadings" property', () => {
    beforeEach(async () => {
      testReturnLog.versions = [await ReturnVersionHelper.add({ licenceId: testReturnLog.licence.id, version: 101 })]

      testReturnLog.returnSubmissions = [
        await ReturnSubmissionHelper.add({ returnLogId: testReturnLog.id, version: 1 })
      ]

      testReturnLog.returnSubmissions[0].returnSubmissionLines = [
        await ReturnSubmissionLineHelper.add({
          returnSubmissionId: testReturnLog.returnSubmissions[0].id,
          startDate: new Date(`2022-01-01`),
          endDate: new Date(`2022-02-07`),
          quantity: 1234
        })
      ]
    })

    it('returns false when the return submission method is abstractionVolumes', async () => {
      testReturnLog.returnSubmissions[0].metadata = {
        method: 'abstractionVolumes'
      }

      const result = ViewReturnLogPresenter.go(testReturnLog, auth)

      expect(result.displayReadings).to.equal(false)
    })

    it("returns true when the return submission method isn't abstractionVolumes", async () => {
      testReturnLog.returnSubmissions[0].metadata = {
        method: 'NOT_ABSTRACTION_VOLUMES'
      }

      const result = ViewReturnLogPresenter.go(testReturnLog, auth)

      expect(result.displayReadings).to.equal(true)
    })
  })

  describe('the "displayTable" property', () => {
    describe('when there are no return submissions', () => {
      it('returns false', () => {
        const result = ViewReturnLogPresenter.go(testReturnLog, auth)

        expect(result.displayTable).to.equal(false)
      })
    })

    describe('when there is a return submission', () => {
      beforeEach(async () => {
        testReturnLog.versions = [await ReturnVersionHelper.add({ licenceId: testReturnLog.licence.id, version: 101 })]

        testReturnLog.returnSubmissions = [
          await ReturnSubmissionHelper.add({ returnLogId: testReturnLog.id, version: 1 })
        ]

        testReturnLog.returnSubmissions[0].returnSubmissionLines = [
          await ReturnSubmissionLineHelper.add({
            returnSubmissionId: testReturnLog.returnSubmissions[0].id,
            startDate: new Date(`2022-01-01`),
            endDate: new Date(`2022-02-07`),
            quantity: 1234
          })
        ]

        describe('which is a nil return', () => {
          it('returns false', () => {
            testReturnLog.returnSubmissions[0].nilReturn = true

            const result = ViewReturnLogPresenter.go(testReturnLog, auth)

            expect(result.displayTable).to.equal(false)
          })
        })

        describe('which is not a nil return', () => {
          it('returns true', () => {
            testReturnLog.returnSubmissions[0].nilReturn = false

            const result = ViewReturnLogPresenter.go(testReturnLog, auth)

            expect(result.displayTable).to.equal(true)
          })
        })
      })
    })
  })

  describe('the "displayTable" property', () => {
    it('returns true when there are is a return submissions', async () => {
      testReturnLog.versions = [await ReturnVersionHelper.add({ licenceId: testReturnLog.licence.id, version: 101 })]

      testReturnLog.returnSubmissions = [
        await ReturnSubmissionHelper.add({ returnLogId: testReturnLog.id, version: 1 })
      ]

      testReturnLog.returnSubmissions[0].returnSubmissionLines = [
        await ReturnSubmissionLineHelper.add({
          returnSubmissionId: testReturnLog.returnSubmissions[0].id,
          startDate: new Date(`2022-01-01`),
          endDate: new Date(`2022-02-07`),
          quantity: 1234
        })
      ]

      const result = ViewReturnLogPresenter.go(testReturnLog, auth)

      expect(result.displayTable).to.equal(true)
    })

    it('returns false when there is no return submissions', () => {
      const result = ViewReturnLogPresenter.go(testReturnLog, auth)

      expect(result.displayTable).to.equal(false)
    })
  })

  describe('the "displayUnits" property', () => {
    beforeEach(async () => {
      testReturnLog.versions = [await ReturnVersionHelper.add({ licenceId: testReturnLog.licence.id, version: 101 })]

      testReturnLog.returnSubmissions = [
        await ReturnSubmissionHelper.add({ returnLogId: testReturnLog.id, version: 1 })
      ]

      testReturnLog.returnSubmissions[0].returnSubmissionLines = [
        await ReturnSubmissionLineHelper.add({
          returnSubmissionId: testReturnLog.returnSubmissions[0].id,
          startDate: new Date(`2022-01-01`),
          endDate: new Date(`2022-02-07`),
          quantity: 1234
        })
      ]
    })

    it('returns true when the unit is not cubic metres', () => {
      testReturnLog.returnSubmissions[0].metadata.units = unitNames.GALLONS

      const result = ViewReturnLogPresenter.go(testReturnLog, auth)

      expect(result.displayUnits).to.equal(true)
    })

    it('returns false when the unit is cubic metres', () => {
      testReturnLog.returnSubmissions[0].metadata.units = unitNames.CUBIC_METRES

      const result = ViewReturnLogPresenter.go(testReturnLog, auth)

      expect(result.displayUnits).to.equal(false)
    })
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
