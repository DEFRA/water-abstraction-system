'use strict'

/**
 *
 * @module NotifyEmailPresenter
 */

const { notifyTemplates } = require('../../lib/notify-templates.lib.js')

/**
 *
 * @param recipient
 * @param returnsPeriod
 * @param referenceCode
 */
function go(recipient, returnsPeriod, referenceCode) {
  return {
    // Need to work this out
    templateId: notifyTemplates.returns.invitations.primaryUserEmail,
    emailAddress: recipient.email,
    options: {
      personalisation: {
        periodEndDate: returnsPeriod.periodEndDate,
        periodStartDate: returnsPeriod.periodStartDate,
        returnDueDate: returnsPeriod.returnDueDate
      },
      reference: referenceCode
    }
  }
}

module.exports = {
  go
}
