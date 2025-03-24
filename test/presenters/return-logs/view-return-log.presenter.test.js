'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')
const Proxyquire = require('proxyquire')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const ViewReturnLogPresenter = require('../../../app/presenters/return-logs/view-return-log.presenter.js')

// Test helpers
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const LicenceModel = require('../../../app/models/licence.model.js')
const ReturnLogHelper = require('../../support/helpers/return-log.helper.js')
const ReturnLogModel = require('../../../app/models/return-log.model.js')
const ReturnSubmissionHelper = require('../../support/helpers/return-submission.helper.js')
const ReturnVersionModel = require('../../../app/models/return-version.model.js')
const ReturnSubmissionLineHelper = require('../../support/helpers/return-submission-line.helper.js')
const ReturnSubmissionModel = require('../../../app/models/return-submission.model.js')
const ReturnVersionHelper = require('../../support/helpers/return-version.helper.js')
const ReturnSubmissionLineModel = require('../../../app/models/return-submission-line.model.js')

const { unitNames } = require('../../../app/lib/static-lookups.lib.js')

describe.only('View Return Log presenter', () => {
  let auth
  let testReturnLog

  beforeEach(() => {
    auth = {
      credentials: {
        scope: ['returns']
      }
    }

    testReturnLog = createInstance(ReturnLogModel, ReturnLogHelper, {
      metadata: {
        ...ReturnLogHelper.defaults().metadata,
        purposes: [{ alias: 'PURPOSE_ALIAS' }]
      }
    })

    // Replicate the metadata copying done by FetchReturnLogService
    testReturnLog.siteDescription = testReturnLog.metadata.description
    testReturnLog.periodStartDay = testReturnLog.metadata.nald.periodStartDay
    testReturnLog.periodStartMonth = testReturnLog.metadata.nald.periodStartMonth
    testReturnLog.periodEndDay = testReturnLog.metadata.nald.periodEndDay
    testReturnLog.periodEndMonth = testReturnLog.metadata.nald.periodEndMonth
    testReturnLog.purposes = testReturnLog.metadata.purposes
    testReturnLog.twoPartTariff = testReturnLog.metadata.isTwoPartTariff
    testReturnLog.licence = createInstance(LicenceModel, LicenceHelper)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('the "abstractionPeriod" property', () => {
    it('returns the correctly-formatted date', () => {
      const result = ViewReturnLogPresenter.go(testReturnLog, auth)

      expect(result.abstractionPeriod).to.equal('1 April to 28 April')
    })
  })

  describe('the "actionButton" property', () => {
    describe('when this is a void return', () => {
      beforeEach(() => {
        testReturnLog.status = 'void'
      })

      it('returns null', () => {
        const result = ViewReturnLogPresenter.go(testReturnLog, auth)

        expect(result.actionButton).to.be.null()
      })
    })

    describe('when auth credentials do not include returns', () => {
      beforeEach(() => {
        auth.credentials.scope = ['NOT_RETURNS']
      })

      it('returns null', () => {
        const result = ViewReturnLogPresenter.go(testReturnLog, auth)

        expect(result.actionButton).to.be.null()
      })
    })

    describe('when the return is completed', () => {
      beforeEach(() => {
        testReturnLog.status = 'completed'
      })

      it('returns the expected "Edit return" result', () => {
        const result = ViewReturnLogPresenter.go(testReturnLog, auth)

        expect(result.actionButton).to.equal({
          href: `/return/internal?returnId=${testReturnLog.id}`,
          text: 'Edit return'
        })
      })
    })

    describe('when the return is due', () => {
      beforeEach(() => {
        // Not strictly needed as 'due' is the default status but we include it here for clarity
        testReturnLog.status = 'due'
      })

      it('returns the expected "Submit return" result', () => {
        const result = ViewReturnLogPresenter.go(testReturnLog, auth)

        expect(result.actionButton).to.equal({
          href: `/system/return-logs/setup?returnLogId=${testReturnLog.id}`,
          text: 'Submit return'
        })
      })
    })
  })

  describe('the "backLink" property', () => {
    describe('when this is the latest return log', () => {
      it('returns the expected "Go back to summary" result', () => {
        const result = ViewReturnLogPresenter.go(testReturnLog, auth)

        expect(result.backLink).to.equal({
          href: `/system/licences/${testReturnLog.licence.id}/returns`,
          text: 'Go back to summary'
        })
      })
    })

    describe("when this isn't the latest return log", () => {
      beforeEach(() => {
        testReturnLog.versions = [
          createInstance(ReturnVersionModel, ReturnVersionHelper, { licenceId: testReturnLog.licence.id }),
          createInstance(ReturnVersionModel, ReturnVersionHelper, { licenceId: testReturnLog.licence.id, version: 101 })
        ]

        testReturnLog.returnSubmissions = [
          createInstance(ReturnSubmissionModel, ReturnSubmissionHelper, { returnLogId: testReturnLog.id })
        ]

        for (const returnSubmission of testReturnLog.returnSubmissions) {
          returnSubmission.returnSubmissionLines = [
            createInstance(ReturnSubmissionLineModel, ReturnSubmissionLineHelper, {
              returnSubmissionId: returnSubmission.id
            })
          ]
        }
      })

      it('returns the expected "Go back to the latest version" result', () => {
        const result = ViewReturnLogPresenter.go(testReturnLog, auth)

        expect(result.backLink).to.equal({
          href: `/system/return-logs?id=${testReturnLog.id}`,
          text: 'Go back to the latest version'
        })
      })
    })
  })

  describe('the "displayReadings" property', () => {
    beforeEach(() => {
      setupSubmission(testReturnLog)
    })

    describe('when the return submission method is abstractionVolumes', () => {
      beforeEach(() => {
        Sinon.stub(testReturnLog.returnSubmissions[0], '$method').returns('abstractionVolumes')
      })

      it('returns false', () => {
        const result = ViewReturnLogPresenter.go(testReturnLog, auth)

        expect(result.displayReadings).to.equal(false)
      })
    })

    describe("when the return submission method isn't abstractionVolumes", () => {
      beforeEach(() => {
        Sinon.stub(testReturnLog.returnSubmissions[0], '$method').returns('NOT_ABSTRACTION_VOLUMES')
      })

      it('returns true', () => {
        const result = ViewReturnLogPresenter.go(testReturnLog, auth)

        expect(result.displayReadings).to.equal(true)
      })
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
      beforeEach(() => {
        setupSubmission(testReturnLog)
      })

      describe('which is a nil return', () => {
        beforeEach(() => {
          testReturnLog.returnSubmissions[0].nilReturn = true
        })

        it('returns false', () => {
          const result = ViewReturnLogPresenter.go(testReturnLog, auth)

          expect(result.displayTable).to.equal(false)
        })
      })

      describe('which is not a nil return', () => {
        it('returns true', () => {
          const result = ViewReturnLogPresenter.go(testReturnLog, auth)

          expect(result.displayTable).to.equal(true)
        })
      })
    })
  })

  describe('the "displayTable" property', () => {
    describe('when there is a return submission', () => {
      beforeEach(() => {
        setupSubmission(testReturnLog)
      })

      it('returns true ', () => {
        const result = ViewReturnLogPresenter.go(testReturnLog, auth)

        expect(result.displayTable).to.equal(true)
      })
    })

    describe('when there is no return submission', () => {
      it('returns false when there is no return submissions', () => {
        const result = ViewReturnLogPresenter.go(testReturnLog, auth)

        expect(result.displayTable).to.equal(false)
      })
    })
  })

  describe('the "displayUnits" property', () => {
    beforeEach(() => {
      setupSubmission(testReturnLog)
    })

    describe('when the unit is not cubic metres', () => {
      beforeEach(() => {
        Sinon.stub(testReturnLog.returnSubmissions[0], '$units').returns(unitNames.GALLONS)
      })

      it('returns true', () => {
        const result = ViewReturnLogPresenter.go(testReturnLog, auth)

        expect(result.displayUnits).to.equal(true)
      })
    })

    describe('when the unit is cubic metres', () => {
      beforeEach(() => {
        Sinon.stub(testReturnLog.returnSubmissions[0], '$units').returns(unitNames.CUBIC_METRES)
      })

      it('returns false', () => {
        const result = ViewReturnLogPresenter.go(testReturnLog, auth)

        expect(result.displayUnits).to.equal(false)
      })
    })
  })

  describe('the "latest" property', () => {
    describe('when this is the latest return log', () => {
      it('returns true', () => {
        const result = ViewReturnLogPresenter.go(testReturnLog, auth)

        expect(result.latest).to.equal(true)
      })
    })

    describe('when this is not the latest return log', () => {
      beforeEach(() => {
        testReturnLog.versions = [
          createInstance(ReturnVersionModel, ReturnVersionHelper, { licenceId: testReturnLog.licence.id }),
          createInstance(ReturnVersionModel, ReturnVersionHelper, { licenceId: testReturnLog.licence.id, version: 102 })
        ]

        testReturnLog.returnSubmissions = [
          createInstance(ReturnSubmissionModel, ReturnSubmissionHelper, { returnLogId: testReturnLog.id }),
          createInstance(ReturnSubmissionModel, ReturnSubmissionHelper, { returnLogId: testReturnLog.id, version: 2 })
        ]

        for (const returnSubmission of testReturnLog.returnSubmissions) {
          returnSubmission.returnSubmissionLines = [
            createInstance(ReturnSubmissionLineModel, ReturnSubmissionLineHelper, {
              returnSubmissionId: returnSubmission.id
            })
          ]
        }
      })

      it('returns false', () => {
        const result = ViewReturnLogPresenter.go(testReturnLog, auth)

        expect(result.latest).to.equal(false)
      })
    })
  })

  describe('the "licenceref" property', () => {
    it('returns the licence reference', () => {
      const result = ViewReturnLogPresenter.go(testReturnLog, auth)

      expect(result.licenceref).to.equal(testReturnLog.licence.reference)
    })
  })

  describe('the "meterDetails" property', () => {
    beforeEach(() => {
      setupSubmission(testReturnLog)

      Sinon.stub(testReturnLog.returnSubmissions[0], '$meter').returns({
        manufacturer: 'MANUFACTURER',
        multipler: 10,
        serialNumber: 'SERIAL_NUMBER'
      })
    })

    it('returns the formatted meter details', () => {
      const result = ViewReturnLogPresenter.go(testReturnLog, auth)

      expect(result.meterDetails).to.equal({
        make: 'MANUFACTURER',
        serialNumber: 'SERIAL_NUMBER',
        xDisplay: 'Yes'
      })
    })
  })

  describe('the "method" property', () => {
    beforeEach(() => {
      setupSubmission(testReturnLog)

      Sinon.stub(testReturnLog.returnSubmissions[0], '$method').returns('METHOD')
    })

    it('returns the submission method', () => {
      const result = ViewReturnLogPresenter.go(testReturnLog, auth)

      expect(result.method).to.equal('METHOD')
    })
  })

  describe('the "nilReturn" property', () => {
    describe('when there is a submission', () => {
      describe('which is a nil return', () => {
        beforeEach(() => {
          setupSubmission(testReturnLog, true)
        })

        it('returns true', () => {
          const result = ViewReturnLogPresenter.go(testReturnLog, auth)

          expect(result.nilReturn).to.equal(true)
        })
      })

      describe('which is not a nil return', () => {
        beforeEach(() => {
          setupSubmission(testReturnLog)
        })

        it('returns false', () => {
          const result = ViewReturnLogPresenter.go(testReturnLog, auth)

          expect(result.nilReturn).to.equal(false)
        })
      })
    })

    describe('when there is no submission', () => {
      it('returns false', () => {
        const result = ViewReturnLogPresenter.go(testReturnLog, auth)

        expect(result.nilReturn).to.equal(false)
      })
    })
  })

  describe('the "purpose" property', () => {
    describe('when the first purpose has an alias', () => {
      it('returns the alias', () => {
        const result = ViewReturnLogPresenter.go(testReturnLog, auth)

        expect(result.purpose).to.equal('PURPOSE_ALIAS')
      })
    })

    describe('when the first purpose has no alias', () => {
      beforeEach(() => {
        testReturnLog.purposes.unshift({ tertiary: { description: 'TERTIARY_DESCRIPTION' } })
      })

      it('returns the tertiary description', () => {
        const result = ViewReturnLogPresenter.go(testReturnLog, auth)

        expect(result.purpose).to.equal('TERTIARY_DESCRIPTION')
      })
    })
  })

  describe('the "receivedDate" property', () => {
    describe('when no received date is present', () => {
      it('returns null ', () => {
        const result = ViewReturnLogPresenter.go(testReturnLog, auth)

        expect(result.receivedDate).to.be.null()
      })
    })

    describe('when a received date is present', () => {
      beforeEach(() => {
        testReturnLog.receivedDate = new Date(`2022-01-01`)
      })

      it('returns the formatted date', () => {
        const result = ViewReturnLogPresenter.go(testReturnLog, auth)

        expect(result.receivedDate).to.equal('1 January 2022')
      })
    })
  })

  describe('the "returnPeriod" property', () => {
    it('returns the formatted return period', () => {
      const result = ViewReturnLogPresenter.go(testReturnLog, auth)

      expect(result.returnPeriod).to.equal('1 April 2022 to 31 March 2023')
    })
  })

  describe('the "startReading" property', () => {
    describe('when there is a submission', () => {
      beforeEach(() => {
        setupSubmission(testReturnLog)

        Sinon.stub(testReturnLog.returnSubmissions[0], '$meter').returns({
          manufacturer: 'MANUFACTURER',
          multipler: 10,
          serialNumber: 'SERIAL_NUMBER',
          startReading: 1234
        })
      })

      it('returns the start reading', () => {
        const result = ViewReturnLogPresenter.go(testReturnLog, auth)

        expect(result.startReading).to.equal(1234)
      })
    })

    describe('when there is no submission', () => {
      it('returns null', () => {
        const result = ViewReturnLogPresenter.go(testReturnLog, auth)

        expect(result.startReading).to.be.null()
      })
    })
  })

  describe('the "summaryTableData" property', () => {
    describe('when there is no submission', () => {
      it('returns null', () => {
        const result = ViewReturnLogPresenter.go(testReturnLog, auth)

        expect(result.summaryTableData).to.be.null()
      })
    })

    describe('when there is a submission', () => {
      let StubbedViewReturnLogPresenter

      beforeEach(() => {
        // We have to use Proxyquire to stub BaseReturnLogsPresenter as Sinon cannot stub dependencies that are imported
        // via destructuring
        StubbedViewReturnLogPresenter = Proxyquire('../../../app/presenters/return-logs/view-return-log.presenter.js', {
          './base-return-logs.presenter.js': {
            generateSummaryTableHeaders: Sinon.stub().returns('GENERATED_HEADERS'),
            generateSummaryTableRows: Sinon.stub().returns('GENERATED_ROWS')
          }
        })

        setupSubmission(testReturnLog)
      })

      it('returns generated headers and rows', () => {
        const result = StubbedViewReturnLogPresenter.go(testReturnLog, auth)

        expect(result.summaryTableData.headers).to.equal('GENERATED_HEADERS')
        expect(result.summaryTableData.rows).to.equal('GENERATED_ROWS')
      })
    })
  })

  describe('the "tableTitle" property', () => {
    beforeEach(() => {
      setupSubmission(testReturnLog)
    })

    it('returns the frequency in the title', () => {
      const result = ViewReturnLogPresenter.go(testReturnLog, auth)

      expect(result.tableTitle).to.contain('monthly')
    })

    describe('when the method is abstractionVolumes', () => {
      beforeEach(() => {
        Sinon.stub(testReturnLog.returnSubmissions[0], '$method').returns('abstractionVolumes')
      })

      it("returns 'abstraction volumes' in the title", () => {
        const result = ViewReturnLogPresenter.go(testReturnLog, auth)

        expect(result.tableTitle).to.contain('abstraction volumes')
      })
    })

    describe('when the method is not abstractionVolumes', () => {
      beforeEach(() => {
        Sinon.stub(testReturnLog.returnSubmissions[0], '$method').returns('NOT_ABSTRACTION_VOLUMES')
      })

      it("returns 'meter readings' in the title", () => {
        const result = ViewReturnLogPresenter.go(testReturnLog, auth)

        expect(result.tableTitle).to.contain('meter readings')
      })
    })
  })

  describe('the "total" property', () => {
    describe('when there is no submission', () => {
      it('returns 0 as a string', () => {
        const result = ViewReturnLogPresenter.go(testReturnLog, auth)

        expect(result.total).to.equal('0')
      })
    })

    describe('when there is a submission', () => {
      describe('which is a nil return', () => {
        beforeEach(() => {
          setupSubmission(testReturnLog, true)
        })

        it('returns 0 as a string', () => {
          const result = ViewReturnLogPresenter.go(testReturnLog, auth)

          expect(result.total).to.equal('0')
        })
      })

      describe('which is not a nil return', () => {
        beforeEach(() => {
          testReturnLog.versions = [
            createInstance(ReturnVersionModel, ReturnVersionHelper, { licenceId: testReturnLog.licence.id })
          ]

          testReturnLog.returnSubmissions = [
            createInstance(ReturnSubmissionModel, ReturnSubmissionHelper, {
              returnLogId: testReturnLog.id
            })
          ]

          testReturnLog.returnSubmissions[0].returnSubmissionLines = [
            createInstance(ReturnSubmissionLineModel, ReturnSubmissionLineHelper, {
              returnSubmissionId: testReturnLog.returnSubmissions[0].id
            }),
            createInstance(ReturnSubmissionLineModel, ReturnSubmissionLineHelper, {
              returnSubmissionId: testReturnLog.returnSubmissions[0].id,
              startDate: new Date(`2022-01-02`),
              endDate: new Date(`2022-02-08`)
            })
          ]
        })

        it('returns the formatted total quantity', () => {
          const result = ViewReturnLogPresenter.go(testReturnLog, auth)

          expect(result.total).to.equal('8,760')
        })
      })
    })
  })

  describe('the "underQuery" property', () => {
    beforeEach(() => {
      setupSubmission(testReturnLog)
    })

    describe('when the return log is under query', () => {
      beforeEach(() => {
        testReturnLog.underQuery = true
      })

      it('returns true', () => {
        const result = ViewReturnLogPresenter.go(testReturnLog, auth)

        expect(result.underQuery).to.equal(true)
      })
    })

    describe('when the return log is not under query', () => {
      beforeEach(() => {
        testReturnLog.underQuery = false
      })

      it('returns false', () => {
        const result = ViewReturnLogPresenter.go(testReturnLog, auth)

        expect(result.underQuery).to.equal(false)
      })
    })
  })
})

function setupSubmission(testReturnLog, nilReturn = false) {
  testReturnLog.versions = [
    createInstance(ReturnVersionModel, ReturnVersionHelper, { licenceId: testReturnLog.licence.id })
  ]

  testReturnLog.returnSubmissions = [
    createInstance(ReturnSubmissionModel, ReturnSubmissionHelper, {
      returnLogId: testReturnLog.id,
      nilReturn
    })
  ]

  testReturnLog.returnSubmissions[0].returnSubmissionLines = [
    createInstance(ReturnSubmissionLineModel, ReturnSubmissionLineHelper, {
      returnSubmissionId: testReturnLog.returnSubmissions[0].id
    })
  ]
}

// Create an instance of a given model using the defaults of the given helper, without creating it in the db. This
// allows us to pass in the expected models without having to touch the db at all.
function createInstance(model, helper, data = {}) {
  return model.fromJson({
    createdAt: new Date(),
    updatedAt: new Date(),
    ...helper.defaults(),
    ...data
  })
}
