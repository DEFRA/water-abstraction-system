'use strict'

/**
 * Sends customer changes to the Charging Module
 * @module SendCustomerChangeService
 */

const ChargingModuleCreateCustomerChangeRequest = require('../../requests/charging-module/create-customer-change.request.js')
const CreateCustomerChangePresenter = require('../../presenters/charging-module/create-customer-change.presenter.js')
const ExpandedError = require('../../errors/expanded.error.js')

/**
 * Generates the customer change request data from the model instances provided and sends it to the Charging Module
 *
 * When a change is made to a billing account in WRLS the Charging Module API needs to be told. It is responsible for
 * generating the customer data feed to SOP which will be used when invoices are generated from the bill runs we also
 * send it.
 *
 * This service handles taking the data forwarded from the UI, formatting it via a presenter into what the CHA expects
 * and then sending the
 * {@link https://defra.github.io/sroc-charging-module-api-docs/#/customer/CreateCustomerChange | POST request}.
 *
 * Should the request fail it will generate and throw an error.
 *
 * @param {module:BillingAccountModel} billingAccount - The billing account we are changing the address details
 * for
 * @param {module:AddressModel} address - The new address
 * @param {module:CompanyModel} company - The agent company for the billing account if one was selected or setup by the
 * user during the change address journey
 * @param {module:ContactModel} contact - The new contact for the billing account if an FAO was setup by the user during
 * the change address journey
 */
async function go (billingAccount, address, company, contact) {
  const requestData = CreateCustomerChangePresenter.go(billingAccount, address, company, contact)

  const result = await ChargingModuleCreateCustomerChangeRequest.send(requestData)

  if (!result.succeeded) {
    throw new ExpandedError('Customer change failed to send', { billingAccountId: billingAccount.id })
  }
}

module.exports = {
  go
}
