
// Test framework dependencies

// Test helpers
import CompanyContactModel from '../../../../app/models/company-contact.model.js'
import * as CompanyHelper from '../../../support/helpers/company.helper.js'
import * as LicenceRoleHelper from '../../../support/helpers/licence-role.helper.js'
import { generateUUID } from '../../../../app/lib/general.lib.js'

// Thing under test
import CreateCompanyContactDal from '../../../../app/dal/company-contacts/setup/create-company-contact.dal.js'

describe('Company Contacts - Create Company Contact dal', () => {
  let clock
  let companyContact
  let company

  beforeAll(async () => {
    companyContact = {
      abstractionAlertLicences: null,
      abstractionAlerts: true,
      createdBy: generateUUID(),
      email: 'bob@test.com',
      name: 'Bob'
    }

    company = await CompanyHelper.add()

    clock = vi.useFakeTimers({ now: { now: new Date('2021-01-01' }), toFake: ['Date'] })
  })

  afterAll(async () => {
    vi.restoreAllMocks()
    vi.useRealTimers()

    await company.$query().delete()
  })

  describe('when a new company contact is added', () => {
    it('inserts the company contact and links the company contact to the "additionalContact" licence role', async () => {
      const result = await CreateCompanyContactDal(company.id, companyContact)

      const licenceRole = LicenceRoleHelper.select('additionalContact')

      const newCompanyContact = await CompanyContactModel.query().findById(result).withGraphFetched('contact')

      expect(newCompanyContact).toMatchObject({
        abstractionAlertLicences: null,
        abstractionAlerts: true,
        createdBy: companyContact.createdBy,
        companyId: company.id,
        contact: {
          contactType: 'department',
          dataSource: 'wrls',
          department: 'Bob',
          email: 'bob@test.com',
          externalId: null,
          firstName: null,
          id: newCompanyContact.contact.id,
          initials: null,
          lastName: null,
          middleInitials: null,
          salutation: null,
          suffix: null
        },
        contactId: newCompanyContact.contact.id,
        default: false,
        deletedAt: null,
        id: result,
        licenceRoleId: licenceRole.id,
        startDate: new Date('2021-01-01'),
        updatedBy: null
      })
    })
  })
})
