'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateUUID } = require('../../../../app/lib/general.lib.js')
const LoadService = require('../../../../app/services/data/load/load.service.js')

// Models
const AddressModel = require('../../../../app/models/address.model.js')
const BillingAccountAddressModel = require('../../../../app/models/billing-account-address.model.js')
const BillingAccountModel = require('../../../../app/models/billing-account.model.js')
const CompanyAddressModel = require('../../../../app/models/company-address.model.js')
const CompanyContactModel = require('../../../../app/models/company-contact.model.js')
const CompanyModel = require('../../../../app/models/company.model.js')
const ContactModel = require('../../../../app/models/contact.model.js')
const LicenceDocumentModel = require('../../../../app/models/licence-document.model.js')
const LicenceDocumentRoleModel = require('../../../../app/models/licence-document-role.model.js')

// Thing under test
const CrmSchemaService = require('../../../../app/services/data/tear-down/crm-schema.service.js')

describe.only('CRM schema service', () => {
  describe('go', () => {
    let loadResult

    beforeEach(async () => {
      const addressId = generateUUID()
      const billingAccountId = generateUUID()
      const companyId = generateUUID()
      const contactId = generateUUID()
      const licenceDocumentId = generateUUID()

      loadResult = await LoadService.go({
        // Use a name matching the existing teardown pattern so tests remain valid after is_test is removed
        companies: [{ id: companyId, name: 'Big Farm Co Ltd' }],
        addresses: [{ id: addressId }],
        // Use a department matching the existing teardown pattern so tests remain valid after is_test is removed
        contacts: [{ id: contactId, department: 'Test Farm Manager' }],
        companyAddresses: [{ companyId, addressId }],
        companyContacts: [{ companyId, contactId }],
        billingAccounts: [{ id: billingAccountId, companyId }],
        billingAccountAddresses: [{ billingAccountId, addressId }],
        licenceDocuments: [{ id: licenceDocumentId }],
        licenceDocumentRoles: [{ licenceDocumentId, companyId, addressId }]
      })
    })

    it('removes all loaded CRM schema test data', async () => {
      await CrmSchemaService.go()

      expect(await CompanyModel.query().findById(loadResult.companies[0])).to.be.undefined()
      expect(await AddressModel.query().findById(loadResult.addresses[0])).to.be.undefined()
      expect(await ContactModel.query().findById(loadResult.contacts[0])).to.be.undefined()
      expect(await CompanyAddressModel.query().findById(loadResult.companyAddresses[0])).to.be.undefined()
      expect(await CompanyContactModel.query().findById(loadResult.companyContacts[0])).to.be.undefined()
      expect(await BillingAccountModel.query().findById(loadResult.billingAccounts[0])).to.be.undefined()
      expect(await BillingAccountAddressModel.query().findById(loadResult.billingAccountAddresses[0])).to.be.undefined()
      expect(await LicenceDocumentModel.query().findById(loadResult.licenceDocuments[0])).to.be.undefined()
      expect(await LicenceDocumentRoleModel.query().findById(loadResult.licenceDocumentRoles[0])).to.be.undefined()
    })
  })
})
