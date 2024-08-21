'use strict'

/**
 * Manages changing the address for a billing account
 * @module ChangeAddressService
 */

const AddressModel = require('../../models/address.model.js')
const BillingAccountAddressModel = require('../../models/billing-account-address.model.js')
const BillingAccountModel = require('../../models/billing-account.model.js')
const CompanyModel = require('../../models/company.model.js')
const ContactModel = require('../../models/contact.model.js')
const SendCustomerChangeService = require('./send-customer-change.service.js')

/**
 * Manages the changing of an address for a billing (invoice) account
 *
 * Within the service an internal user can 'Change the address' of a billing account. That is what the button says but
 * they can also change or set the agent company and the contact along with the address.
 *
 * Behind the scenes a new `billing_account_address` record is created that links to the `addresses`, `companies` and
 * `contacts` records. It will also be linked to the `billing_account` which represents the billing account being
 * amended.
 *
 * It won't have an end date, which marks it as the 'current' address. The previous `billing_account_address` will get
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
 * - where possible, duplication of records has tried to be avoided. For example, you cannot have 2 addresses with the
 *   same UPRN, or 2 companies with the same company number. The problem is the source data _does_ change. We have seen
 *   the OS Places result for Horizon House change from Environment Agency, to Natural England, Defra and back to the
 *   Environment Agency over the years. This means when a user changes the address, for example, they may actually be
 *   selecting one that already exists based on UPRN, in which case we are not inserting a new record but using an
 *   existing one
 *
 * Add to that all SOP wants is a name and address which means we have to do a lot of work to format the data we receive
 * into something the CHA will accept.
 *
 * @param {string} billingAccountId - The UUID for the billing account being updated
 * @param {object} address - The validated address details
 * @param {object} [agentCompany] - The validated agent company details
 * @param {object} [contact] - The validated contact details
 *
 * @returns {Promise<object>} contains a copy of the persisted address, agent company and contact if they were also
 * changed
 */
async function go (billingAccountId, address, agentCompany = {}, contact = {}) {
  const billingAccount = await _fetchBillingAccount(billingAccountId)

  // We use the same timestamp for all date created/updated values. We then have something to tie together all the
  // changes we apply
  const timestamp = new Date()

  // NOTE: The presenter in `SendCustomerChangeService` relies on being able to call `$name()` on the contact instance.
  // This is implemented in the `ContactModel`, which means we need to transform the validated contact data into an
  // instance of `ContactModel`. So, we thought if we are doing it for contact why not do it for the rest? This way
  // any subsequent functions/services can handle all 3 in a consistent way.
  const addressInstance = _transformAddress(timestamp, address)
  const companyInstance = _transformCompany(timestamp, agentCompany)
  const contactInstance = _transformContact(timestamp, contact)

  // NOTE: The order we let the Charging Module know about the change and persist the data to our own DB is important.
  // In the legacy code we updated our DB first then let the Charging Module know. But if the CHA request failed it
  // would appear to the user all was well; the address is updated in our service.
  //
  // Now we attempt to update the CHA first. We only attempt to update our DB if it succeeded (it will throw an error if
  // it doesn't). If the CHA fails the user will know. If the CHA succeeds but our update fails the user will still see
  // an error and try again. It matters not that we send the same information to the CHA; either way it will overwrite
  // what is either in it or SOP. But this way the user is never left believing all is well when something has failed.
  await SendCustomerChangeService.go(billingAccount, addressInstance, companyInstance, contactInstance)

  const persistedData = await _persist(timestamp, billingAccount, addressInstance, companyInstance, contactInstance)

  return _response(persistedData)
}

async function _fetchBillingAccount (billingAccountId) {
  return BillingAccountModel.query()
    .findById(billingAccountId)
    .withGraphFetched('company')
    .modifyGraph('company', (builder) => {
      builder.select([
        'name'
      ])
    })
}

