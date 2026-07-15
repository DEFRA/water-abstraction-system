// Test helpers
import SessionModelStub from '../../../support/stubs/session.stub.js'

// Things we need to stub
import * as FetchLicenceSupplementaryYearsService from '../../../../app/services/bill-runs/setup/fetch-licence-supplementary-years.service.js'
import * as FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'

// Thing under test
import SubmitYearService from '../../../../app/services/bill-runs/setup/submit-year.service.js'

describe('Bill Runs - Setup - Submit Year service', () => {
  let payload
  let session
  let sessionData

  beforeEach(() => {
    sessionData = {}

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      describe('and the year is in the SROC period', () => {
        beforeEach(() => {
          payload = {
            year: '2026'
          }
        })

        it('saves the submitted value and returns an object confirming setup is complete', async () => {
          const result = await SubmitYearService(session.id, payload)

          expect(session.year).toEqual('2026')
          expect(result.setupComplete).toBe(true)
          expect(session.$update).toHaveBeenCalled()
        })
      })

      describe('and the year is in the PRESROC period', () => {
        beforeEach(() => {
          payload = {
            year: '2022'
          }
        })

        it('saves the submitted value and returns an object confirming setup is not complete', async () => {
          const result = await SubmitYearService(session.id, payload)

          expect(session.year).toEqual('2022')
          expect(result.setupComplete).toBe(false)

          expect(session.$update).toHaveBeenCalled()
        })
      })
    })

    describe('with an invalid payload', () => {
      describe('because the user has not selected anything', () => {
        const regionId = 'cff057a0-f3a7-4ae6-bc2b-01183e40fd05'
        beforeEach(() => {
          sessionData = { region: regionId, type: 'two_part_supplementary' }

          session = SessionModelStub(sessionData)

          vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
          payload = {}
          vi.spyOn(FetchLicenceSupplementaryYearsService, 'default').mockResolvedValue([{ financialYearEnd: 2024 }])
        })

        it('returns page data needed to re-render the view including the validation error', async () => {
          const result = await SubmitYearService(session.id, payload)

          expect(FetchLicenceSupplementaryYearsService.default).toHaveBeenCalledWith(regionId, true)

          expect(result).toEqual({
            activeNavBar: 'bill-runs',
            backlink: `/system/bill-runs/setup/${session.id}/region`,
            financialYearsData: [{ text: '2023 to 2024', value: 2024, checked: false }],
            pageTitle: 'Select the financial year',
            sessionId: session.id,
            selectedYear: null,
            error: {
              text: 'Select the financial year'
            }
          })
        })
      })
    })
  })
})
