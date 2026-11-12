// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import SessionModelStub from 'water-abstraction-engine/test/stubs/session.stub.js'
import BillingAccountsFixture from '../../../support/fixtures/billing-accounts.fixture.js'
import * as FetchCompaniesService from '../../../../src/services/billing-accounts/setup/fetch-companies.service.js'

// Things we need to stub
import * as FetchSessionDal from 'water-abstraction-engine/dal/fetch-session.dal.js'

// Thing under test
import SubmitSelectCompanyService from '../../../../src/services/billing-accounts/setup/submit-select-company.service.js'

describe('Billing Accounts - Setup - Submit Select Company Service', () => {
  const billingAccount = BillingAccountsFixture.billingAccount().billingAccount
  const companiesHouseNumber = '12345678'
  const companies = [
    {
      address: 'HORIZON HOUSE, DEANERY ROAD, BRISTOL, BS1 5AH',
      number: companiesHouseNumber,
      title: 'ENVIRONMENT AGENCY'
    }
  ]

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

  afterEach(async () => {
    await session.$query().delete()
  })

  describe('when the user picks a company', () => {
    beforeEach(() => {
      payload = {
        companiesHouseNumber
      }
    })

    it('saves the submitted value', async () => {
      await SubmitSelectCompanyService(session.id, payload)

      expect(session.companiesHouseNumber).toEqual(payload.companiesHouseNumber)
      expect(session.$update).toHaveBeenCalled()
    })

    it('continues the journey', async () => {
      const result = await SubmitSelectCompanyService(session.id, payload)

      expect(result).toEqual({
        redirectUrl: `/system/billing-accounts/setup/${session.id}/existing-address`
      })
    })

    describe('and the user has returned to the page and made the same choice', () => {
      beforeEach(() => {
        sessionData = {
          billingAccount,
          companiesHouseNumber
        }

        session = SessionModelStub(sessionData)

        vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
      })

      it('saves the submitted value', async () => {
        await SubmitSelectCompanyService(session.id, payload)

        expect(session).toMatchObject({
          companiesHouseNumber: payload.companiesHouseNumber
        })
        expect(session.$update).toHaveBeenCalled()
      })

      it('continues the journey', async () => {
        const result = await SubmitSelectCompanyService(session.id, payload)

        expect(result).toEqual({
          redirectUrl: `/system/billing-accounts/setup/${session.id}/existing-address`
        })
      })
    })

    describe('and the user has returned to the page from the check page and made the same choice', () => {
      beforeEach(() => {
        sessionData = {
          billingAccount,
          checkPageVisited: true,
          companiesHouseNumber
        }

        session = SessionModelStub(sessionData)

        vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
      })

      it('saves the submitted value', async () => {
        await SubmitSelectCompanyService(session.id, payload)

        expect(session).toMatchObject({
          checkPageVisited: true,
          companiesHouseNumber: payload.companiesHouseNumber
        })
      })

      it('continues the journey', async () => {
        const result = await SubmitSelectCompanyService(session.id, payload)

        expect(result).toEqual({
          redirectUrl: `/system/billing-accounts/setup/${session.id}/check`
        })
      })
    })

    describe('and the user selects a different company', () => {
      beforeEach(() => {
        sessionData = {
          addressSelected: 'another',
          billingAccount,
          contactName: 'Contact Name',
          contactSelected: 'new',
          fao: 'yes'
        }

        session = SessionModelStub(sessionData)

        vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
      })

      it('saves the submitted value', async () => {
        await SubmitSelectCompanyService(session.id, payload)

        expect(session).toMatchObject({
          addressJourney: null,
          addressSelected: null,
          checkPageVisited: false,
          companiesHouseNumber: payload.companiesHouseNumber,
          contactName: null,
          contactSelected: null,
          fao: null
        })
        expect(session.$update).toHaveBeenCalled()
      })

      it('continues the journey', async () => {
        const result = await SubmitSelectCompanyService(session.id, payload)

        expect(result).toEqual({
          redirectUrl: `/system/billing-accounts/setup/${session.id}/existing-address`
        })
      })
    })
  })

  describe('when validation fails', () => {
    beforeEach(() => {
      payload = {}
      vi.spyOn(FetchCompaniesService, 'default').mockReturnValue(companies)
    })

    it('returns page data for the view, with errors', async () => {
      const result = await SubmitSelectCompanyService(session.id, payload)

      expect(result.error).toEqual({
        companiesHouseNumber: { text: 'Select a company from the list' },
        errorList: [
          {
            href: '#companiesHouseNumber',
            text: 'Select a company from the list'
          }
        ]
      })
    })
  })
})
