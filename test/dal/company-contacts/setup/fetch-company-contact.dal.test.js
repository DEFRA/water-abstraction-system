// Test helpers
import * as CompanyContactHelper from '../../../support/helpers/company-contact.helper.js'
import * as CompanyHelper from '../../../support/helpers/company.helper.js'
import * as ContactHelper from '../../../support/helpers/contact.helper.js'

// Thing under test
import FetchCompanyContactDal from '../../../../app/dal/company-contacts/setup/fetch-company-contact.dal.js'

describe('Company Contacts - Setup - Fetch Company Contact Dal', () => {
  let company
  let companyContact
  let contact

  beforeAll(async () => {
    company = await CompanyHelper.add()

    contact = await ContactHelper.add()

    companyContact = await CompanyContactHelper.add({
      abstractionAlerts: false,
      contactId: contact.id,
      companyId: company.id
    })
  })

  afterAll(async () => {
    await companyContact.$query().delete()
    await contact.$query().delete()
  })

  describe('when there is a company contact', () => {
    it('returns the matching company contact', async () => {
      const result = await FetchCompanyContactDal(companyContact.id)

      expect(result).toEqual({
        abstractionAlertLicences: null,
        abstractionAlerts: false,
        company: {
          id: company.id,
          name: 'Example Trading Ltd'
        },
        contact: {
          id: contact.id,
          contactType: 'person',
          department: null,
          email: null,
          firstName: 'Amara',
          initials: null,
          lastName: 'Gupta',
          middleInitials: null,
          salutation: null,
          suffix: null
        },
        id: companyContact.id
      })
    })
  })
})
