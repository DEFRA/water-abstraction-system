// Test helpers
import * as CompanyContactHelper from '../../support/helpers/company-contact.helper.js'
import * as ContactHelper from '../../support/helpers/contact.helper.js'
import { generateUUID } from '../../../app/lib/general.lib.js'

// Thing under test
import FetchCompanyContactDal from '../../../app/dal/company-contacts/fetch-company-contact.dal.js'

describe('Company Contacts - Fetch Company Contact dal', () => {
  const companyId = generateUUID()

  let companyContact
  let contact

  beforeAll(async () => {
    contact = await ContactHelper.add()
    companyContact = await CompanyContactHelper.add({ companyId, contactId: contact.id })
  })

  afterAll(async () => {
    await companyContact.$query().delete()
    await contact.$query().delete()
  })

  describe('when there is a company contact', () => {
    it('returns the company contact and associated contact record', async () => {
      const result = await FetchCompanyContactDal(companyContact.id)

      expect(result).toEqual({
        abstractionAlertLicences: null,
        abstractionAlerts: false,
        companyId,
        id: companyContact.id,
        contact: {
          contactType: 'person',
          department: null,
          email: null,
          firstName: 'Amara',
          id: contact.id,
          initials: null,
          lastName: 'Gupta',
          middleInitials: null,
          salutation: null,
          suffix: null
        }
      })
    })
  })
})
