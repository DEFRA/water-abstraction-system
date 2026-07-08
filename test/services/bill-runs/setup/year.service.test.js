// Test framework dependencies

// Test helpers
import SessionModelStub from '../../../support/stubs/session.stub.js'

// Things we need to stub
import * as FetchLicenceSupplementaryYearsService from '../../../../app/services/bill-runs/setup/fetch-licence-supplementary-years.service.js'
import * as FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'

// Thing under test
import YearService from '../../../../app/services/bill-runs/setup/year.service.js'

describe('Bill Runs - Setup - Year service', () => {
  const regionId = 'cff057a0-f3a7-4ae6-bc2b-01183e40fd05'

  let session
  let sessionData
  beforeEach(() => {
    sessionData = { region: regionId, type: 'two_part_supplementary', year: 2024 }

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)

    vi.spyOn(FetchLicenceSupplementaryYearsService, 'default').mockResolvedValue([{ financialYearEnd: 2024 }])
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await YearService(session.id)

      expect(FetchLicenceSupplementaryYearsService.default).toHaveBeenCalledWith(regionId, true)

      expect(result).toEqual({
        activeNavBar: 'bill-runs',
        backlink: `/system/bill-runs/setup/${session.id}/region`,
        financialYearsData: [{ text: '2023 to 2024', value: 2024, checked: true }],
        pageTitle: 'Select the financial year',
        sessionId: session.id,
        selectedYear: 2024
      })
    })
  })
})
