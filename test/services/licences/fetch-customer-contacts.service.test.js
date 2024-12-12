'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
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
const FetchCustomerContactDetailsService = require('../../../app/services/licences/fetch-customer-contacts.service.js')

describe('Fetch Customer Contacts service', () => {
  let companyId
  let contactId
  let licenceId

  describe('when the licence has customer contact details', () => {
    beforeEach(async () => {
      const licence = await LicenceHelper.add()

      licenceId = licence.id

      const company = await CompanyHelper.add()

      companyId = company.id

      const contact = await ContactHelper.add()

      contactId = contact.id

      const { id: licenceDocumentId } = await LicenceDocumentHelper.add({ licenceRef: licence.licenceRef })
      const { id: licenceRoleId } = await LicenceRoleHelper.select()

      await CompanyContactHelper.add({
        companyId,
        contactId,
        licenceRoleId
      })

      await LicenceDocumentRoleHelper.add({
        companyId,
        contactId,
        endDate: null,
        licenceDocumentId,
        licenceRoleId
      })
    })

    it('returns the matching licence customer contacts', async () => {
      const results = await FetchCustomerContactDetailsService.go(licenceId)

      expect(results).to.equal([
        {
          communicationType: 'Licence Holder',
          contactType: 'person',
          dataSource: 'wrls',
          department: null,
          email: 'amara.gupta@example.com',
          firstName: 'Amara',
          initials: null,
          lastName: 'Gupta',
          middleInitials: null,
          salutation: null,
          suffix: null
        }
      ])
    })
  })
})
