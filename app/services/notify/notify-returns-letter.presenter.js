'use strict'

/**
 *
 * @module NotifyLetterPresenter
 */

const { notifyTemplates } = require('../../lib/notify-templates.lib.js')
const { contactName, contactAddress } = require('../../presenters/crm.presenter.js')

/**
 *
 * @param recipient
 * @param returnsPeriod
 * @param referenceCode
 */
function go(recipient, returnsPeriod, referenceCode) {
  const name = contactName(recipient.contact)

  return {
    templateId: notifyTemplates.returns.invitations.licenceHolderLetter,
    options: {
      personalisation: {
        name,
        ..._addressLines(recipient),
        periodEndDate: returnsPeriod.periodEndDate,
        periodStartDate: returnsPeriod.periodStartDate,
        returnDueDate: returnsPeriod.returnDueDate
      },
      reference: referenceCode
    }
  }
}

function _addressLines(recipient) {
  const address = contactAddress(recipient.contact)

  const addressLines = {}

  // FYI - The postcode personalisation argument has been replaced. If your template still uses postcode, Notify will treat it as the last line of the address.

  // address_line_1: 'Amala Bird', // required string
  // address_line_2: '123 High Street', // required string
  // address_line_3: 'Richmond upon Thames', // required string
  // address_line_4: 'Middlesex',
  // address_line_5: 'SW14 6BF', // last line of address you include must be a postcode or a country name  outside the UK
  for (const [index, value] of address.entries()) {
    addressLines[`address_line_${index + 1}`] = value
  }

  return addressLines
}

module.exports = {
  go
}
