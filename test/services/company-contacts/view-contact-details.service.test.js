// Test framework dependencies

// Test helpers
import * as CustomersFixtures from '../../support/fixtures/customers.fixture.js'
import YarStub from '../../support/stubs/yar.stub.js'

// Things we need to stub
import * as FetchAbstractionAlertLicencesDal from '../../../app/dal/company-contacts/fetch-abstraction-alert-licences.dal.js'
import * as FetchCompanyContactDetailsService from '../../../app/services/company-contacts/fetch-company-contact-details.service.js'
import * as FetchCompanyService from '../../../app/dal/companies/fetch-company.dal.js'

// Thing under test
import ViewContactDetailsService from '../../../app/services/company-contacts/view-contact-details.service.js'

describe('Company Contacts - View Contact Details Service', () => {
  let auth
  let company
  let companyContact
  let yarStub

  beforeEach(() => {
    auth = { credentials: { roles: [] } }

    companyContact = CustomersFixtures.companyContact()

    company = CustomersFixtures.company()

    vi.spyOn(FetchAbstractionAlertLicencesDal, 'default').mockResolvedValue([])
    vi.spyOn(FetchCompanyService, 'default').mockResolvedValue(company)
    vi.spyOn(FetchCompanyContactDetailsService, 'default').mockResolvedValue(companyContact)

    yarStub = YarStub()
    yarStub.flash.mockReturnValue([{ titleText: 'Updated', text: 'Contact details updated.' }])
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewContactDetailsService(companyContact.id, auth, yarStub)

      expect(result).toEqual({
        activeSecondaryNav: 'contact-details',
        additionalContact: true,
        backLink: {
          href: `/system/companies/${company.id}/contacts`,
          text: 'Go back to licence holder contacts'
        },
        contact: {
          abstractionAlertsLabel: 'No',
          created: '1 January 2022 by nexus6.hunter@offworld.net',
          email: 'rachael.tyrell@tyrellcorp.com',
          lastUpdated: '1 January 2022 by void.kampff@tyrell.com',
          licences: [],
          name: 'Rachael Tyrell'
        },
        editContactLink: `/system/company-contacts/setup/${companyContact.id}/edit`,
        notification: {
          text: 'Contact details updated.',
          titleText: 'Updated'
        },
        pageTitle: 'Contact details for Rachael Tyrell',
        pageTitleCaption: 'Tyrell Corporation',
        removeContactLink: `/system/company-contacts/${companyContact.id}/remove`,
        roles: [],
        warning: null
      })
    })
  })
})
