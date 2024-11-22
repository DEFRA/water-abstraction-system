'use strict'

/**
 * Generates the Charging Module create customer request from an WRLS billing account
 * @module ChargingModuleCreateCustomerChangePresenter
 */

/**
 * Generates the request data needed for the Charging ModuleAPI  `/customer-changes` endpoint from the instances
 *
 * > NOTE: Because the presenter relies on call the `ContactModel`s `$name()` instance method we chose to build the
 * > presenter on the basis that all the object's passed in would be Objection JS model instances. However, where
 * > an instance has not been set, for example, the user didn't add an FAO to the new address the instance will
 * > be empty.
 *
 * The previous team opted to record 4 lines of address information, plus town, county, country and postcode. Added to
 * that they wished to give users the option to add an FAO. This means we have 9 lines of address information we have
 * to squeeze into 7.
 *
 * At time of implementation we are tasked with replicating the existing functionality and working with the existing
 * change address journey in the UI and the data it forwards to us. So, we have to replicate what the legacy code was
 * doing.
 *
 * In essence, if it can the presenter will just place the WRLS data as address lines 1 to 6. If it has too much data it
 * then makes decisions about concatenating the FAO and the first populated address line and whether to concatenate
 * county and country.
 *
 * The final twist is in WRLS only one of the 4 address lines need to be populated, it doesn't matter which. The CHA
 * requires `addressLine1` to be populated. So, the presenter has to 'squash' the 4 WRLS address lines to remove gaps
 * and ensure it has something to put in `addressLine1`.
 *
 * For reference the schema for the Charging Module request body is
 *
 * - region: 'B' (required)
 * - customerReference: 'B19120000A' max(12) (required)
 * - customerName: 'Mr W Aston' max(360) (required)
 * - addressLine1: 'Park Farm' max(240) (required)
 * - addressLine2: 'Sugar Lane' max(240)
 * - addressLine3: 'West Waterford' max(240)
 * - addressLine4: 'Angleton' max(240)
 * - addressLine5: 'Southampton' max(60)
 * - addressLine6: 'Hampshire' max(60)
 * - postcode: 'SO74 3KD' max(60)
 *
 * Anything set to null the Charging Module API will set to `null` in the record it sends to SSCL.
 *
 * @param {module:BillingAccountModel} billingAccount - the billing account having its address changed
 * (required)
 * @param {module:AddressModel} address - the address it is being changed to (required)
 * @param {module:CompanyModel} company - the agent company selected or created during the process (if the user made no
 * change to the agent company this should be an unset instance)
 * @param {module:ContactModel} contact - the contact created during the process (if the user did not create an FAO this
 * should be an unset instance)
 *
 * @returns {object} the request data needed in the format required by the Charging Module
 */
function go(billingAccount, address, company, contact) {
  const { accountNumber: customerReference } = billingAccount

  const region = customerReference.charAt(0)
  const customerName = _customerName(billingAccount, company)
  const formattedAddress = _formattedAddress(address, contact)

  return {
    region,
    customerReference,
    customerName,
    ...formattedAddress
  }
}

function _addressLine6(address6, country) {
  if (!address6 && !country) {
    return ''
  }

  if (address6 && country) {
    return `${address6}, ${country}`
  }

  if (address6) {
    return address6
  }

  return country
}

function _customerName(billingAccount, company) {
  if (company.name) {
    return company.name
  }

  return billingAccount.company.name
}

function _formattedAddress(address, contact) {
  const addressLines = []

  const { address1, address2, address3, address4, address5, address6, country, postcode } = address
  const contactName = contact.$name()

  if (address1) {
    addressLines.push(address1)
  }

  if (address2) {
    addressLines.push(_truncate(address2, 240))
  }

  if (address3) {
    addressLines.push(_truncate(address3, 240))
  }

  if (address4) {
    addressLines.push(_truncate(address4, 240))
  }

  if (contactName) {
    const fao = `FAO ${contactName}`

    if (addressLines.length === 4) {
      // If we already have 4 address lines we have to concatenate FAO and address1 as addressLine1
      addressLines[0] = _truncate(`${fao}, ${addressLines[0]}`, 240)
    } else {
      // else if we have less than 4 there is space to make FAO addressLine1 and push the other lines down
      addressLines.unshift(_truncate(fao, 240))
    }
  }

  return {
    addressLine1: addressLines[0],
    addressLine2: addressLines[1] ? addressLines[1] : null,
    addressLine3: addressLines[2] ? addressLines[2] : null,
    addressLine4: addressLines[3] ? addressLines[3] : null,
    // We have encountered instances of ton being null so we confirm we have something to truncate to avoid an error
    addressLine5: address5 ? _truncate(address5, 60) : null,
    addressLine6: _truncate(_addressLine6(address6, country), 60),
    postcode: _truncate(postcode, 60)
  }
}

/**
 * Truncates a string adding an ellipsis at the end to indicate that the string has been shortened
 *
 * @param {string} stringToTruncate - The string to be truncated
 * @param {number} maximumLength - The maximum length to the truncated string
 *
 * @returns {string} - The truncated string.
 *
 * @private
 */
function _truncate(stringToTruncate, maximumLength) {
  // Don't truncate if the string is equal to or less than maximum length
  if (stringToTruncate.length <= maximumLength) {
    return stringToTruncate
  }

  const truncatedString = stringToTruncate.slice(0, maximumLength - 3)

  return `${truncatedString}...`
}

module.exports = {
  go
}
