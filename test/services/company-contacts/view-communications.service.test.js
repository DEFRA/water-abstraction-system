// Test framework dependencies

// Test helpers
import * as CustomersFixtures from '../../support/fixtures/customers.fixture.js'
import { generateUUID } from '../../../app/lib/general.lib.js'

// Things we need to stub
import FetchCompanyContactDal from '../../../app/dal/company-contacts/fetch-company-contact.dal.js'
import FetchCompanyService from '../../../app/dal/companies/fetch-company.dal.js'
import FetchNotificationsDal from '../../../app/dal/company-contacts/fetch-notifications.dal.js'

// Thing under test
import ViewCommunicationsService from '../../../app/services/company-contacts/view-communications.service.js'

describe('Company Contacts - View Communications Service', () => {
  const page = '1'

  let company
  let companyContact

  beforeEach(async () => {
    company = CustomersFixtures.company()

    companyContact = {
      companyId: company.id,
      contact: CustomersFixtures.contact(),
      id: generateUUID()
    }

    vi.mock('../../../app/dal/companies/fetch-company.dal.js')
    FetchCompanyService.mockReturnValue(company)
    vi.mock('../../../app/dal/company-contacts/fetch-company-contact.dal.js')
    FetchCompanyContactDal.mockReturnValue(companyContact)
    vi.mock('../../../app/dal/company-contacts/fetch-notifications.dal.js')
    FetchNotificationsDal.mockReturnValue({
      notifications: [],
      totalNumber: 0
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewCommunicationsService(companyContact.id, page)

      expect(result).toEqual({
        activeSecondaryNav: 'communications',
        pagination: {
          currentPageNumber: 1,
          numberOfPages: 0,
          showingMessage: 'Showing all 0 communications'
        },
        backLink: {
          href: `/system/companies/${company.id}/contacts`,
          text: 'Go back to licence holder contacts'
        },
        notifications: [],
        pageTitle: 'Communications for Rachael Tyrell',
        pageTitleCaption: 'Tyrell Corporation'
      })
    })
  })
})
