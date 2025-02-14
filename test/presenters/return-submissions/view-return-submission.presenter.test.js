'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const ViewReturnSubmissionPresenter = require('../../../app/presenters/return-submissions/view-return-submission.presenter.js')

// Test helpers
const ReturnLogModel = require('../../../app/models/return-log.model.js')
const ReturnLogHelper = require('../../support/helpers/return-log.helper.js')
const ReturnSubmissionModel = require('../../../app/models/return-submission.model.js')
const ReturnSubmissionHelper = require('../../support/helpers/return-submission.helper.js')
const ReturnSubmissionLineModel = require('../../../app/models/return-submission-line.model.js')
const ReturnSubmissionLineHelper = require('../../support/helpers/return-submission-line.helper.js')

const { unitNames } = require('../../../app/lib/static-lookups.lib.js')

describe('View Return Submissions presenter', () => {
  let testReturnSubmission

  beforeEach(() => {
    testReturnSubmission = createSubmission()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('the "backLink" property', () => {
    it('returns the expected result', () => {
      const result = ViewReturnSubmissionPresenter.go(testReturnSubmission, '2025-1')

      expect(result.backLink).to.equal(`/system/return-logs?id=${testReturnSubmission.returnLogId}`)
    })
  })

  describe('the "displayReadings" property', () => {
    describe('when the return submission method is abstractionVolumes', () => {
      beforeEach(() => {
        Sinon.stub(testReturnSubmission, '$method').returns('abstractionVolumes')
      })

      it('returns false', () => {
        const result = ViewReturnSubmissionPresenter.go(testReturnSubmission, '2025-1')

        expect(result.displayReadings).to.equal(false)
      })
    })

    describe("when the return submission method isn't abstractionVolumes", () => {
      beforeEach(() => {
        Sinon.stub(testReturnSubmission, '$method').returns('NOT_ABSTRACTION_VOLUMES')
      })

      it('returns true', () => {
        const result = ViewReturnSubmissionPresenter.go(testReturnSubmission, '2025-1')

        expect(result.displayReadings).to.equal(true)
      })
    })
  })

  describe('the "displayUnits" property', () => {
    describe('when the unit is not cubic metres', () => {
      beforeEach(() => {
        Sinon.stub(testReturnSubmission, '$units').returns(unitNames.GALLONS)
      })

      it('returns true', () => {
        const result = ViewReturnSubmissionPresenter.go(testReturnSubmission, '2025-1')

        expect(result.displayUnits).to.equal(true)
      })
    })

    describe('when the unit is cubic metres', () => {
      beforeEach(() => {
        Sinon.stub(testReturnSubmission, '$units').returns(unitNames.CUBIC_METRES)
      })

      it('returns false', () => {
        const result = ViewReturnSubmissionPresenter.go(testReturnSubmission, '2025-1')

        expect(result.displayUnits).to.equal(false)
      })
    })
  })

  describe('the "pageTitle" property', () => {
    it('returns the expected result', () => {
      const result = ViewReturnSubmissionPresenter.go(testReturnSubmission, '2025-1')

      expect(result.pageTitle).to.equal('Water abstracted February 2025')
    })
  })

  describe('the "returnReference" property', () => {
    it('returns the expected result', () => {
      const result = ViewReturnSubmissionPresenter.go(testReturnSubmission, '2025-1')

      expect(result.returnReference).to.equal(testReturnSubmission.returnLog.returnReference)
    })
  })

  describe('the "tableData" property', () => {
    describe('whenthe  return submission contains volumes', () => {
      beforeEach(() => {
        Sinon.stub(testReturnSubmission, '$method').returns('abstractionVolumes')
      })

      describe('and the volumes are cubic metres', () => {
        beforeEach(() => {
          Sinon.stub(testReturnSubmission, '$units').returns(unitNames.CUBIC_METRES)
        })

        it('includes the expected headers', () => {
          const result = ViewReturnSubmissionPresenter.go(testReturnSubmission, '2025-1')

          const headers = result.tableData.headers.map((header) => header.text)

          expect(headers).to.equal(['Day', 'Cubic metres'])
        })

        it('includes the expected rows', () => {
          const result = ViewReturnSubmissionPresenter.go(testReturnSubmission, '2025-1')

          expect(result.tableData.rows.length).to.equal(28)
          // We use include() as a row can also include a reading key which we don't care about for volumes
          expect(result.tableData.rows[0]).to.include({
            cubicMetresQuantity: '1,000',
            date: '1 February 2025',
            unitQuantity: '1,000'
          })
        })

        it('includes the expected totals', () => {
          const result = ViewReturnSubmissionPresenter.go(testReturnSubmission, '2025-1')

          expect(result.tableData.cubicMetresTotal).to.equal('28,000')
          expect(result.tableData.unitTotal).to.equal('28,000')
        })
      })

      describe('and the volumes are not cubic metres', () => {
        beforeEach(() => {
          testReturnSubmission = createSubmission({ userUnit: unitNames.GALLONS })
          Sinon.stub(testReturnSubmission, '$units').returns(unitNames.GALLONS)
        })

        it('includes the expected headers', () => {
          const result = ViewReturnSubmissionPresenter.go(testReturnSubmission, '2025-1')

          const headers = result.tableData.headers.map((header) => header.text)

          expect(headers).to.equal(['Day', 'Gallons', 'Cubic metres'])
        })

        it('includes the expected rows', () => {
          const result = ViewReturnSubmissionPresenter.go(testReturnSubmission, '2025-1')

          expect(result.tableData.rows.length).to.equal(28)
          // We use include() as a row can also include a reading key which we don't care about for volumes
          expect(result.tableData.rows[0]).to.include({
            cubicMetresQuantity: '219,969.248',
            date: '1 February 2025',
            unitQuantity: '1,000'
          })
        })

        it('includes the expected totals', () => {
          const result = ViewReturnSubmissionPresenter.go(testReturnSubmission, '2025-1')

          expect(result.tableData.cubicMetresTotal).to.equal('6,159,138.952')
          expect(result.tableData.unitTotal).to.equal('28,000')
        })
      })
    })

    describe('when the return submission contains readings', () => {
      beforeEach(() => {
        testReturnSubmission = createSubmission({ readings: true })
        Sinon.stub(testReturnSubmission, '$method').returns('oneMeter')
      })

      it('includes the expected headers', () => {
        const result = ViewReturnSubmissionPresenter.go(testReturnSubmission, '2025-1')

        const headers = result.tableData.headers.map((header) => header.text)

        expect(headers).to.equal(['Day', 'Reading', 'Cubic metres'])
      })

      it('includes the expected rows', () => {
        const result = ViewReturnSubmissionPresenter.go(testReturnSubmission, '2025-1')

        expect(result.tableData.rows.length).to.equal(28)
        // We use include() as a row can also include a reading key which we don't care about for volumes
        expect(result.tableData.rows[0]).to.include({
          reading: 1001,
          date: '1 February 2025'
        })
      })

      it('includes the expected totals', () => {
        const result = ViewReturnSubmissionPresenter.go(testReturnSubmission, '2025-1')

        expect(result.tableData.cubicMetresTotal).to.equal('28,000')
      })
    })
  })
})

function createSubmission({ userUnit = unitNames.CUBIC_METRES, readings = false } = {}) {
  const testReturnSubmission = createInstance(ReturnSubmissionModel, ReturnSubmissionHelper)

  testReturnSubmission.returnLog = createInstance(ReturnLogModel, ReturnLogHelper)

  testReturnSubmission.returnSubmissionLines = []

  // Create lines for February 2025 (which we are using for testing) and January & March 2025 (which are there to ensure
  // we are only picking up the lines for February)
  const months = {
    January: {
      monthIndex: 0,
      days: 31
    },
    February: {
      monthIndex: 1,
      days: 28
    },
    March: {
      monthIndex: 2,
      days: 31
    }
  }

  const BASE_READING = 1000

  for (const month in months) {
    const { monthIndex, days } = months[month]
    for (let day = 1; day <= days; day++) {
      testReturnSubmission.returnSubmissionLines.push(
        createInstance(ReturnSubmissionLineModel, ReturnSubmissionLineHelper, {
          returnSubmissionId: testReturnSubmission.id,
          startDate: new Date(2025, monthIndex, day),
          endDate: new Date(2025, monthIndex, day),
          timePeriod: 'day',
          quantity: 1000,
          userUnit,
          // Add an incrementing meter reading if specified
          reading: readings ? BASE_READING + day : null
        })
      )
    }
  }

  return testReturnSubmission
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
