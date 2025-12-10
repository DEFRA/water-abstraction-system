'use strict'

/**
 * Formats recipients into notifications for a standard or ad-hoc returns invitation or reminder
 * @module NotificationsPresenter
 */

const NotifyAddressPresenter = require('./notify-address.presenter.js')
const { formatLongDate } = require('../../base.presenter.js')
const { futureDueDate } = require('../base.presenter.js')
const { NOTIFY_TEMPLATES } = require('../../../lib/notify-templates.lib.js')

const featureFlagsConfig = require('../../../../config/feature-flags.config.js')

const MESSAGE_REFS = {
  alternateInvitations: {
    adhoc: 'returns invitation alternate',
    standard: 'returns invitation alternate'
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
  const dueDate = _dueDate(session, messageType)

  return {
    contactType: recipient.contact_type,
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
    templateId: NOTIFY_TEMPLATES[noticeType][journey][messageType][recipient.contact_type]
  }
}

function _dueDate(session, messageType) {
  if (featureFlagsConfig.enableNullDueDate) {
    return session?.latestDueDate ?? futureDueDate(messageType)
  }

  return session?.determinedReturnsPeriod?.dueDate ?? futureDueDate(messageType)
}

function _letter(recipient, noticeId, session) {
  const { determinedReturnsPeriod, journey, noticeType } = session

  const messageType = 'letter'
  const address = NotifyAddressPresenter.go(recipient.contact)
  const dueDate = _dueDate(session, messageType)

  return {
    contactType: recipient.contact_type,
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
    templateId: NOTIFY_TEMPLATES[noticeType][journey][messageType][recipient.contact_type]
  }
}

module.exports = {
  go
}
