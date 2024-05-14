'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const CompanyContactsHelper = require('../../support/helpers/company-contact.helper.js')
const CompanyHelper = require('../../support/helpers/company.helper.js')
const ContactHelper = require('../../support/helpers/contact.helper.js')
const DatabaseSupport = require('../../support/database.js')
const LicenceDocumentHelper = require('../../support/helpers/licence-document.helper.js')
const LicenceDocumentRolesHelper = require('../../support/helpers/licence-document-role.helper.js')
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const LicenceRoleHelper = require('../../support/helpers/licence-role.helper.js')

// Thing under test
const FetchCustomerContactDetailsService =
  require('../../../app/services/licences/fetch-customer-contacts.service.js')

describe('Fetch Customer Contacts service', () => {
  let licenceId
  let companyId
  let contactId
  beforeEach(async () => {
    await DatabaseSupport.clean()
  })

  describe('when the licence has contact details', () => {
    beforeEach(async () => {
      const licence = await LicenceHelper.add()
      licenceId = licence.id

      const company = await CompanyHelper.add()
      companyId = company.id

      const contact = await ContactHelper.add()
      contactId = contact.id

      const { id: licenceDocumentId } = await LicenceDocumentHelper.add({ licenceRef: licence.licenceRef })
      const { id: licenceRoleId } = await LicenceRoleHelper.add()

      await CompanyContactsHelper.add({
        contactId,
        companyId,
        roleId: licenceRoleId
      })

      await LicenceDocumentRolesHelper.add({
        endDate: null,
        licenceDocumentId,
        licenceRoleId,
        contactId,
        companyId
      })
    })

    it('returns the matching licence contacts', async () => {
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
