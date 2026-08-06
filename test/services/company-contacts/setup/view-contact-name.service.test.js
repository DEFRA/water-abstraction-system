// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import SessionModelStub from 'water-abstraction-engine/test/stubs/session.stub.js'
import CustomersFixtures from '../../../support/fixtures/customers.fixture.js'

// Things we need to stub
import * as FetchSessionDal from 'water-abstraction-engine/dal/fetch-session.dal.js'

// Thing under test
import ViewContactNameService from '../../../../src/services/company-contacts/setup/view-contact-name.service.js'

describe('Company Contacts - Setup - View Contact Name Service', () => {
  let company
  let session
  let sessionData

  beforeEach(async () => {
    company = CustomersFixtures.company()

    sessionData = { company }

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewContactNameService(session.id)

      expect(result).toEqual({
        backLink: {
          href: `/system/companies/${company.id}/contacts`,
          text: 'Back'
        },
        name: '',
        pageTitle: 'Enter a name for the contact',
        pageTitleCaption: 'Tyrell Corporation'
      })
    })
  })
})
