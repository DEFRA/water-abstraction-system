'use strict'

/**
 * Formats recipients into notifications for a standard or ad-hoc returns invitation or reminder
 * @module NotificationsPresenter
 */

const NotifyAddressPresenter = require('./notify-address.presenter.js')
const { formatLongDate } = require('../../base.presenter.js')
const { futureDueDate } = require('../base.presenter.js')
const { notifyTemplates } = require('../../../lib/notify-templates.lib.js')

const featureFlagsConfig = require('../../../../config/feature-flags.config.js')

const MESSAGE_REFS = {
  failedInvitations: {
    adhoc: 'returns invitation failed',
    standard: 'returns invitation failed'
  },
  invitations: {
    adhoc: 'returns invitation ad-hoc',
    standard: 'returns invitation'
  },
  reminders: {
    adhoc: 'returns reminder ad-hoc',
    standard: 'returns reminder'
  }
}

/**
 * Formats recipients into notifications for a standard or ad-hoc returns invitation or reminder
 *
 * The notifications returned are intended to both be persisted to the DB and used to formulate the request to Notify.
 *
 * It also populates the record in the same way as the legacy code to avoid breaking any existing functionality.
 *
 * @param {object} session - The session instance
 * @param {object[]} recipients - List of recipients, each containing details like email or address of the recipient
 * @param {string} noticeId - The UUID of the notice these notifications should be linked to
 *
 * @returns {object[]} the recipients transformed into notifications
 */
function go(session, recipients, noticeId) {
  const notifications = []

  for (const recipient of recipients) {
    let notification

    if (recipient.email) {
      notification = _email(recipient, noticeId, session)
    } else {
      notification = _letter(recipient, noticeId, session)
    }

    notifications.push(notification)
  }

  return notifications
}

function _email(recipient, noticeId, session) {
  const { determinedReturnsPeriod, journey, noticeType } = session

  const messageType = 'email'
  const templateId = _emailTemplate(recipient.contact_type, journey, noticeType)
  const dueDate = _dueDate(session, messageType)

  return {
    dueDate,
    eventId: noticeId,
    licences: recipient.licence_refs,
    messageType,
    messageRef: MESSAGE_REFS[noticeType][journey],
    personalisation: {
      periodEndDate: formatLongDate(determinedReturnsPeriod?.endDate),
      periodStartDate: formatLongDate(determinedReturnsPeriod?.startDate),
      returnDueDate: formatLongDate(dueDate)
    },
    recipient: recipient.email,
    returnLogIds: recipient.return_log_ids,
    status: 'pending',
    templateId
  }
}

function _dueDate(session, messageType) {
  if (featureFlagsConfig.enableNullDueDate) {
    return session?.latestDueDate ?? futureDueDate(messageType)
  }

  return session?.determinedReturnsPeriod?.dueDate ?? futureDueDate(messageType)
}

function _emailTemplate(contactType, journey, noticeType) {
  if (contactType === 'Returns agent') {
    return notifyTemplates[journey][noticeType].returnsAgentEmail
  }

  return notifyTemplates[journey][noticeType].primaryUserEmail
}

function _letter(recipient, noticeId, session) {
  const { determinedReturnsPeriod, journey, noticeType } = session

  const messageType = 'letter'
  const templateId = _letterTemplate(recipient.contact_type, journey, noticeType)
  const address = NotifyAddressPresenter.go(recipient.contact)
  const dueDate = _dueDate(session, messageType)

  return {
    dueDate,
    eventId: noticeId,
    licences: recipient.licence_refs,
    messageType,
    messageRef: MESSAGE_REFS[noticeType][journey],
    personalisation: {
      ...address,
      periodEndDate: formatLongDate(determinedReturnsPeriod?.endDate),
      periodStartDate: formatLongDate(determinedReturnsPeriod?.startDate),
      returnDueDate: formatLongDate(dueDate),
      // NOTE: Address line 1 is always set to the recipient's name
      name: address.address_line_1
    },
    returnLogIds: recipient.return_log_ids,
    status: 'pending',
    templateId
  }
}

function _letterTemplate(contactType, journey, noticeType) {
  if (contactType === 'Returns to') {
    return notifyTemplates[journey][noticeType].returnsToLetter
  }

  return notifyTemplates[journey][noticeType].licenceHolderLetter
}

module.exports = {
  go
}
