'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, after } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CompanyHelper = require('../../../support/helpers/company.helper.js')
const LicenceRoleHelper = require('../../../support/helpers/licence-role.helper.js')
const CompanyContactModel = require('../../../../app/models/company-contact.model.js')

// Thing under test
const PersistCompanyContactService = require('../../../../app/services/company-contacts/setup/persist-company-contact.service.js')

describe('Company Contacts - Persist Company Contact service', () => {
  let clock
  let companyContact
  let company

  before(async () => {
    companyContact = {
      abstractionAlerts: true,
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
      const result = await PersistCompanyContactService.go(company.id, companyContact)

      const licenceRole = LicenceRoleHelper.select('additionalContact')

      const newCompanyContact = await CompanyContactModel.query().findById(result.id).withGraphFetched('contact')

      expect(newCompanyContact).to.equal(
        {
          abstractionAlerts: true,
          companyId: company.id,
          contact: {
            contactType: 'department',
            dataSource: 'wrls',
            department: 'Bob',
            email: 'bob@test.com',
            externalId: null,
            firstName: null,
            id: result.contact.id,
            initials: null,
            lastName: null,
            middleInitials: null,
            salutation: null,
            suffix: null
          },
          contactId: result.contact.id,
          default: false,
          id: result.id,
          licenceRoleId: licenceRole.id,
          startDate: new Date('2021-01-01')
        },
        {
          skip: ['createdAt', 'updatedAt', 'contact.createdAt', 'contact.updatedAt', 'startDate']
        }
      )
    })
  })
})
