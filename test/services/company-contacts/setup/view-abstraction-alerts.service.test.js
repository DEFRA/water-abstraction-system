// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import SessionModelStub from 'water-abstraction-engine/test/stubs/session.stub.js'
import CustomersFixtures from '../../../support/fixtures/customers.fixture.js'

// Things we need to stub
import * as FetchSessionDal from 'water-abstraction-engine/dal/fetch-session.dal.js'

// Thing under test
import ViewAbstractionAlertsService from '../../../../src/services/company-contacts/setup/view-abstraction-alerts.service.js'

describe('Company Contacts - Setup - Abstraction Alerts Service', () => {
  let company
  let session
  let sessionData

  beforeEach(async () => {
    company = CustomersFixtures.company()

    sessionData = { company, licences: [] }

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewAbstractionAlertsService(session.id)

      expect(result).toEqual({
        abstractionAlerts: null,
        backLink: {
          href: `/system/company-contacts/setup/${session.id}/contact-email`,
          text: 'Back'
        },
        pageTitle: 'Should the contact get abstraction alerts?',
        pageTitleCaption: 'Tyrell Corporation',
        showSomeLicences: false
      })
    })
  })
})
