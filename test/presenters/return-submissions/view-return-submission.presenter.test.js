// Thing under test
import ViewReturnSubmissionPresenter from '../../../app/presenters/return-submissions/view-return-submission.presenter.js'

// Test helpers
import ReturnLogModel from '../../../app/models/return-log.model.js'
import * as ReturnLogHelper from '../../support/helpers/return-log.helper.js'
import ReturnSubmissionModel from '../../../app/models/return-submission.model.js'
import * as ReturnSubmissionHelper from '../../support/helpers/return-submission.helper.js'
import ReturnSubmissionLineModel from '../../../app/models/return-submission-line.model.js'
import * as ReturnSubmissionLineHelper from '../../support/helpers/return-submission-line.helper.js'

import { unitNames } from '../../../app/lib/static-lookups.lib.js'

describe('View Return Submissions presenter', () => {
  let testReturnSubmission

  beforeEach(() => {
    testReturnSubmission = _createSubmission()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('the "backLink" property', () => {
    describe('when the return submission is the current version', () => {
      it('returns the expected result', () => {
        const result = ViewReturnSubmissionPresenter(testReturnSubmission, '2025-1')

        expect(result.backLink).toEqual(`/system/return-logs/${testReturnSubmission.returnLogId}/details`)
      })
    })

    describe('when the return submission is a previous version', () => {
      beforeEach(() => {
        testReturnSubmission = _createSubmission({ version: 2, current: false })
      })

      it('returns the expected result', () => {
        const result = ViewReturnSubmissionPresenter(testReturnSubmission, '2025-1')

        expect(result.backLink).toEqual(
          `/system/return-logs/${testReturnSubmission.returnLogId}/details?version=${testReturnSubmission.version}`
        )
      })
    })
  })

  describe('the "backLinkText" property', () => {
    describe('when the return submission is the current version', () => {
      it('returns the expected result', () => {
        const result = ViewReturnSubmissionPresenter(testReturnSubmission, '2025-1')

        expect(result.backLinkText).toEqual(`Go back to return ${testReturnSubmission.returnLog.returnReference}`)
      })
    })

    describe('when the return submission is a previous version', () => {
      beforeEach(() => {
        testReturnSubmission = _createSubmission({ version: 2, current: false })
      })

      it('returns the expected result', () => {
        const result = ViewReturnSubmissionPresenter(testReturnSubmission, '2025-1')

        expect(result.backLinkText).toEqual(
          `Go back to return ${testReturnSubmission.returnLog.returnReference} version ${testReturnSubmission.version}`
        )
      })
    })
  })

  describe('the "displayReadings" property', () => {
    describe('when the return submission method is abstractionVolumes', () => {
      beforeEach(() => {
        vi.spyOn(testReturnSubmission, '$method').mockReturnValue('abstractionVolumes')
      })

      it('returns false', () => {
        const result = ViewReturnSubmissionPresenter(testReturnSubmission, '2025-1')

        expect(result.displayReadings).toEqual(false)
      })
    })

    describe("when the return submission method isn't abstractionVolumes", () => {
      beforeEach(() => {
        vi.spyOn(testReturnSubmission, '$method').mockReturnValue('NOT_ABSTRACTION_VOLUMES')
      })

      it('returns true', () => {
        const result = ViewReturnSubmissionPresenter(testReturnSubmission, '2025-1')

        expect(result.displayReadings).toEqual(true)
      })
    })
  })

  describe('the "displayUnits" property', () => {
    describe('when the unit is not cubic metres', () => {
      beforeEach(() => {
        vi.spyOn(testReturnSubmission, '$units').mockReturnValue(unitNames.GALLONS)
      })

      it('returns true', () => {
        const result = ViewReturnSubmissionPresenter(testReturnSubmission, '2025-1')

        expect(result.displayUnits).toEqual(true)
      })
    })

    describe('when the unit is cubic metres', () => {
      beforeEach(() => {
        vi.spyOn(testReturnSubmission, '$units').mockReturnValue(unitNames.CUBIC_METRES)
      })

      it('returns false', () => {
        const result = ViewReturnSubmissionPresenter(testReturnSubmission, '2025-1')

        expect(result.displayUnits).toEqual(false)
      })
    })
  })

  describe('the "pageTitle" property', () => {
    it('returns the expected result', () => {
      const result = ViewReturnSubmissionPresenter(testReturnSubmission, '2025-1')

      expect(result.pageTitle).toEqual('Water abstracted February 2025')
    })
  })

  describe('the "returnReference" property', () => {
    it('returns the expected result', () => {
      const result = ViewReturnSubmissionPresenter(testReturnSubmission, '2025-1')

      expect(result.returnReference).toEqual(testReturnSubmission.returnLog.returnReference)
    })
  })

  describe('the "tableData" property', () => {
    describe('when the return submission contains volumes', () => {
      beforeEach(() => {
        vi.spyOn(testReturnSubmission, '$method').mockReturnValue('abstractionVolumes')
      })

      describe('and the volumes are cubic metres', () => {
        beforeEach(() => {
          vi.spyOn(testReturnSubmission, '$units').mockReturnValue(unitNames.CUBIC_METRES)
        })

        it('includes the expected headers', () => {
          const result = ViewReturnSubmissionPresenter(testReturnSubmission, '2025-1')

          const headers = result.tableData.headers.map((header) => {
            return header.text
          })

          expect(headers).toEqual(['Day', 'Cubic metres'])
        })

        it('includes the expected rows', () => {
          const result = ViewReturnSubmissionPresenter(testReturnSubmission, '2025-1')

          expect(result.tableData.rows.length).toEqual(28)
          // We use include() as a row can also include a reading key which we don't care about for volumes
          expect(result.tableData.rows[0]).toMatchObject({
            cubicMetresQuantity: '1,000',
            date: '1 February 2025',
            unitQuantity: '1,000'
          })
        })

        it('includes the expected totals', () => {
          const result = ViewReturnSubmissionPresenter(testReturnSubmission, '2025-1')

          expect(result.tableData.cubicMetresTotal).toEqual('28,000')
          expect(result.tableData.unitTotal).toEqual('28,000')
        })
      })

      describe('and the volumes are not cubic metres', () => {
        beforeEach(() => {
          testReturnSubmission = _createSubmission({ userUnit: unitNames.GALLONS })
          vi.spyOn(testReturnSubmission, '$units').mockReturnValue(unitNames.GALLONS)
        })

        it('includes the expected headers', () => {
          const result = ViewReturnSubmissionPresenter(testReturnSubmission, '2025-1')

          const headers = result.tableData.headers.map((header) => {
            return header.text
          })

          expect(headers).toEqual(['Day', 'Gallons', 'Cubic metres'])
        })

        it('includes the expected rows', () => {
          const result = ViewReturnSubmissionPresenter(testReturnSubmission, '2025-1')

          expect(result.tableData.rows.length).toEqual(28)
          // We use include() as a row can also include a reading key which we don't care about for volumes
          expect(result.tableData.rows[0]).toMatchObject({
            cubicMetresQuantity: '1,000',
            date: '1 February 2025',
            unitQuantity: '219,969.248299'
          })
        })

        it('includes the expected totals', () => {
          const result = ViewReturnSubmissionPresenter(testReturnSubmission, '2025-1')

          expect(result.tableData.cubicMetresTotal).toEqual('28,000')
          expect(result.tableData.unitTotal).toEqual('6,159,138.952372')
        })
      })
    })

    describe('when the return submission contains readings', () => {
      beforeEach(() => {
        testReturnSubmission = _createSubmission({ readings: true })
        vi.spyOn(testReturnSubmission, '$method').mockReturnValue('NOT_ABSTRACTION_VOLUMES')
      })

      it('includes the expected headers', () => {
        const result = ViewReturnSubmissionPresenter(testReturnSubmission, '2025-1')

        const headers = result.tableData.headers.map((header) => {
          return header.text
        })

        expect(headers).toEqual(['Day', 'Reading', 'Cubic metres'])
      })

      it('includes the expected rows', () => {
        const result = ViewReturnSubmissionPresenter(testReturnSubmission, '2025-1')

        expect(result.tableData.rows.length).toEqual(28)
        // We use include() as a row can also include a reading key which we don't care about for volumes
        expect(result.tableData.rows[0]).toMatchObject({
          reading: 1001,
          date: '1 February 2025'
        })
      })

      it('includes the expected totals', () => {
        const result = ViewReturnSubmissionPresenter(testReturnSubmission, '2025-1')

        expect(result.tableData.cubicMetresTotal).toEqual('28,000')
      })
    })

    describe('when the return submission contains non-cubic metre volumes and readings', () => {
      beforeEach(() => {
        testReturnSubmission = _createSubmission({ readings: true })
        vi.spyOn(testReturnSubmission, '$units').mockReturnValue(unitNames.GALLONS)
        vi.spyOn(testReturnSubmission, '$method').mockReturnValue('NOT_ABSTRACTION_VOLUMES')
      })

      it('includes the expected headers', () => {
        const result = ViewReturnSubmissionPresenter(testReturnSubmission, '2025-1')

        const headers = result.tableData.headers.map((header) => {
          return header.text
        })

        expect(headers).toEqual(['Day', 'Reading', 'Gallons', 'Cubic metres'])
      })
    })

    describe('when the return submission frequency is daily', () => {
      beforeEach(() => {
        vi.spyOn(testReturnSubmission, '$method').mockReturnValue('abstractionVolumes')
        vi.spyOn(testReturnSubmission, '$units').mockReturnValue(unitNames.CUBIC_METRES)
      })

      it('includes the expected headers', () => {
        const result = ViewReturnSubmissionPresenter(testReturnSubmission, '2025-1')

        const headers = result.tableData.headers.map((header) => {
          return header.text
        })

        expect(headers).toContain('Day')
      })

      it('includes the expected rows', () => {
        const result = ViewReturnSubmissionPresenter(testReturnSubmission, '2025-1')

        expect(result.tableData.rows.length).toEqual(28)
        expect(result.tableData.rows[0]).toMatchObject({ date: '1 February 2025' })
        expect(result.tableData.rows[27]).toMatchObject({ date: '28 February 2025' })
      })
    })

    describe('when the return submission frequency is weekly', () => {
      beforeEach(() => {
        testReturnSubmission = _createSubmission({ returnsFrequency: 'week' })
        vi.spyOn(testReturnSubmission, '$method').mockReturnValue('abstractionVolumes')
        vi.spyOn(testReturnSubmission, '$units').mockReturnValue(unitNames.CUBIC_METRES)
      })

      it('includes the expected headers', () => {
        const result = ViewReturnSubmissionPresenter(testReturnSubmission, '2025-3')

        const headers = result.tableData.headers.map((header) => {
          return header.text
        })

        expect(headers).toContain('Week ending')
      })

      it('includes the expected rows that end within the month', () => {
        const result = ViewReturnSubmissionPresenter(testReturnSubmission, '2025-3')

        expect(result.tableData.rows.length).toEqual(4)
        expect(result.tableData.rows[0]).toMatchObject({ date: '5 April 2025' })
        expect(result.tableData.rows).not.toContainEqual({ date: '3 May 2025' })
      })
    })
  })
})

// Create an instance of a given model using the defaults of the given helper, without creating it in the db. This
// allows us to pass in the expected models without having to touch the db at all.
function _createInstance(model, helper, data = {}) {
  return model.fromJson({
    createdAt: new Date(),
    updatedAt: new Date(),
    ...helper.defaults(),
    ...data
  })
}

function _createSubmission({
  userUnit = unitNames.CUBIC_METRES,
  readings = false,
  returnsFrequency = 'day',
  version = 1,
  current = true
} = {}) {
  const testReturnSubmission = _createInstance(ReturnSubmissionModel, ReturnSubmissionHelper, { version, current })

  testReturnSubmission.returnLog = _createInstance(ReturnLogModel, ReturnLogHelper, { returnsFrequency })

  testReturnSubmission.returnSubmissionLines = []

  // Create daily lines for February 2025 (which we are using for testing) and January & March 2025 (which are there to
  // ensure we are only picking up the lines for February)
  const months = {
    January: {
      monthNumber: 1,
      days: 31
    },
    February: {
      monthNumber: 2,
      days: 28
    },
    March: {
      monthNumber: 3,
      days: 31
    }
  }

  const BASE_READING = 1000

  for (const month in months) {
    const { monthNumber, days } = months[month]
    for (let day = 1; day <= days; day++) {
      testReturnSubmission.returnSubmissionLines.push(
        _createInstance(ReturnSubmissionLineModel, ReturnSubmissionLineHelper, {
          returnSubmissionId: testReturnSubmission.id,
          startDate: new Date(`2025-${monthNumber}-${day}`),
          endDate: new Date(`2025-${monthNumber}-${day}`),
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
    { startDate: new Date('2025-03-30'), endDate: new Date('2025-04-05') },
    { startDate: new Date('2025-04-06'), endDate: new Date('2025-04-12') },
    { startDate: new Date('2025-04-13'), endDate: new Date('2025-04-19') },
    { startDate: new Date('2025-04-20'), endDate: new Date('2025-04-26') },
    { startDate: new Date('2025-04-27'), endDate: new Date('2025-05-03') }
  ]

  weeks.forEach(({ startDate, endDate }) => {
    testReturnSubmission.returnSubmissionLines.push(
      _createInstance(ReturnSubmissionLineModel, ReturnSubmissionLineHelper, {
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
