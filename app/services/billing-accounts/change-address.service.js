'use strict'

/**
 * Manages changing the address for a billing account
 * @module ChangeAddressService
 */

const AddressModel = require('../../models/crm-v2/address.model.js')
const CompanyModel = require('../../models/crm-v2/company.model.js')
const ContactModel = require('../../models/crm-v2/contact.model.js')
const InvoiceAccountModel = require('../../models/crm-v2/invoice-account.model.js')
const InvoiceAccountAddressModel = require('../../models/crm-v2/invoice-account-address.model.js')
const SendCustomerChangeService = require('./send-customer-change.service.js')

/**
 * Manages the changing of an address for a billing (invoice) account
 *
 * Within the service an internal user can 'Change the address' of a billing account. That is what the button says but
 * they can also change or set the agent company and the contact along with the address.
 *
 * Behind the scenes a new `crm_v2.invoice_account_address` record is created that links to the `crm_v2.address`,
 * `crm_v2.company` and `crm_v2.contact` records. It will also be linked to the `crm_v2.invoice_account` which
 * represents the billing account being amended (hence the flipping between billing/invoice account!).
 *
 * It won't have an end date, which marks it as the 'current' address. The previous `invoice_account_address` will get
 * its `end_date` updated. The legacy service then knows that address is no longer current.
 *
 * When a change like this is made SOP, the system that sends invoices to customers, needs to know about it. That
 * process is handled by the {@link https://github.com/DEFRA/sroc-charging-module-api | Charging Module API}. So, as
 * well as updating our records we need to send a request to the CHA.
 *
 * The complexity comes from the legacy database and how it has been designed
 *
 * - the source for addresses, companies and contacts is NALD and WRLS. But rather than transform them at ingress to a
 *   single format the tables manage both. For example, NALD contacts use `initials` whereas WRLS contacts use
 *   `middle_initials`. A contact can also be a 'department' under WRLS, which means the format changes again
 * - where possible duplication of records has tried to be avoided. For example, you cannot have 2 addresses with the
 *   same UPRN, or 2 companies with the same company number. The problem is the source data _does_ change. We have seen
 *   the OS Places result for Horizon House change from Environment Agency, to Natural England, Defra and back to the
 *   Environment Agency over the years. This means when a user changes the address, for example, they may actually be
 *   selecting one that already exists based on UPRN, in which case we are not inserting a new record but using an
 *   existing one
 *
 * Add to that all SOP wants is a name and address which means we have to do a lot of work to format the data we receive
 * into something the CHA will accept.
 *
 * @param {String} invoiceAccountId The UUID for the billing (invoice) account being updated
 * @param {Object} address The validated address details
 * @param {Object} [agentCompany] The validated agent company details
 * @param {Object} [contact] The validated contact details
 *
 * @returns {Object} contains a copy of the persisted address, and agent company and contact if they were also changed
 */
async function go (invoiceAccountId, address, agentCompany, contact) {
  const invoiceAccount = await _fetchInvoiceAccount(invoiceAccountId)

  // We use the same timestamp for all date created/updated values. We then have something to tie together all the
  // changes we'll apply
  const timestamp = new Date()

  const addressInstance = _transformAddress(timestamp, address)
  const companyInstance = _transformCompany(timestamp, agentCompany)
  const contactInstance = _transformContact(timestamp, contact)

  await SendCustomerChangeService.go(invoiceAccount, addressInstance, companyInstance, contactInstance)

  return _persist(timestamp, invoiceAccount, addressInstance, companyInstance, contactInstance)
}

async function _fetchInvoiceAccount (invoiceAccountId) {
  return InvoiceAccountModel.query()
    .findById(invoiceAccountId)
    .withGraphFetched('company')
    .modifyGraph('company', (builder) => {
      builder.select([
        'name'
      ])
    })
}

async function _persist (timestamp, invoiceAccount, address, company, contact) {
  const persistedData = {}

  await InvoiceAccountModel.transaction(async (trx) => {
    persistedData.address = await _persistAddress(trx, address)
    persistedData.agentCompany = await _persistCompany(trx, company)
    persistedData.contact = await _persistContact(trx, contact)

    const invoiceAccountAddress = InvoiceAccountAddressModel.fromJson({
      invoiceAccountId: invoiceAccount.invoiceAccountId,
      addressId: persistedData.address.addressId,
      agentCompanyId: persistedData.agentCompany.companyId,
      contactId: persistedData.contact.contactId,
      startDate: timestamp,
      endDate: null
    })

    await _patchInvoiceAccountAddress(trx, invoiceAccount.invoiceAccountId, timestamp)
    persistedData.invoiceAccountAddress = await _persistInvoiceAccountAddress(trx, invoiceAccountAddress)
  })

  return persistedData
}

async function _patchInvoiceAccountAddress (trx, invoiceAccountId, endDate) {
  return InvoiceAccountAddressModel.query(trx)
    .patch({
      endDate
    })
    .where('invoiceAccountId', invoiceAccountId)
}

async function _persistInvoiceAccountAddress (trx, invoiceAccountAddress) {
  return invoiceAccountAddress.$query(trx)
    .insert()
    .onConflict(['invoiceAccountId', 'startDate'])
    // If a conflict is found this specifies what fields should get updated
    .merge([
      'addressId',
      'agentCompanyId',
      'contactId',
      'endDate'
    ])
}

