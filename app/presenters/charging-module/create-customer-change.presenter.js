'use strict'

/**
 * Generates the Charging Module create customer request from an WRLS invoice account
 * @module ChargingModuleCreateCustomerChangePresenter
 */

/**
 * Extracts the request body needed for the Charging ModuleAPI  `/customer-changes` endpoint
 *
 * For reference the schema for the request body is
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
 * Anything not set in the body the Charging Module API will set to `null` in the record it sends to SSCL.
 *
 * @param {module:InvoiceAccountModel} invoiceAccount Instance of `InvoiceAccountModel` to be formatted
 */
function go (invoiceAccount, address, company, contact) {
  const { invoiceAccountNumber: customerReference } = invoiceAccount

  const region = customerReference.charAt(0)
  const customerName = _customerName(invoiceAccount, company)
  const formattedAddress = _formattedAddress(address, contact)

  return {
    region,
    customerReference,
    customerName,
    ...formattedAddress
  }
}

function _customerName (invoiceAccount, company) {
  if (company.name) {
    return company.name
  }

  return invoiceAccount.company.name
}

function _formattedAddress (address, contact) {
  const addressLines = []

  const { address1, address2, address3, address4, town, county, country, postcode } = address
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
      addressLines[0] = _truncate(`${fao}, ${addressLines[0]}`, 240)
    } else {
      addressLines.unshift(_truncate(fao, 240))
    }
  }

  const formattedAddress = {}
  addressLines.forEach((line, index) => {
    formattedAddress[`addressLine${index + 1}`] = line
  })

  formattedAddress.addressLine5 = _truncate(town, 60)
  formattedAddress.addressLine6 = _truncate(_addressLine6(county, country), 60)
  formattedAddress.postcode = _truncate(postcode, 60)

  return formattedAddress
}

function _addressLine6 (county, country) {
  if (!county && !country) {
    return ''
  }

  if (county && country) {
    return `${county}, ${country}`
  }

  if (county) {
    return county
  }

  return country
}

/**
 * Truncates a string adding an ellipsis at the end to indicate that the string has been shortened
 *
 * @param {string} stringToTruncate The string to be truncated
 * @param {number} maximumLength The maximum length to the truncated string
 *
 * @returns {string} - The truncated string.
 */
function _truncate (stringToTruncate, maximumLength) {
  // Don't truncate if the string is equal to or less than maximum length
  if (stringToTruncate.length <= maximumLength) {
    return stringToTruncate
  }

  const truncatedString = stringToTruncate.slice(0, (maximumLength - 3))

  return `${truncatedString}...`
}

module.exports = {
  go
}
