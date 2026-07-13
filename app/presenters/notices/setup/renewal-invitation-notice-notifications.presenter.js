/**
 * Formats recipients into notifications for a renewal invitation
 * @module RenewalInvitationNotificationsPresenter
 */

import NotifyAddressPresenter from './notify-address.presenter.js'
import { NOTIFY_TEMPLATES } from '../../../lib/notify-templates.lib.js'
import { formatLongDate } from '../../base.presenter.js'

const MESSAGE_REFS = {
  adhoc: 'renewal invitation ad-hoc',
  standard: 'renewal invitation'
}

/**
 * Formats recipients into notifications for a renewal invitation
 *
 * @param {object} noticeData - The notice data
 * @param {object[]} recipients - List of recipients, each containing details like email or address of the recipient
 * @param {string} noticeId - The UUID of the notice these notifications should be linked to
 *
 * @returns {object[]} the recipients transformed into notifications
 */
export default function renewalInvitationNoticeNotificationsPresenter(noticeData, recipients, noticeId) {
  const notifications = []

  for (const recipient of recipients) {
    let notification

    if (recipient.message_type === 'Email') {
      notification = _email(recipient, noticeId, noticeData)
    } else {
      notification = _letter(recipient, noticeId, noticeData)
    }

    notifications.push(notification)
  }

  return notifications
}

function _email(recipient, noticeId, noticeData) {
  const { journey, noticeType } = noticeData

  const messageType = 'email'

  return {
    contactType: recipient.contact_type,
    eventId: noticeId,
    licences: recipient.licence_refs,
    messageType,
    messageRef: MESSAGE_REFS[journey],
    personalisation: {
      ..._personalisation(recipient, noticeData)
    },
    recipient: recipient.email,
    status: 'pending',
    templateId: NOTIFY_TEMPLATES[noticeType][journey][messageType][_templateType(recipient)]
  }
}

function _letter(recipient, noticeId, noticeData) {
  const { journey, noticeType } = noticeData

  const messageType = 'letter'
  const address = NotifyAddressPresenter(recipient.contact)

  return {
    contactType: recipient.contact_type,
    eventId: noticeId,
    licences: recipient.licence_refs,
    messageType,
    messageRef: MESSAGE_REFS[journey],
    personalisation: {
      ...address,
      // NOTE: Address line 1 is always set to the recipient's name
      name: address.address_line_1,
      ..._personalisation(recipient, noticeData)
    },
    status: 'pending',
    templateId: NOTIFY_TEMPLATES[noticeType][journey][messageType][_templateType(recipient)]
  }
}

function _personalisation(recipient, noticeData) {
  const personalisation = {
    renewalDate: formatLongDate(noticeData.renewalDate),
    expiryDate: formatLongDate(noticeData.expiryDate)
  }

  if (recipient.licence_refs.length > 1) {
    personalisation.licenceRefs = recipient.licence_refs.join(', ')
  } else {
    personalisation.licenceRef = recipient.licence_refs[0]
  }

  return personalisation
}

function _templateType(recipient) {
  if (recipient.licence_refs.length > 1) {
    return 'multiple licences'
  }

  return 'single licence'
}