/**
 * Persist the address entered during the change address process
 *
 * If the address has an `id:` we assume it was an existing address selected during the journey. So, the address is
 * already persisted hence we just return `address`.
 *
 * Else we attempt to insert a new address record. If the address has a `uprn:` it will be an one selected from the
 * address lookup page. The previous team also added a unique constraint on UPRN in the table so we cannot insert 2
 * records with matching UPRNs. But we use this to our advantage. Using `onConflict()` and `merge()` we can have
 * Objection JS update the existing address record if one with a matching UPRN exists.
 *
 * Because either INSERT or UPDATE gets fired `returning()` will kick in and return the all important `addressId` which
 * we'll need later in the service. It will also return the fields specified in the INSERT/UPDATE hence we get a
 * 'complete' address back that we can return to the calling function.
 *
 * > We are aware that the existing DB design means multiple billing accounts may refer to the same address record. By
 * > updating an address record we could be updating the address for multiple records. This is why the existing DB
 * > design is _bad_! Ideally, billing accounts should have their own address records and we don't worry about
 * > duplication. This then avoids the problem. But until we can amend the DB design it is better that where a record
 * > in our DB is locked to OS Places, it should reflect whatever OS Places currently returns, not what it returned
 * > when first added.
 *
 * @param {Object} trx Objection database
 *   {@link https://vincit.github.io/objection.js/guide/transactions.html | transaction} object to be used in the query
 * @param {Object} address the address to be persisted
 *
 * @returns {Object} The persisted address
 */
async function _persistAddress (trx, address) {
  if (address.addressId) {
    return address
  }

  return address.$query(trx)
    .insert()
    .onConflict('uprn')
    // If a conflict is found this specifies what fields should get updated
    .merge([
      'address1',
      'address2',
      'address3',
      'address4',
      'town',
      'county',
      'country',
      'postcode',
      'dateUpdated'
    ])
    .returning([
      'addressId'
    ])
}

/**
 * Persist the company entered during the change address process
 *
 * If the company is not set then the user has opted not to change the agent in the journey. So, we just return the
 * empty company.
 *
 * Else we attempt to insert a new company record. If the company has a `companyNumber:` it will either be an existing
 * company record selected by the user, or they will have been required to enter the company number. The previous team
 * added a unique constraint on `company_number` in the table so we cannot insert 2 records records with matching
 * numbers. But we use this to our advantage. Using `onConflict()` and `merge()` we can have Objection JS update the
 * existing company record if one with a matching company number exists.
 *
 * Because either INSERT or UPDATE gets fired `returning()` will kick in and return the all important `companyId` which
 * we'll need later in the service. It will also return the fields specified in the INSERT/UPDATE hence we get a
 * 'complete' company back that we can return in the response we eventually send back.
 *
 * > We are aware that the existing DB design means multiple billing accounts may refer to the same company record. By
 * > updating a company record we could be updating the company for multiple records. This is why the existing DB design
 * > is _bad_! Ideally, billing accounts should have their own company records and you don't worry about duplication.
 * > This then avoids the problem. But until we can amend the DB design it is better that where a record in our DB is
 * > locked to Companies House, it should reflect whatever Companies House currently returns, not what it returned when
 * > first added.
 *
 * @param {Object} trx Objection database
 * {@link https://vincit.github.io/objection.js/guide/transactions.html | transaction} object to be used in the query
 * @param {Object} company the company to be persisted
 *
 * @returns {Object} The persisted company
 */
async function _persistCompany (trx, company) {
  if (!company) {
    return company
  }

  return company.$query(trx)
    .insert()
    .onConflict('companyNumber')
    // If a conflict is found this specifies what fields should get updated
    .merge([
      'name',
      'dateUpdated'
    ])
    .returning([
      'companyId'
    ])
}

async function _persistContact (trx, contact) {
  if (!contact) {
    return contact
  }

  // NOTE: The only constraint in contacts which would lead to a conflict is email. But it is not collected as part of
  // the journey. So, we don't have to include `onConflict()` and `merge()`
  return contact.$query(trx)
    .insert()
    .returning([
      'contactId'
    ])
}

function _transformAddress (timestamp, address) {
  const { id: addressId, addressLine1: address1, addressLine2: address2, addressLine3: address3, addressLine4: address4, town, county, country, postcode, uprn } = address

  return AddressModel.fromJson({
    addressId,
    address1,
    address2,
    address3,
    address4,
    town,
    county,
    country,
    postcode,
    uprn,
    dataSource: 'wrls',
    dateCreated: timestamp,
    dateUpdated: timestamp
  })
}

function _transformCompany (timestamp, company) {
  const { type, name, companyNumber } = company

  return CompanyModel.fromJson({
    type,
    name,
    companyNumber,
    dateCreated: timestamp,
    dateUpdated: timestamp
  })
}

function _transformContact (timestamp, contact) {
  const { type: contactType, salutation, firstName, middleInitials, lastName, suffix, department } = contact

  return ContactModel.fromJson({
    contactType,
    salutation,
    firstName,
    middleInitials,
    lastName,
    suffix,
    department,
    dataSource: 'wrls',
    dateCreated: timestamp,
    dateUpdated: timestamp
  })
}

module.exports = {
  go
}
