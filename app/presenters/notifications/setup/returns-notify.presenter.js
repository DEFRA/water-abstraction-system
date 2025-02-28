'use strict'

/**
 * Formats data to send to notify for a returns invitation and reminder
 * @module ReturnsNotifyPresenter
 */

const { notifyTemplates } = require('../../../lib/notify-templates.lib.js')
const { contactName, contactAddress } = require('../../crm.presenter.js')
const { formatLongDate } = require('../../base.presenter.js')

/**
 * Formats data to send to notify for a returns invitation and reminder
 *
 * A returns invitation or reminder will need to send a letter or email to notify. The basic structure for notify:
 *
 * ```javascript
 *   const options = {
 *       personalisation: {
 *         periodEndDate: '30th January 2021',
 *         periodStartDate: '1st January 2021',
 *         returnDueDate: '28 April 2025'
 *       },
 *       reference: 'ABC-123' // This will be the reference code we set when the session is initialised
 *     }
 * ```
 *
 * > For an email we need to provide an email address:
 *
 * ```javascript
 *   const options = {
 *       emailAddress: 'hello@world.com
 *       personalisation: {
 *         periodEndDate: '30th January 2021',
 *         periodStartDate: '1st January 2021',
 *         returnDueDate: '28 April 2025'
 *       },
 *       reference: 'ABC-123' // This will be the reference code we set when the session is initialised
 *     }
 * ```
 *
 * > For a letter we need to provide an address:
 *
 * ```javascript
 *   const options = {
 *       personalisation: {
 *        //The address must have at least 3 lines.
 *        "address_line_1": "Amala Bird", // required string
 *        "address_line_2": "123 High Street", // required string
 *        "address_line_3": "Richmond upon Thames", // required string
 *        "address_line_4": "Middlesex",
 *        "address_line_5": "SW14 6BF",  // last line of address you include must be a postcode or a country name  outside the UK
 *        name: 'test', // matches the template placeholder {{ name }}
 *       },
 *       reference: 'ABC-123' // A unique identifier which identifies a single unique message or a batch of messages
 *     }
 * ```
 *
 * **The notify api has been updated to expect the
 * [postcode as the last address line.](https://docs.notifications.service.gov.uk/node.html#send-a-letter-arguments)**
 *
 * @param {object[]} recipients
 * @param {object} returnsPeriod - the return period including the periodEndDate, periodStartDate and returnDueDate
 * @param {string} referenceCode - the unique code to group the notifications in notify and our database
 * @param {string} journey - the journey should be either "reminders" or "invitations"
 *
 * @returns {object[]} - the recipients transformed into the notifications structure
 */
function go(recipients, returnsPeriod, referenceCode, journey) {
  // Need to hande the journey for reminder and invitation - update templates
  return recipients.map((recipient) => {
    if (recipient.email) {
      return _email(recipient, returnsPeriod, referenceCode, journey)
    } else {
      return _letter(recipient, returnsPeriod, referenceCode, journey)
    }
  })
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

function _email(recipient, returnsPeriod, referenceCode, journey) {
  const templateId = _emailTemplate(recipient, journey)

  return {
    templateId,
    emailAddress: recipient.email,
    options: {
      personalisation: {
        ..._returnsPeriod(returnsPeriod)
      },
      reference: referenceCode
    }
  }
}

function _emailTemplate(recipient, journey) {
  if (recipient.contact_type === 'Primary user') {
    return notifyTemplates.returns[journey].primaryUserEmail
  } else if (recipient.contact_type === 'Returns agent') {
    return notifyTemplates.returns[journey].returnsAgentEmail
  } else {
    // It will be both
    // We need the template id for this both
    return notifyTemplates.returns[journey].primaryUserEmail
  }
}

function _letter(recipient, returnsPeriod, referenceCode, journey) {
  const name = contactName(recipient.contact)

  const templateId = _letterTemplate(recipient, journey)

  return {
    templateId,
    options: {
      personalisation: {
        name,
        ..._addressLines(recipient),
        ..._returnsPeriod(returnsPeriod)
      },
      reference: referenceCode
    }
  }
}

function _letterTemplate(recipient, journey) {
  if (recipient.contact_type === 'Licence holder') {
    return notifyTemplates.returns[journey].licenceHolderLetter
  } else if (recipient.contact_type === 'Returns to') {
    return notifyTemplates.returns[journey].returnsToLetter
  } else {
    // It will be both
    // We need the template id for this both
    return notifyTemplates.returns[journey].licenceHolderLetter
  }
}

function _returnsPeriod(returnsPeriod) {
  return {
    periodEndDate: formatLongDate(returnsPeriod.periodEndDate),
    periodStartDate: formatLongDate(returnsPeriod.periodStartDate),
    returnDueDate: formatLongDate(returnsPeriod.returnDueDate)
  }
}

module.exports = {
  go
}
