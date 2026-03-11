'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const FetchCompaniesService = require('../../../../app/services/billing-accounts/setup/fetch-companies.service.js')
const BillingAccountsFixture = require('../../../support/fixtures/billing-accounts.fixture.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')

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

  let payload
  let session
  let sessionData

  beforeEach(async () => {
    sessionData = {
      billingAccount
    }

    session = await SessionHelper.add({ data: sessionData })
  })

  afterEach(async () => {
    await session.$query().delete()
  })

  describe('when the user picks a company', () => {
    beforeEach(async () => {
      payload = {
        companiesHouseNumber
      }
    })

    it('saves the submitted value', async () => {
      await SubmitSelectCompanyService.go(session.id, payload)

      const refreshedSession = await session.$query()

      expect(refreshedSession.companiesHouseNumber).to.equal(payload.companiesHouseNumber)
    })

    it('continues the journey', async () => {
      const result = await SubmitSelectCompanyService.go(session.id, payload)

      expect(result).to.equal({
        redirectUrl: `/system/billing-accounts/setup/${session.id}/existing-address`
      })
    })

    describe('and the user has returned to the page and made the same choice', () => {
      beforeEach(async () => {
        sessionData = {
          companiesHouseNumber,
          billingAccount
        }

        session = await SessionHelper.add({ data: sessionData })
      })

      it('saves the submitted value', async () => {
        await SubmitSelectCompanyService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.data).to.equal(
          {
            companiesHouseNumber: payload.companiesHouseNumber
          },
          { skip: ['billingAccount'] }
        )
      })

      it('continues the journey', async () => {
        const result = await SubmitSelectCompanyService.go(session.id, payload)

        expect(result).to.equal({
          redirectUrl: `/system/billing-accounts/setup/${session.id}/existing-address`
        })
      })
    })

    describe('and the user has returned to the page from the check page and made the same choice', () => {
      beforeEach(async () => {
        sessionData = {
          companiesHouseNumber,
          billingAccount,
          checkPageVisited: true
        }

        session = await SessionHelper.add({ data: sessionData })
      })

      it('saves the submitted value', async () => {
        await SubmitSelectCompanyService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.data).to.equal(
          {
            companiesHouseNumber: payload.companiesHouseNumber,
            checkPageVisited: true
          },
          { skip: ['billingAccount'] }
        )
      })

      it('continues the journey', async () => {
        const result = await SubmitSelectCompanyService.go(session.id, payload)

        expect(result).to.equal({
          redirectUrl: `/system/billing-accounts/setup/${session.id}/check`
        })
      })
    })

    describe('and the user selects a different company', () => {
      beforeEach(async () => {
        sessionData = {
          billingAccount,
          addressSelected: 'another',
          contactName: 'Contact Name',
          contactSelected: 'new',
          fao: 'yes'
        }

        session = await SessionHelper.add({ data: sessionData })
      })

      it('saves the submitted value', async () => {
        await SubmitSelectCompanyService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.data).to.equal(
          {
            addressJourney: null,
            addressSelected: null,
            checkPageVisited: false,
            companiesHouseNumber: payload.companiesHouseNumber,
            contactName: null,
            contactSelected: null,
            fao: null
          },
          { skip: ['billingAccount'] }
        )
      })

      it('continues the journey', async () => {
        const result = await SubmitSelectCompanyService.go(session.id, payload)

        expect(result).to.equal({
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
      const result = await SubmitSelectCompanyService.go(session.id, payload)

      expect(result.error).to.equal({
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
