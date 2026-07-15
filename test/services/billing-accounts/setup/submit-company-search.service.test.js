// Test helpers
import * as BillingAccountsFixture from '../../../support/fixtures/billing-accounts.fixture.js'
import SessionModelStub from '../../../support/stubs/session.stub.js'

// Things we need to stub
import * as FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'

// Thing under test
import SubmitCompanySearchService from '../../../../app/services/billing-accounts/setup/submit-company-search.service.js'

describe('Billing Accounts - Setup - Submit Company Search Service', () => {
  const billingAccount = BillingAccountsFixture.billingAccount().billingAccount
  let payload
  let session
  let sessionData

  beforeEach(() => {
    sessionData = {
      billingAccount
    }

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when the use submits a search term', () => {
    beforeEach(() => {
      payload = {
        companySearch: 'Company Name'
      }
    })

    it('saves the submitted value', async () => {
      await SubmitCompanySearchService(session.id, payload)

      expect(session.companySearch).toEqual(payload.companySearch)
      expect(session.$update).toHaveBeenCalled()
    })

    it('continues the journey', async () => {
      const result = await SubmitCompanySearchService(session.id, payload)

      expect(result).toEqual({
        redirectUrl: `/system/billing-accounts/setup/${session.id}/select-company`
      })
    })
  })

  describe('and the user has returned to the page and made the same choice', () => {
    beforeEach(() => {
      sessionData = {
        billingAccount,
        companySearch: 'Company Name'
      }

      session = SessionModelStub(sessionData)

      vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
    })

    it('saves the submitted value', async () => {
      await SubmitCompanySearchService(session.id, payload)

      expect(session.companySearch).toEqual(payload.companySearch)
      expect(session.$update).toHaveBeenCalled()
    })

    it('continues the journey', async () => {
      const result = await SubmitCompanySearchService(session.id, payload)

      expect(result).toEqual({
        redirectUrl: `/system/billing-accounts/setup/${session.id}/select-company`
      })
    })
  })

  describe('and the user has returned to the page from the check page and made the same choice', () => {
    beforeEach(() => {
      sessionData = {
        billingAccount,
        checkPageVisited: true,
        companySearch: 'Company Name'
      }

      session = SessionModelStub(sessionData)

      vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
    })

    it('saves the submitted value', async () => {
      await SubmitCompanySearchService(session.id, payload)

      expect(session.companySearch).toEqual(payload.companySearch)
      expect(session.checkPageVisited).toEqual(true)
      expect(session.$update).toHaveBeenCalled()
    })

    it('continues the journey', async () => {
      await SubmitCompanySearchService(session.id, payload)

      expect(session).toMatchObject({
        checkPageVisited: true,
        companySearch: payload.companySearch
      })
      expect(session.$update).toHaveBeenCalled()
    })
  })

  describe('and the user has returned to the page from the check page and made a different choice', () => {
    beforeEach(() => {
      sessionData = {
        billingAccount,
        checkPageVisited: true,
        companySearch: 'Company Ltd'
      }

      session = SessionModelStub(sessionData)

      vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
    })

    it('saves the submitted value', async () => {
      await SubmitCompanySearchService(session.id, payload)

      expect(session.companySearch).toEqual(payload.companySearch)
      expect(session.$update).toHaveBeenCalled()
    })

    it('continues the journey', async () => {
      await SubmitCompanySearchService(session.id, payload)

      expect(session).toMatchObject({
        addressJourney: null,
        addressSelected: null,
        checkPageVisited: false,
        companiesHouseNumber: false,
        companySearch: payload.companySearch,
        contactSelected: null,
        contactName: null,
        fao: null
      })
    })
  })

  describe('when validation fails', () => {
    describe('because nothing was entered', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns page data for the view, with errors', async () => {
        const result = await SubmitCompanySearchService(session.id, payload)

        expect(result.error).toEqual({
          errorList: [
            {
              href: '#companySearch',
              text: 'Enter the Companies House number or company name'
            }
          ],
          companySearch: {
            text: 'Enter the Companies House number or company name'
          }
        })
      })
    })

    describe('because too many characters were entered', () => {
      beforeEach(() => {
        payload = {
          companySearch: 'a'.repeat(101)
        }
      })

      it('returns page data for the view, with errors', async () => {
        const result = await SubmitCompanySearchService(session.id, payload)

        expect(result.error).toEqual({
          errorList: [
            {
              href: '#companySearch',
              text: 'Companies House number or company name must be 100 characters or less'
            }
          ],
          companySearch: {
            text: 'Companies House number or company name must be 100 characters or less'
          }
        })
      })
    })
  })
})
