// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import SessionModelStub from 'water-abstraction-engine/test/stubs/session.stub.js'
import BillingAccountsFixture from '../../../support/fixtures/billing-accounts.fixture.js'

// Things we need to stub
import * as FetchSessionDal from 'water-abstraction-engine/dal/fetch-session.dal.js'

// Thing under test
import ViewContactNameService from '../../../../src/services/billing-accounts/setup/view-contact-name.service.js'

describe('Billing Accounts - Setup - Contact Name Service', () => {
  let session
  let sessionData

  beforeEach(() => {
    sessionData = {
      billingAccount: BillingAccountsFixture.billingAccount().billingAccount
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

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewContactNameService(session.id)

      expect(result).toEqual({
        backLink: {
          href: `/system/billing-accounts/setup/${session.id}/contact`,
          text: 'Back'
        },
        contactName: session.contactName ?? null,
        pageTitle: 'Enter a name for the contact',
        pageTitleCaption: `Billing account ${session.billingAccount.accountNumber}`
      })
    })
  })
})
