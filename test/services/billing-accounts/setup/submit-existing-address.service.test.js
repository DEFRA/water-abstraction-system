// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import BillingAccountsFixture from '../../../support/fixtures/billing-accounts.fixture.js'
import SessionModelStub from '../../../support/stubs/session.stub.js'
import { generateUUID } from '../../../../app/lib/general.lib.js'

// Things to stub
import * as FetchCompanyAddressesService from '../../../../app/services/billing-accounts/setup/fetch-company-addresses.service.js'
import * as FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'

// Thing under test
import SubmitExistingAddressService from '../../../../app/services/billing-accounts/setup/submit-existing-address.service.js'

describe('Billing Accounts - Setup - Submit Existing Address Service', () => {
  const billingAccount = BillingAccountsFixture.billingAccount().billingAccount
  const companyAddresses = {
    company: billingAccount.company,
    addresses: _addresses()
  }
  let payload
  let session
  let sessionData

  beforeEach(() => {
    vi.spyOn(FetchCompanyAddressesService, 'default').mockReturnValue(companyAddresses)

    sessionData = {}

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when the user picks an existing address', () => {
    beforeEach(() => {
      sessionData = {
        accountSelected: billingAccount.company.id,
        billingAccount
      }

      session = SessionModelStub(sessionData)

      vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)

      payload = {
        addressSelected: companyAddresses.addresses[0].id
      }
    })

    it('saves the submitted value', async () => {
      await SubmitExistingAddressService(session.id, payload)

      expect(session).toMatchObject({
        addressSelected: payload.addressSelected
      })
      expect(session.$update).toHaveBeenCalled()
    })

    it('continues the journey', async () => {
      const result = await SubmitExistingAddressService(session.id, payload)

      expect(result).toEqual({
        redirectUrl: `/system/billing-accounts/setup/${session.id}/fao`
      })
    })

    describe('and the user has returned to the page and made the same choice', () => {
      beforeEach(() => {
        sessionData = {
          addressSelected: companyAddresses.addresses[0].id,
          billingAccount
        }

        session = SessionModelStub(sessionData)

        vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
      })

      it('saves the submitted value', async () => {
        await SubmitExistingAddressService(session.id, payload)

        expect(session).toMatchObject({
          addressSelected: payload.addressSelected
        })
      })

      it('continues the journey', async () => {
        const result = await SubmitExistingAddressService(session.id, payload)

        expect(result).toEqual({
          redirectUrl: `/system/billing-accounts/setup/${session.id}/fao`
        })
      })
    })

    describe('and the user has returned to the page from the check page and made the same choice', () => {
      beforeEach(() => {
        sessionData = {
          addressSelected: companyAddresses.addresses[0].id,
          billingAccount,
          checkPageVisited: true
        }

        session = SessionModelStub(sessionData)

        vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
      })

      it('saves the submitted value', async () => {
        await SubmitExistingAddressService(session.id, payload)

        expect(session).toMatchObject({
          addressSelected: payload.addressSelected,
          checkPageVisited: true
        })
      })

      it('continues the journey', async () => {
        const result = await SubmitExistingAddressService(session.id, payload)

        expect(result).toEqual({
          redirectUrl: `/system/billing-accounts/setup/${session.id}/check`
        })
      })
    })

    describe('and the user selects an existing address after already having set up a new address', () => {
      beforeEach(() => {
        sessionData = _newAddressSessionData(session)

        session = SessionModelStub(sessionData)

        vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
      })

      it('saves the submitted value', async () => {
        await SubmitExistingAddressService(session.id, payload)

        expect(session).toMatchObject({
          ..._newAddressExpectedValues(session),
          addressSelected: payload.addressSelected
        })
      })

      it('continues the journey', async () => {
        const result = await SubmitExistingAddressService(session.id, payload)

        expect(result).toEqual({
          redirectUrl: `/system/billing-accounts/setup/${session.id}/fao`
        })
      })
    })
  })

  describe('when the user picks to set up a new address', () => {
    beforeEach(() => {
      sessionData = {
        accountSelected: 'another',
        existingAccount: billingAccount.company.id,
        billingAccount
      }

      session = SessionModelStub(sessionData)

      vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)

      payload = {
        addressSelected: 'new'
      }
    })

    it('saves the submitted value', async () => {
      await SubmitExistingAddressService(session.id, payload)

      expect(session).toMatchObject({
        addressSelected: 'new'
      })
    })

    it('continues the journey', async () => {
      const result = await SubmitExistingAddressService(session.id, payload)

      expect(result).toEqual({
        redirectUrl: `/system/billing-accounts/setup/${session.id}/fao`
      })
    })

    describe('and the user has returned to the page and made the same choice', () => {
      beforeEach(() => {
        sessionData = {
          addressSelected: 'new',
          billingAccount: BillingAccountsFixture.billingAccount().billingAccount
        }

        session = SessionModelStub(sessionData)

        vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
      })

      it('saves the submitted value', async () => {
        await SubmitExistingAddressService(session.id, payload)

        expect(session).toMatchObject({
          addressSelected: 'new'
        })
      })

      it('continues the journey', async () => {
        const result = await SubmitExistingAddressService(session.id, payload)

        expect(result).toEqual({
          redirectUrl: `/system/billing-accounts/setup/${session.id}/fao`
        })
      })
    })

    describe('and the user has returned to the page from the check page and made the same choice', () => {
      beforeEach(() => {
        sessionData = {
          addressSelected: 'new',
          billingAccount: BillingAccountsFixture.billingAccount().billingAccount,
          checkPageVisited: true
        }

        session = SessionModelStub(sessionData)

        vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
      })

      it('saves the submitted value', async () => {
        await SubmitExistingAddressService(session.id, payload)

        expect(session).toMatchObject({
          addressSelected: 'new',
          checkPageVisited: true
        })
      })

      it('continues the journey', async () => {
        const result = await SubmitExistingAddressService(session.id, payload)

        expect(result).toEqual({
          redirectUrl: `/system/billing-accounts/setup/${session.id}/check`
        })
      })
    })

    describe('when the user selects a new address after already having chosen an existing address', () => {
      beforeEach(() => {
        sessionData = _commonSessionData(session.billingAccount)

        session = SessionModelStub(sessionData)

        vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
      })

      it('saves the submitted value', async () => {
        await SubmitExistingAddressService(session.id, payload)

        expect(session).toMatchObject({
          ..._commonSessionData(session.billingAccount),
          addressSelected: payload.addressSelected
        })
      })

      it('continues the journey', async () => {
        const result = await SubmitExistingAddressService(session.id, payload)

        expect(result).toEqual({
          redirectUrl: `/system/billing-accounts/setup/${session.id}/fao`
        })
      })
    })
  })

  describe('when validation fails', () => {
    beforeEach(() => {
      sessionData = {
        accountSelected: 'another',
        existingAccount: billingAccount.company.id,
        billingAccount
      }

      session = SessionModelStub(sessionData)

      vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)

      payload = {}
    })

    it('returns page data for the view, with errors', async () => {
      const result = await SubmitExistingAddressService(session.id, payload)

      expect(result.error).toEqual({
        errorList: [
          {
            href: '#addressSelected',
            text: `Select an existing address for ${companyAddresses.company.name}`
          }
        ],
        addressSelected: { text: `Select an existing address for ${companyAddresses.company.name}` }
      })
    })
  })
})

