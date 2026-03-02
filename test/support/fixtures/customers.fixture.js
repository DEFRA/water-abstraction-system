'use strict'

const BillingAccountModel = require('../../../app/models/billing-account.model.js')
const ContactModel = require('../../../app/models/contact.model.js')
const LicenceModel = require('../../../app/models/licence.model.js')
const { generateAccountNumber } = require('../helpers/billing-account.helper.js')
const { generateLicenceRef } = require('../helpers/licence.helper.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')

/**
 * A representation from the billing accounts 'FetchBillingAccountsService'
 *
 * @returns {object[]} A array of billing accounts
 */
function billingAccounts() {
  return [
    BillingAccountModel.fromJson({
      accountNumber: generateAccountNumber(),
      billingAccountAddresses: [
        {
          address: {
            address1: 'ENVIRONMENT AGENCY',
            address2: 'HORIZON HOUSE',
            address3: 'DEANERY ROAD',
            address4: 'BRISTOL',
            address5: null,
            address6: null,
            country: 'United Kingdom',
            id: generateUUID(),
            postcode: 'BS1 5AH'
          },
          company: null,
          contact: null,
          id: generateUUID()
        }
      ],
      company: {
        id: generateUUID(),
        name: 'Tyrell Corporation',
        type: 'organisation'
      },
      id: generateUUID()
    })
  ]
}

/**
 * A representation of the company from the 'FetchCompanyService'
 *
 * @returns {object} A company object
 */
function company() {
  return {
    id: generateUUID(),
    name: 'Tyrell Corporation'
  }
}

/**
 * A representation of the company from the 'FetchCompaniesService'
 *
 * @returns {object[]} A array of company objects
 */
function companies() {
  return [
    {
      id: generateUUID(),
      name: 'Tyrell Corporation'
    }
  ]
}

/**
 * A representation from the company contact table
 *
 * @returns {module:CompanyContactModel} A company contact
 */
function companyContact() {
  return {
    id: generateUUID(),
    abstractionAlerts: false,
    companyId: generateUUID(),
    contact: contact(),
    createdAt: new Date('2022-01-01'),
    createdByUser: {
      id: generateUUID(),
      username: 'nexus6.hunter@offworld.net'
    },
    licenceRole: {
      id: generateUUID(),
      name: 'additionalContact'
    },
    updatedAt: new Date('2022-01-01'),
    updatedByUser: {
      id: generateUUID(),
      username: 'void.kampff@tyrell.com'
    }
  }
}

/**
 * A representation from the company contact 'FetchBillingAccountsService'
 *
 * @returns {object[]} An array of company contact
 */
function companyContacts() {
  return [
    {
      ...companyContact(),
      licenceRole: {
        label: 'Additional Contact'
      }
    }
  ]
}

/**
 * A representation of a contact
 *
 * @returns {object[]} A contact
 */
function contact() {
  return ContactModel.fromJson({
    id: generateUUID(),
    salutation: null,
    firstName: 'Rachael',
    middleInitials: null,
    lastName: 'Tyrell',
    initials: null,
    contactType: 'person',
    suffix: null,
    department: 'Tyrell Corporation',
    // The upper case T is used to catch any code where we do not lowercase the email address. This will be legacy data
    email: 'rachael.Tyrell@tyrellcorp.com'
  })
}

/**
 * A representation from the customers 'FetchLicencesService'
 *
 * @returns {object[]} A array of licences
 */
function licences() {
  return [
    LicenceModel.fromJson({
      expiredDate: null,
      id: generateUUID(),
      lapsedDate: null,
      licenceRef: generateLicenceRef(),
      licenceVersions: [
        {
          endDate: null,
          id: generateUUID(),
          startDate: new Date('2022-01-01')
        }
      ],
      revokedDate: null,
      startDate: new Date('2022-01-01')
    })
  ]
}

module.exports = {
  billingAccounts,
  company,
  companies,
  companyContact,
  companyContacts,
  contact,
  licences
}
