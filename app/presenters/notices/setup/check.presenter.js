'use strict'

/**
 * Formats data for the `/notices/setup/check` page
 * @module CheckPresenter
 */

const ContactPresenter = require('./contact.presenter.js')
const { defaultPageSize } = require('../../../../config/database.config.js')

const NOTIFICATION_TYPES = {
  abstractionAlerts: 'Abstraction alerts',
  returnForms: 'Return forms',
  invitations: 'Returns invitations',
  reminders: 'Returns reminders'
}

/**
 * Formats data for the `/notices/setup/check` page
 *
 * @param {object[]} recipients - List of recipient objects, each containing recipient details like email or name.
 * @param {number|string} page - The currently selected page
 * @param {object} pagination - The result from `PaginatorPresenter`
 * @param {object} session - The session instance
 *
 * @returns {object} - The data formatted for the view template
 */
function go(recipients, page, pagination, session) {
  const { noticeType, referenceCode } = session

  const formattedRecipients = _recipients(noticeType, page, recipients, session.id, session)

  return {
    defaultPageSize,
    links: _links(session),
    pageTitle: _pageTitle(page, pagination),
    readyToSend: `${NOTIFICATION_TYPES[noticeType]} are ready to send.`,
    recipients: formattedRecipients,
    recipientsAmount: recipients.length,
    referenceCode,
    warning: _warning(formattedRecipients)
  }
}

function _formatRecipients(noticeType, recipients, sessionId, session) {
  return recipients.map((recipient) => {
    const contact = ContactPresenter.go(recipient)

    return {
      contact,
      licences: recipient.licence_refs.split(','),
      method: `${recipient.message_type} - ${recipient.contact_type}`,
      previewLink: _previewLink(noticeType, recipient, sessionId, contact, session)
    }
  })
}

function _links(session) {
  const { id, journey } = session

  const links = {
    cancel: `/system/notices/setup/${id}/cancel`,
    download: `/system/notices/setup/${id}/download`
  }

  if (journey === 'adhoc') {
    return {
      ...links,
      back: `/system/notices/setup/${id}/check-notice-type`,
      manage: `/system/notices/setup/${id}/select-recipients`
    }
  } else if (journey === 'alerts') {
    return {
      ...links,
      back: `/system/notices/setup/${id}/abstraction-alerts/alert-email-address`
    }
  } else {
    return {
      ...links,
      back: `/system/notices/setup/${id}/returns-period`,
      removeLicences: `/system/notices/setup/${id}/remove-licences`
    }
  }
}

function _pageTitle(page, pagination) {
  if (pagination.numberOfPages > 1) {
    return `Check the recipients (page ${page} of ${pagination.numberOfPages})`
  }

  return `Check the recipients`
}

/**
 * Due to the complexity of the query we had to use a raw query to get the recipients data. This means we need to handle
 * pagination (which recipients to display based on selected page and page size) in here.
 *
 * @private
 */
function _paginateRecipients(recipients, page) {
  const pageNumber = Number(page) * defaultPageSize

  return recipients.slice(pageNumber - defaultPageSize, pageNumber)
}

function _previewLink(noticeType, recipient, sessionId, contact, session) {
  // If we are sending a letter to the recipient, and the address is invalid, we don't want to display the preview link
  // else it might give a false impression the letter will be sent.
  if (contact.length > 1 && contact[1].startsWith('INVALID ADDRESS')) {
    return null
  }

  // We partially support return forms - we have hard
  if (noticeType === 'returnForms') {
    const [returnId] = session.selectedReturns
    return `/system/notices/setup/${sessionId}/preview/${recipient.contact_hash_id}/return-forms/${returnId}`
  }

  // Returns invitations and reminders can be previewed directly
  const basePreviewLink = `/system/notices/setup/${sessionId}/preview/${recipient.contact_hash_id}`

  // For abstraction alerts we need to go to an intermediate page to select the alert to preview
  return noticeType === 'abstractionAlerts' ? `${basePreviewLink}/check-alert` : basePreviewLink
}

/**
 * Sorts, maps, and paginates the recipients list.
 *
 * This function first maps over the recipients to transform each recipient object into a new format, then sorts the
 * resulting array of transformed recipients alphabetically by their contact's name. After sorting, it uses pagination
 * to return only the relevant subset of recipients for the given page.
 *
 * The map and sort are performed before pagination, as it is necessary to have the recipients in a defined order before
 * determining which recipients should appear on the page.
 *
 * @private
 */
function _recipients(noticeType, page, recipients, sessionId, session) {
  const formattedRecipients = _formatRecipients(noticeType, recipients, sessionId, session)
  const sortedRecipients = _sortRecipients(formattedRecipients)

  return _paginateRecipients(sortedRecipients, page)
}

/**
 * Sorts the recipients alphabetically by their 'contact name'.
 *
 * The contact name is the first element in the recipient's `contact` array. For letter-based recipients this will
 * be either the person or organisation name, and for email recipients this will be the email address.
 *
 * @private
 */
function _sortRecipients(recipients) {
  return recipients.sort((a, b) => {
    if (a.contact[0] < b.contact[0]) {
      return -1
    }

    if (a.contact[0] > b.contact[0]) {
      return 1
    }

    return 0
  })
}

function _warning(formattedRecipients) {
  const invalidRecipients = formattedRecipients.filter((formattedRecipient) => {
    const { contact } = formattedRecipient

    return contact.length > 1 && contact[1].startsWith('INVALID ADDRESS')
  })

  if (invalidRecipients.length === 0) {
    return null
  }

  if (invalidRecipients.length === 1) {
    return `A notification will not be sent for ${invalidRecipients[0].contact[0]} because the address is invalid.`
  }

  const contactNames = invalidRecipients.map((invalidRecipient) => {
    return invalidRecipient.contact[0]
  })

  return `Notifications will not be sent for the following recipients with invalid addresses: ${contactNames.join(', ')}`
}

module.exports = {
  go
}