/**
 * Persist the changes to the WRLS database
 *
 * Any changes that need to be made to the WRLS DB are done here. We do them in a
 * {@link https://vincit.github.io/objection.js/guide/transactions.html | transaction} object to ensure they either all
 * get applied, or none do (no partial updates here!)
 *
 * When a user changes a billing account address we expect as a minimum that an 'address' will be passed to this
 * service. Agent company and contact can be null though. But before the service calls this method it will transform all
 * 3 into their respective model instances. So, address will always be populated, but company and contact might be empty
 * instances.
 *
 * We attempt to persist the address, company and contact model instances first because we need their IDs in order to
 * create the new `billing_account_addresses` record. When we create that record we also need to apply an end date to
 * any existing billing account addresses with a null end date. This is how the service determines which address details
 * are current (end date is null).
 *
 * The object we return has all 3 entities whether they were persisted or not. This gets passed back to the UI via the
 * controller and is what it needs to then be able to redirect the user to the correct page.
 *
 * @param {Date} timestamp - the timestamp to be used for any date created or updated values when persisting
 * @param {module:BillingAccountModel} billingAccount - the billing account having its address changed
 * @param {module:AddressModel} address - the new address to be persisted (expected to be populated)
 * @param {module:CompanyModel} company - the new agent company to be persisted (not expected to be populated)
 * @param {module:ContactModel} contact - the new contact to be persisted (not expected to be populated)
 *
 * @returns {Promise<object>} a single object that contains the persisted billingAccountAddress, plus address, agent
 * company and contact
 */
async function _persist (timestamp, billingAccount, address, company, contact) {
  const persistedData = {}

  await BillingAccountModel.transaction(async (trx) => {
    persistedData.address = await _persistAddress(trx, address)
    persistedData.company = await _persistCompany(trx, company)
    persistedData.contact = await _persistContact(trx, contact)

    const billingAccountAddress = BillingAccountAddressModel.fromJson({
      billingAccountId: billingAccount.id,
      addressId: persistedData.address.id,
      companyId: persistedData.company.id,
      contactId: persistedData.contact.id,
      startDate: timestamp,
      endDate: null,
      createdAt: timestamp,
      updatedAt: timestamp
    })

    await _patchExistingBillingAccountAddressEndDate(trx, billingAccount.id, timestamp)
    persistedData.billingAccountAddress = await _persistBillingAccountAddress(trx, billingAccountAddress)
  })

  return persistedData
}

async function _patchExistingBillingAccountAddressEndDate (trx, billingAccountId, timestamp) {
  // The timestamp represents the current date and time we're making this change, i.e. today. So, the new billing
  // account address will start from today. To show that the old record is no longer current, we need to set its
  // `endDate` to be today - 1 (yesterday). The following works it all out even if we're over a month or year boundary
  // and no moment() in sight! Thanks to https://stackoverflow.com/a/1296374 for how to do this
  const endDate = new Date()

  endDate.setDate(timestamp.getDate() - 1)

  await BillingAccountAddressModel.query(trx)
    .patch({
      endDate,
      updatedAt: timestamp
    })
    .where('billingAccountId', billingAccountId)
    .whereNull('endDate')
}

/**
 * Persist the new billing account address
 *
 * The legacy code included logic to handle a situation where the start date and billing account ID are the same. This
 * could happen if you make a change to a billing account's address more than once on the same day. It would first
 * SELECT any records where that was the case and then DELETE them.
 *
 * We can get the same result with a single query by using `onConflict()`. If we get a match we just overwrite the
 * existing record with our new data.
 *
 * @private
 */
async function _persistBillingAccountAddress (trx, billingAccountAddress) {
  return billingAccountAddress.$query(trx)
    .insert()
    .onConflict(['billingAccountId', 'startDate'])
    // If a conflict is found this specifies what fields should get updated
    .merge([
      'addressId',
      'companyId',
      'contactId',
      'endDate',
      'updatedAt'
    ])
}

/**
 * Persist the address entered during the change address process
 *
 * If the address has an `id:` we assume it was an existing address selected during the journey. So, the address
 * is already persisted hence we just return `address`.
 *
 * Else we attempt to insert a new address record. If the address has a `uprn:` it will be one selected from the
 * address lookup page. The previous team also added a unique constraint on UPRN in the table so we cannot insert 2
 * records with matching UPRNs. But we use this to our advantage. Using `onConflict()` and `merge()` we can have
 * Objection JS update the existing address record if a matching UPRN exists.
 *
 * Because either INSERT or UPDATE gets fired `returning()` will kick in and return the all important `id` which
 * we'll need later for the billing account address. It will also return the fields specified in the INSERT/UPDATE hence
 * we get a 'complete' address back that we can return to the calling function.
 *
 * > NOTE: We are aware that the existing DB design means multiple billing accounts may refer to the same address
 * > record. By updating an address record we could be updating the address for multiple records. This is why the
 * > existing DB design is _bad_! Ideally, billing accounts should have their own address records and we don't worry
 * > about duplication. This then avoids the problem. But until we can amend the DB design it is better that where a
 * > record in our DB is locked to OS Places, it should reflect whatever OS Places currently returns, not what it
 * > returned when first added.
 *
 * @private
 */
