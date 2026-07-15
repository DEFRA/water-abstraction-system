import BillingAccountModel from '../../../app/models/billing-account.model.js'
import CompanyContactModel from '../../../app/models/company-contact.model.js'
import ContactModel from '../../../app/models/contact.model.js'
import LicenceModel from '../../../app/models/licence.model.js'
import BillingAccountHelper from '../helpers/billing-account.helper.js'
import LicenceHelper from '../helpers/licence.helper.js'
import { generateUUID } from '../../../app/lib/general.lib.js'

/**
 * A representation from the billing accounts 'FetchBillingAccountsService'
 *
 * @returns {object[]} A array of billing accounts
 */
export function billingAccounts() {
  return [
    BillingAccountModel.fromJson({
      accountNumber: BillingAccountHelper.generateAccountNumber(),
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
export function company() {
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
export function companies() {
  return [
    {
      id: generateUUID(),
      name: 'Tyrell Corporation'
    }
  ]
}

/**
 * A representation from the company address table
 *
 * @returns {module:CompanyAddressModel} A company address
 */
export function companyAddress() {
  return {
    id: generateUUID(),
    address: {
      id: generateUUID(),
      address1: 'The Tyrell Spire',
      address2: 'Floor 667 (Above the Smog)',
      address3: 'Southbank Industrial Sector',
      address4: 'Lambeth Precinct',
      address5: 'Greater London',
      address6: 'United Kingdom',
      country: 'UK',
      postcode: 'SE1 7TY'
    }
  }
}

/**
 * A representation from the company contact table
 *
 * @returns {module:CompanyContactModel} A company contact
 */
export function companyContact() {
  return CompanyContactModel.fromJson({
    id: generateUUID(),
    abstractionAlertLicences: null,
    abstractionAlerts: false,
    companyId: generateUUID(),
    contact: contact(),
    createdAt: new Date('2022-01-01'),
    createdByUser: {
      id: generateUUID(),
      username: 'nexus6.hunter@offworld.net'
    },
    deletedAt: null,
    licenceRole: {
      id: generateUUID(),
      name: 'additionalContact'
    },
    updatedAt: new Date('2022-01-01'),
    updatedByUser: {
      id: generateUUID(),
      username: 'void.kampff@tyrell.com'
    }
  })
}

/**
 * A representation from the company contact 'FetchBillingAccountsService'
 *
 * @returns {object[]} An array of company contact
 */
export function companyContacts() {
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
export function contact() {
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
export function licences() {
  return [
    LicenceModel.fromJson({
      expiredDate: null,
      id: generateUUID(),
      lapsedDate: null,
      licenceRef: LicenceHelper.generateLicenceRef(),
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
