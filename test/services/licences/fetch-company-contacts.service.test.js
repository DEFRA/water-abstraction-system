'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CompanyContactHelper = require('../../support/helpers/company-contact.helper.js')
const CompanyHelper = require('../../support/helpers/company.helper.js')
const ContactHelper = require('../../support/helpers/contact.helper.js')
const LicenceDocumentHelper = require('../../support/helpers/licence-document.helper.js')
const LicenceDocumentRoleHelper = require('../../support/helpers/licence-document-role.helper.js')
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const LicenceRoleHelper = require('../../support/helpers/licence-role.helper.js')

// Thing under test
const FetchCompanyContactsService = require('../../../app/services/licences/fetch-company-contacts.service.js')

describe('Licences - Fetch Company Contacts service', () => {
  let company
  let companyContact
  let contact
  let licence
  let licenceDocument
  let licenceRole

  afterEach(async () => {
    await company.$query().delete()
    await companyContact.$query().delete()
    await contact.$query().delete()
    await licence.$query().delete()
    await licenceDocument.$query().delete()
  })

  describe('when the licence has customer contact details', () => {
    beforeEach(async () => {
      licence = await LicenceHelper.add()

      company = await CompanyHelper.add()

      contact = await ContactHelper.add()

      licenceDocument = await LicenceDocumentHelper.add({ licenceRef: licence.licenceRef })
      licenceRole = await LicenceRoleHelper.select()

      companyContact = await CompanyContactHelper.add({
        companyId: company.id,
        contactId: contact.id,
        licenceRoleId: licenceRole.id
      })

      await LicenceDocumentRoleHelper.add({
        companyId: company.id,
        contactId: contact.id,
        endDate: null,
        licenceDocumentId: licenceDocument.id,
        licenceRoleId: licenceRole.id
      })

      // additional licence role in the past
      await LicenceDocumentRoleHelper.add({
        companyId: company.id,
        contactId: contact.id,
        startDate: new Date('2001-01-01'),
        endDate: new Date('2001-01-01'),
        licenceDocumentId: licenceDocument.id,
        licenceRoleId: licenceRole.id
      })
    })

    it('returns the matching licence company contacts', async () => {
      const results = await FetchCompanyContactsService.go(licence.id)

      expect(results).to.equal([
        {
          id: companyContact.id,
          abstractionAlerts: false,
          contact: {
            id: contact.id,
            salutation: null,
            firstName: 'Amara',
            middleInitials: null,
            lastName: 'Gupta',
            initials: null,
            contactType: 'person',
            suffix: null,
            department: null,
            email: 'amara.gupta@example.com'
          },
          licenceRole: {
            label: licenceRole.label
          }
        }
      ])
    })
  })
})