function _addresses() {
  return [
    {
      id: generateUUID(),
      address1: 'ENVIRONMENT AGENCY',
      address2: 'HORIZON HOUSE',
      address3: 'DEANERY ROAD',
      address4: 'BRISTOL',
      address5: 'BRISTOLSHIRE',
      address6: null,
      postcode: 'BS1 5AH'
    }
  ]
}

function _commonExpectedValues(session) {
  return {
    accountSelected: session.billingAccount.company.id,
    addressJourney: null,
    billingAccount: session.billingAccount,
    checkPageVisited: false,
    contactName: null,
    contactSelected: null,
    fao: null
  }
}

function _newAddressExpectedValues(session) {
  return {
    ..._commonExpectedValues(session),
    accountSelected: 'another',
    addressSelected: 'new',
    existingAccount: session.billingAccount.company.id
  }
}

function _newAddressSessionData(session) {
  return {
    ..._commonSessionData(session.billingAccount),
    accountSelected: 'another',
    addressSelected: 'new',
    existingAccount: session.billingAccount.company.id
  }
}

function _commonSessionData(billingAccount) {
  return {
    accountSelected: billingAccount.company.id,
    billingAccount,
    contactName: 'Contact Name',
    contactSelected: 'new',
    fao: 'yes'
  }
}
