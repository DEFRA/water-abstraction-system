// Test framework dependencies

// Test helpers
import * as BillingAccountsFixture from '../../../support/fixtures/billing-accounts.fixture.js'
import SessionModelStub from '../../../support/stubs/session.stub.js'

// Things we need to stub
import FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'

// Thing under test
import SubmitContactNameService from '../../../../app/services/billing-accounts/setup/submit-contact-name.service.js'

describe('Billing Accounts - Setup - Contact Name Service', () => {
  const billingAccount = BillingAccountsFixture.billingAccount().billingAccount
  let payload
  let session
  let sessionData

  beforeEach(() => {
    sessionData = {
      billingAccount
    }

    session = SessionModelStub(sessionData)

    vi.mock('../../../../app/dal/fetch-session.dal.js')
    FetchSessionDal.mockResolvedValue(session)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    beforeEach(() => {
      payload = {
        contactName: 'Contact Name'
      }
    })

    it('saves the submitted value', async () => {
      await SubmitContactNameService(session.id, payload)

      expect(session.contactName).toEqual(payload.contactName)
      expect(session.$update.called).toBe(true)
    })

    it('continues the journey', async () => {
      const result = await SubmitContactNameService(session.id, payload)

      expect(result).toEqual({
        redirectUrl: `/system/billing-accounts/setup/${session.id}/check`
      })
    })

    describe('and the user has returned to the page and entered the same name', () => {
      beforeEach(() => {
        sessionData = {
          billingAccount,
          contactName: 'Contact Name'
        }

        session = SessionModelStub(sessionData)

        FetchSessionDal.mockResolvedValue(session)
      })

      it('saves the submitted value', async () => {
        await SubmitContactNameService(session.id, payload)

        expect(session.contactName).toEqual(payload.contactName)
        expect(session.$update.called).toBe(true)
      })

      it('continues the journey', async () => {
        const result = await SubmitContactNameService(session.id, payload)

        expect(result).toEqual({
          redirectUrl: `/system/billing-accounts/setup/${session.id}/check`
        })
      })
    })

    describe('and the user has returned to the page from the check and entered the same name', () => {
      beforeEach(() => {
        sessionData = {
          billingAccount,
          checkPageVisited: true,
          contactName: 'Contact Name'
        }

        session = SessionModelStub(sessionData)

        FetchSessionDal.mockResolvedValue(session)
      })

      it('saves the submitted value', async () => {
        await SubmitContactNameService(session.id, payload)

        expect(session.contactName).toEqual(payload.contactName)
        expect(session.checkPageVisited).toEqual(true)
        expect(session.$update.called).toBe(true)
      })

      it('returns to the check page', async () => {
        const result = await SubmitContactNameService(session.id, payload)

        expect(result).toEqual({
          redirectUrl: `/system/billing-accounts/setup/${session.id}/check`
        })
      })
    })

    describe('and the user has returned to the page from the check and changes the contact name', () => {
      beforeEach(() => {
        payload = {
          contactName: 'New Name'
        }

        sessionData = {
          billingAccount,
          checkPageVisited: true,
          contactName: 'Contact Name'
        }

        session = SessionModelStub(sessionData)

        FetchSessionDal.mockResolvedValue(session)
      })

      it('saves the submitted value', async () => {
        await SubmitContactNameService(session.id, payload)

        expect(session.contactName).toEqual(payload.contactName)
        expect(session.checkPageVisited).toEqual(false)

        expect(session.$update.called).toBe(true)
      })

      it('returns to the check page', async () => {
        const result = await SubmitContactNameService(session.id, payload)

        expect(result).toEqual({
          redirectUrl: `/system/billing-accounts/setup/${session.id}/check`
        })
      })
    })
  })

  describe('when validation fails', () => {
    describe('because nothing was entered', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns page data for the view, with errors', async () => {
        const result = await SubmitContactNameService(session.id, payload)

        expect(result.error).toEqual({
          errorList: [
            {
              href: '#contactName',
              text: 'Enter a name for the contact'
            }
          ],
          contactName: {
            text: 'Enter a name for the contact'
          }
        })
      })
    })

    describe('because too many characters were entered', () => {
      beforeEach(() => {
        payload = {
          contactName: 'a'.repeat(101)
        }
      })

      it('returns page data for the view, with errors', async () => {
        const result = await SubmitContactNameService(session.id, payload)

        expect(result.error).toEqual({
          errorList: [
            {
              href: '#contactName',
              text: 'Name must be 100 characters or less'
            }
          ],
          contactName: {
            text: 'Name must be 100 characters or less'
          }
        })
      })
    })
  })
})
