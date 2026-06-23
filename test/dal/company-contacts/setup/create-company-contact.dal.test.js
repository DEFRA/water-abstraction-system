'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, after } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CompanyContactModel = require('../../../../app/models/company-contact.model.js')
const CompanyHelper = require('../../../support/helpers/company.helper.js')
const LicenceRoleHelper = require('../../../support/helpers/licence-role.helper.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Thing under test
const CreateCompanyContactDal = require('../../../../app/dal/company-contacts/setup/create-company-contact.dal.js')

describe('Company Contacts - Create Company Contact dal', () => {
  let clock
  let companyContact
  let company

  before(async () => {
    companyContact = {
      abstractionAlertLicences: null,
      abstractionAlerts: true,
      createdBy: generateUUID(),
      email: 'bob@test.com',
      name: 'Bob'
    }

    company = await CompanyHelper.add()

    clock = Sinon.useFakeTimers(new Date('2021-01-01'))
  })

  after(async () => {
    Sinon.restore()
    clock.restore()

    await company.$query().delete()
  })

  describe('when a new company contact is added', () => {
    it('inserts the company contact and links the company contact to the "additionalContact" licence role', async () => {
      const result = await CreateCompanyContactDal.go(company.id, companyContact)

      const licenceRole = LicenceRoleHelper.select('additionalContact')

      const newCompanyContact = await CompanyContactModel.query().findById(result).withGraphFetched('contact')

      expect(newCompanyContact).to.equal(
        {
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
        },
        {
          skip: ['createdAt', 'updatedAt', 'contact.createdAt', 'contact.updatedAt']
        }
      )
    })
  })
})