async function _persistAddress (trx, address) {
  if (address.id) {
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
      'address5',
      'address6',
      'country',
      'postcode',
      'updatedAt'
    ])
    .returning([
      'id'
    ])
}

/**
 * Persist the company (Agent) entered during the change address process
 *
 * If the company has an `id:` we assume it was an existing company selected during the journey. So, the company
 * is already persisted hence we just return `company`. If the company name is not set then the user has opted not to
 * change the agent in the journey. So, we just return the empty `CompanyModel` instance.
 *
 * Else we attempt to insert a new company record. If the company has a `companyNumber:` it will either be an existing
 * company record selected by the user, or they will have been required to enter the company number. The previous team
 * added a unique constraint on `company_number` in the table so we cannot insert 2 records with matching numbers. But
 * we use this to our advantage. Using `onConflict()` and `merge()` we can have Objection JS update the existing company
 * record if a matching company number exists.
 *
 * Because either INSERT or UPDATE gets fired `returning()` will kick in and return the all important `id` which
 * we'll need later for the billing account address. It will also return the fields specified in the INSERT/UPDATE hence
 * we get a 'complete' company back that we can return to the calling function.
 *
 * > NOTE: We are aware that the existing DB design means multiple billing accounts may refer to the same company
 * > record. By updating a company record we could be updating the company for multiple records. This is why the
 * > existing DB design is _bad_! Ideally, billing accounts should have their own company records and you don't worry
 * > about duplication. This then avoids the problem. But until we can amend the DB design it is better that where a
 * > record in our DB is locked to Companies House, it should reflect whatever Companies House currently returns, not
 * > what it returned when first added.
 *
 * @private
 */
async function _persistCompany (trx, company) {
  if (company.id || !company.name) {
    return company
  }

  return company.$query(trx)
    .insert()
    .onConflict('companyNumber')
    // If a conflict is found this specifies what fields should get updated
    .merge([
      'name',
      'updatedAt'
    ])
    .returning([
      'id'
    ])
}

/**
 * Persist the contact (FAO) entered during the change address process
 *
 * If the contact type is not set then the user has opted not to apply an FAO in the journey. So, we just return the
 * empty `ContactModel` instance.
 *
 * @private
 */
async function _persistContact (trx, contact) {
  if (!contact.contactType) {
    return contact
  }

  // NOTE: The only constraint in contacts which would lead to a conflict is email. But it is not collected as part of
  // the journey. So, we don't have to include `onConflict()` and `merge()`
  return contact.$query(trx)
    .insert()
    .returning([
      'id'
    ])
}

/**
 * Format the model instances we persisted into a 'clean' response
 *
 * If there was a problem with the Address or the BillingAccountAddress when persisting we wouldn't get here. So, we can
 * always assume they are populated.
 *
 * The same cannot be said for company and contact. If null data was passed into the service these will be empty model
 * instances in `persistedData`. Rather than return these empty instances we return null reflecting what was originally
 * passed in.
 *
 * Finally, where we do have populated instances we destructure them. This transforms the model instances into POJO's
 * again just making things cleaner.
 *
 * @private
 */
function _response (persistedData) {
  const { address, company, contact, billingAccountAddress } = persistedData

  return {
    billingAccountAddress: { ...billingAccountAddress },
    address: { ...address },
    agentCompany: company.id ? { ...company } : null,
    contact: contact.id ? { ...contact } : null
  }
}

function _transformAddress (timestamp, address) {
  return AddressModel.fromJson({
    id: address.addressId,
    address1: address.addressLine1,
    address2: address.addressLine2,
    address3: address.addressLine3,
    address4: address.addressLine4,
    address5: address.town,
    address6: address.county,
    country: address.country,
    postcode: address.postcode,
    uprn: address.uprn,
    dataSource: 'wrls',
    createdAt: timestamp,
    updatedAt: timestamp
  })
}

function _transformCompany (timestamp, company) {
  return CompanyModel.fromJson({
    id: company.companyId,
    type: company.type,
    name: company.name,
    companyNumber: company.companyNumber,
    organisationType: company.organisationType,
    createdAt: timestamp,
    updatedAt: timestamp
  })
}

function _transformContact (timestamp, contact) {
  return ContactModel.fromJson({
    contactType: contact.type,
    salutation: contact.salutation,
    firstName: contact.firstName,
    middleInitials: contact.middleInitials,
    lastName: contact.lastName,
    suffix: contact.suffix,
    department: contact.department,
    dataSource: 'wrls',
    createdAt: timestamp,
    updatedAt: timestamp
  })
}

module.exports = {
  go
}
