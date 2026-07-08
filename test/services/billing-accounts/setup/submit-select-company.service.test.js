'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const FetchCompaniesService = require('../../../../app/services/billing-accounts/setup/fetch-companies.service.js')
const BillingAccountsFixture = require('../../../support/fixtures/billing-accounts.fixture.js')
const SessionModelStub = require('../../../support/stubs/session.stub.js')

// Things we need to stub
const FetchSessionDal = require('../../../../app/dal/fetch-session.dal.js')

// Thing under test
const SubmitSelectCompanyService = require('../../../../app/services/billing-accounts/setup/submit-select-company.service.js')

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

  let fetchSessionStub
  let payload
  let session
  let sessionData

  beforeEach(() => {
    sessionData = {
      billingAccount
    }

    session = SessionModelStub.build(Sinon, sessionData)

    fetchSessionStub = Sinon.stub(FetchSessionDal, 'go').resolves(session)
  })

  afterEach(() => {
    Sinon.restore()
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
      expect(session.$update.called).toBe(true)
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
          companiesHouseNumber,
          billingAccount
        }

        session = SessionModelStub.build(Sinon, sessionData)

        fetchSessionStub.resolves(session)
      })

      it('saves the submitted value', async () => {
        await SubmitSelectCompanyService(session.id, payload)

        expect(session).toMatchObject({
          companiesHouseNumber: payload.companiesHouseNumber
        })
        expect(session.$update.called).toBe(true)
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
          companiesHouseNumber,
          billingAccount,
          checkPageVisited: true
        }

        session = SessionModelStub.build(Sinon, sessionData)

        fetchSessionStub.resolves(session)
      })

      it('saves the submitted value', async () => {
        await SubmitSelectCompanyService(session.id, payload)

        expect(session).toMatchObject({
          companiesHouseNumber: payload.companiesHouseNumber,
          checkPageVisited: true
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
          billingAccount,
          addressSelected: 'another',
          contactName: 'Contact Name',
          contactSelected: 'new',
          fao: 'yes'
        }

        session = SessionModelStub.build(Sinon, sessionData)

        fetchSessionStub.resolves(session)
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
        expect(session.$update.called).toBe(true)
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
      Sinon.stub(FetchCompaniesService, 'go').returns(companies)
    })

    it('returns page data for the view, with errors', async () => {
      const result = await SubmitSelectCompanyService(session.id, payload)

      expect(result.error).toEqual({
        errorList: [
          {
            href: '#companiesHouseNumber',
            text: 'Select a company from the list'
          }
        ],
        companiesHouseNumber: { text: 'Select a company from the list' }
      })
    })
  })
})
