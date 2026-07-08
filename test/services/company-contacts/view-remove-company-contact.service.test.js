// Test framework dependencies

// Test helpers
import * as CustomersFixtures from '../../support/fixtures/customers.fixture.js'

// Things we need to stub
import FetchAbstractionAlertLicencesDal from '../../../app/dal/company-contacts/fetch-abstraction-alert-licences.dal.js'
import FetchCompanyContactDal from '../../../app/dal/company-contacts/fetch-company-contact.dal.js'
import FetchCompanyService from '../../../app/dal/companies/fetch-company.dal.js'

// Thing under test
import ViewRemoveCompanyContactService from '../../../app/services/company-contacts/view-remove-company-contact.service.js'

describe('Company Contacts - View Remove Company Contact Service', () => {
  let companyContact
  let company

  beforeEach(async () => {
    companyContact = CustomersFixtures.companyContact()

    company = CustomersFixtures.company()

    vi.mock('../../../app/dal/company-contacts/fetch-abstraction-alert-licences.dal.js')
    FetchAbstractionAlertLicencesDal.mockResolvedValue([])
    vi.mock('../../../app/dal/companies/fetch-company.dal.js')
    FetchCompanyService.mockReturnValue(company)
    vi.mock('../../../app/dal/company-contacts/fetch-company-contact.dal.js')
    FetchCompanyContactDal.mockReturnValue(companyContact)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewRemoveCompanyContactService(companyContact.id)

      expect(result).toEqual({
        backLink: {
          href: `/system/company-contacts/${companyContact.id}/contact-details`,
          text: 'Go back to contact details'
        },
        contact: {
          abstractionAlertsLabel: 'No',
          email: 'rachael.tyrell@tyrellcorp.com',
          licences: [],
          name: 'Rachael Tyrell'
        },
        pageTitle: "You're about to remove this contact",
        pageTitleCaption: 'Tyrell Corporation'
      })
    })
  })
})
