// Test framework dependencies

// Thing under test
import DetermineBillingYearsService from '../../../../app/services/licences/supplementary/determine-billing-years.service.js'

describe('Determine Billing Years Service', () => {
  let endDate
  let startDate
  let testDate

  beforeEach(() => {
    testDate = new Date('2024-03-31')
    vi.useFakeTimers({ now: testDate })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  describe('when given a start date beginning before April', () => {
    beforeEach(() => {
      startDate = new Date('2023-03-20')
    })

    describe('and no end date', () => {
      beforeEach(() => {
        endDate = null
      })

      it('takes todays date for the end date and returns the financial year ends between the two dates', () => {
        const result = DetermineBillingYearsService(startDate, endDate)

        expect(result).toEqual([2023, 2024])
      })
    })

    describe('and an end date beginning before April', () => {
      beforeEach(() => {
        endDate = new Date('2024-03-20')
      })

      it('returns the financial year ends between the two dates', () => {
        const result = DetermineBillingYearsService(startDate, endDate)

        expect(result).toEqual([2023, 2024])
      })
    })

    describe('and an end date beginning after April', () => {
      beforeEach(() => {
        endDate = new Date('2024-04-20')
      })

      it('returns the financial year ends between the two dates', () => {
        const result = DetermineBillingYearsService(startDate, endDate)

        expect(result).toEqual([2023, 2024, 2025])
      })
    })
  })

  describe('when given a start date beginning after April', () => {
    beforeEach(() => {
      startDate = new Date('2022-04-20')
    })

    describe('and no end date', () => {
      beforeEach(() => {
        endDate = null
      })

      it('takes todays date for the end date and returns the financial year ends between the two dates', () => {
        const result = DetermineBillingYearsService(startDate, endDate)

        expect(result).toEqual([2023, 2024])
      })
    })

    describe('and an end date beginning before April', () => {
      beforeEach(() => {
        endDate = new Date('2023-03-20')
      })

      it('returns  the financial year ends between the two dates', () => {
        const result = DetermineBillingYearsService(startDate, endDate)

        expect(result).toEqual([2023])
      })
    })

    describe('and an end date beginning after April', () => {
      beforeEach(() => {
        endDate = new Date('2023-04-20')
      })

      it('returns  the financial year ends between the two dates', () => {
        const result = DetermineBillingYearsService(startDate, endDate)

        expect(result).toEqual([2023, 2024])
      })
    })
  })
})
