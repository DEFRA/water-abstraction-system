// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import SessionModelStub from 'water-abstraction-engine/test/stubs/session.stub.js'
import CustomersFixtures from '../../../support/fixtures/customers.fixture.js'

// Things we need to stub
import * as FetchSessionDal from 'water-abstraction-engine/dal/fetch-session.dal.js'

// Thing under test
import ViewRestoreService from '../../../../src/services/company-contacts/setup/view-restore.service.js'

describe('Company Contacts - Setup - Restore Service', () => {
  let company
  let session
  let sessionData

  beforeEach(async () => {
    company = CustomersFixtures.company()

    sessionData = { company, abstractionAlerts: 'yes', name: 'Eric', email: 'eric@test.com' }

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewRestoreService(session.id)

      expect(result).toEqual({
        abstractionAlerts: 'Yes',
        backLink: {
          href: `/system/company-contacts/setup/${session.id}/check`,
          text: 'Back'
        },
        email: 'eric@test.com',
        name: 'Eric',
        pageTitle: 'You are about to restore this contact',
        pageTitleCaption: 'Tyrell Corporation'
      })
    })
  })
})
