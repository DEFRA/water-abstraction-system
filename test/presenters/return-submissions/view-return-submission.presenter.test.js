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
    describe('when the return submission contains volumes', () => {
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

    describe('when the return submission frequency is daily', () => {
      beforeEach(() => {
        Sinon.stub(testReturnSubmission, '$method').returns('abstractionVolumes')
        Sinon.stub(testReturnSubmission, '$units').returns(unitNames.CUBIC_METRES)
      })

      it('includes the expected headers', () => {
        const result = ViewReturnSubmissionPresenter.go(testReturnSubmission, '2025-1')

        const headers = result.tableData.headers.map((header) => header.text)

        expect(headers).to.include('Day')
      })

      it('includes the expected rows', () => {
        const result = ViewReturnSubmissionPresenter.go(testReturnSubmission, '2025-1')

        expect(result.tableData.rows.length).to.equal(28)
        expect(result.tableData.rows[0]).to.include({ date: '1 February 2025' })
        expect(result.tableData.rows[27]).to.include({ date: '28 February 2025' })
      })
    })

    describe('when the return submission frequency is weekly', () => {
      beforeEach(() => {
        testReturnSubmission = createSubmission({ returnsFrequency: 'week' })
        Sinon.stub(testReturnSubmission, '$method').returns('abstractionVolumes')
        Sinon.stub(testReturnSubmission, '$units').returns(unitNames.CUBIC_METRES)
      })

      it('includes the expected headers', () => {
        const result = ViewReturnSubmissionPresenter.go(testReturnSubmission, '2025-3')

        const headers = result.tableData.headers.map((header) => header.text)

        expect(headers).to.include('Week ending')
      })

      it('includes the expected rows that start within the month', () => {
        const result = ViewReturnSubmissionPresenter.go(testReturnSubmission, '2025-3')

        expect(result.tableData.rows.length).to.equal(4)
        expect(result.tableData.rows[0]).to.include({ date: '12 April 2025' })
        expect(result.tableData.rows[3]).to.include({ date: '3 May 2025' })
      })
    })
  })
})

function createSubmission({ userUnit = unitNames.CUBIC_METRES, readings = false, returnsFrequency = 'day' } = {}) {
  const testReturnSubmission = createInstance(ReturnSubmissionModel, ReturnSubmissionHelper)

  testReturnSubmission.returnLog = createInstance(ReturnLogModel, ReturnLogHelper, { returnsFrequency })

  testReturnSubmission.returnSubmissionLines = []

  // Create daily lines for February 2025 (which we are using for testing) and January & March 2025 (which are there to
  // ensure we are only picking up the lines for February)
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

  // Create weekly lines for April 2025 (which we use for testing weekly returns)
  const weeks = [
    { startDate: new Date(2025, 2, 30), endDate: new Date(2025, 3, 5) },
    { startDate: new Date(2025, 3, 6), endDate: new Date(2025, 3, 12) },
    { startDate: new Date(2025, 3, 13), endDate: new Date(2025, 3, 19) },
    { startDate: new Date(2025, 3, 20), endDate: new Date(2025, 3, 26) },
    { startDate: new Date(2025, 3, 27), endDate: new Date(2025, 4, 3) }
  ]

  weeks.forEach(({ startDate, endDate }) => {
    testReturnSubmission.returnSubmissionLines.push(
      createInstance(ReturnSubmissionLineModel, ReturnSubmissionLineHelper, {
        returnSubmissionId: testReturnSubmission.id,
        startDate,
        endDate,
        timePeriod: 'week',
        quantity: 1000,
        userUnit
      })
    )
  })

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
