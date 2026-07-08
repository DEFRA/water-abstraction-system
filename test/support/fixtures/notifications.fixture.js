import EventModel from '../../../app/models/event.model.js'
import LicenceModel from '../../../app/models/licence.model.js'
import NotificationModel from '../../../app/models/notification.model.js'
import { generateUUID } from '../../../app/lib/general.lib.js'
import { NOTIFY_TEMPLATES } from '../../../app/lib/notify-templates.lib.js'

import { domains } from '../../../config/server.config.js'

const ADDRESS = {
  address_line_1: 'ACME Services Ltd',
  address_line_2: 'ACME Operations Centre',
  address_line_3: 'Bakersfield Road',
  address_line_4: 'Bakersfield',
  address_line_5: 'Bath',
  address_line_6: 'SOMERSET',
  address_line_7: 'BA1 1AA'
}

/**
 * Generates an abstraction alert email notification object associated to the provided notice
 *
 * @param {object} notice - The notice to associate with the abstraction alert email notification
 *
 * @returns {object} The generated abstraction alert email object
 */
export function abstractionAlertEmail(notice) {
  const licenceMonitoringStationId = generateUUID()

  const notification = {
    id: generateUUID(),
    contactType: 'primary user',
    createdAt: new Date('2025-10-09'),
    dueDate: null,
    eventId: notice.id,
    licenceMonitoringStationId,
    licences: notice.licences,
    messageRef: 'abstraction alert stop',
    messageType: 'email',
    notifyId: generateUUID(),
    notifyStatus: 'delivered',
    pdf: null,
    personalisation: {
      alertType: 'stop',
      condition_text: 'Effect of restriction: I have a bad feeling about this',
      flow_or_level: 'flow',
      issuer_email_address: 'luke.skywalker@rebelmail.test',
      label: 'Death star',
      licenceGaugingStationId: licenceMonitoringStationId,
      licenceId: generateUUID(),
      licenceRef: notice.licences[0],
      monitoring_station_name: 'Death star',
      sending_alert_type: 'stop',
      source: '* Source of supply: Meridian Trench',
      thresholdUnit: 'm3/s',
      thresholdValue: 100
    },
    plaintext:
      'Dear licence contact\n' +
      '\n' +
      'The flow at Death star monitoring station is now at 100 m3/s or less.\n' +
      '\n' +
      'This means that you must stop taking water now. \n',
    recipient: 'grace.hopper@acme.co.uk',
    returnedAt: null,
    returnLogIds: null,
    status: 'sent',
    templateId: NOTIFY_TEMPLATES.alerts.email.stop
  }

  return notification
}

/**
 * Generates an abstraction alert letter notification object associated to the provided notice
 *
 * @param {object} notice - The notice to associate with the abstraction alert letter notification
 *
 * @returns {object} The generated abstraction alert letter object
 */
export function abstractionAlertLetter(notice) {
  const licenceMonitoringStationId = generateUUID()

  const notification = {
    contactType: 'licence holder',
    createdAt: new Date('2025-10-09'),
    dueDate: null,
    eventId: notice.id,
    licenceMonitoringStationId,
    licences: notice.licences,
    messageRef: 'abstraction alert stop',
    messageType: 'letter',
    notifyId: generateUUID(),
    notifyStatus: 'received',
    pdf: null,
    personalisation: {
      ...ADDRESS,
      alertType: 'stop',
      condition_text: 'Effect of restriction: I have a bad feeling about this',
      flow_or_level: 'flow',
      issuer_email_address: 'luke.skywalker@rebelmail.test',
      label: 'Death star',
      licenceGaugingStationId: licenceMonitoringStationId,
      licenceId: generateUUID(),
      licenceRef: notice.licences[0],
      monitoring_station_name: 'Death star',
      name: 'ACME Services Ltd',
      sending_alert_type: 'stop',
      source: '* Source of supply: Meridian Trench',
      thresholdUnit: 'm3/s',
      thresholdValue: 100
    },
    plaintext:
      'Dear licence contact\n' +
      '\n' +
      'The flow at Death star monitoring station is now at 100 m3/s or less.\n' +
      '\n' +
      'This means that you must stop taking water now.\n',
    recipient: null,
    returnedAt: null,
    returnLogIds: null,
    status: 'sent',
    templateId: NOTIFY_TEMPLATES.alerts.letter.stop
  }

  return notification
}

/**
 * Generates a legacy hands off flow letter notification object associated to the provided notice
 *
 * @param {object} notice - The notice to associate with the legacy hands off flow letter notification
 *
 * @returns {object} The generated legacy hands off flow letter object
 */
export function legacyHandsOfFlow(notice) {
  const notification = {
    contactType: null,
    createdAt: new Date('2022-10-09'),
    dueDate: null,
    eventId: notice.id,
    licenceMonitoringStationId: null,
    licences: notice.licences,
    messageRef: 'notification_letter',
    messageType: 'letter',
    notifyId: generateUUID(),
    notifyStatus: 'received',
    pdf: null,
    personalisation: {
      address_line_1: ADDRESS.address_line_1,
      address_line_2: ADDRESS.address_line_2,
      address_line_3: ADDRESS.address_line_3,
      address_line_4: ADDRESS.address_line_4,
      address_line_5: ADDRESS.address_line_5,
      address_line_6: ADDRESS.address_line_6,
      postcode: ADDRESS.address_line_7,
      body: `Water Resources Act 1991  \nOur reference: ${notice.referenceCode}\n\nDear licence holder,\n\n`,
      heading: 'Warning: Abstraction restrictions may happen soon',
      licenceId: generateUUID(),
      subject: 'Warning: Abstraction restrictions may happen soon'
    },
    plaintext:
      'Water Resources Act 1991  \n' +
      `Our reference: ${notice.referenceCode}\n` +
      '\n' +
      'Dear licence holder,\n' +
      '\n' +
      '# This is an advance warning that you may be asked to stop or reduce your water abstraction soon.\n',
    recipient: 'n/a',
    returnedAt: null,
    returnLogIds: null,
    status: 'sent',
    templateId: null
  }

  return notification
}

/**
 * Generates a legacy renewal letter notification object associated to the provided notice
 *
 * @param {object} notice - The notice to associate with the legacy renewal letter notification
 *
 * @returns {object} The generated legacy renewal letter object
 */
export function legacyRenewal(notice) {
  const notification = {
    contactType: null,
    createdAt: new Date('2022-10-09'),
    dueDate: null,
    eventId: notice.id,
    licenceMonitoringStationId: null,
    licences: notice.licences,
    messageRef: 'notification_letter',
    messageType: 'letter',
    notifyId: generateUUID(),
    notifyStatus: 'received',
    pdf: null,
    personalisation: {
      address_line_1: ADDRESS.address_line_1,
      address_line_2: ADDRESS.address_line_2,
      address_line_3: ADDRESS.address_line_3,
      address_line_4: ADDRESS.address_line_4,
      address_line_5: ADDRESS.address_line_5,
      address_line_6: ADDRESS.address_line_6,
      postcode: ADDRESS.address_line_7,
      body: `Water Resources Act 1991  \nOur reference: ${notice.referenceCode}\n\nDear licence holder,\n\n`,
      heading: 'Invitation to apply for a water abstraction licence renewal',
      licenceId: generateUUID(),
      subject: 'Invitation to apply for a water abstraction licence renewal'
    },
    plaintext:
      'Water Resources Act 1991  \n' +
      `Our reference: ${notice.referenceCode}\n` +
      '\n' +
      'Dear licence holder,\n' +
      '\n' +
      '# All or part of the following abstraction licence will expire soon:\n',
    recipient: 'n/a',
    returnedAt: null,
    returnLogIds: null,
    status: 'sent',
    templateId: null
  }

  return notification
}

/**
 * Represents a complete response from `FetchNotificationsService`
 *
 * @returns {object} an object representing the notification and its related licence
 */
export function notification() {
  const licence = LicenceModel.fromJson({
    id: '136bfed6-7e14-4144-a06f-35a21ceb4aa2',
    licenceRef: '01/117'
  })

  const event = EventModel.fromJson({
    metadata: {
      name: 'Hands off flow: levels warning',
      batch: {
        id: '9fbf0817-1c54-4d40-9fb8-11faa6ca07bd',
        region: {
          id: '89eb360d-c9fb-479a-b22e-2a40b70c089d'
        },
        scheme: 'sroc',
        type: 'annual'
      }
    }
  })

  const notification = NotificationModel.fromJson({
    id: '4222e93e-6798-40ea-82d2-d5decbb01dac',
    messageType: 'letter',
    personalisation: {
      postcode: 'ME15 0NE',
      address_line_1: 'Ferns Surfacing Limited',
      address_line_2: 'Tutsham Farm',
      address_line_3: 'West Farleigh',
      address_line_4: 'Maidstone',
      address_line_5: 'Kent'
    },
    plaintext:
      'Water Resources Act 1991\n' +
      'Our reference: HOF-UPMJ7G\n' +
      '\n' +
      'Dear licence holder,\n' +
      '\n' +
      '# This is an advance warning that you may be asked to stop or reduce your water abstraction soon.\n' +
      '\n' +
      '# Why you are receiving this notification\n' +
      '\n',
    createdAt: new Date('2024-07-02T16:52:17.000Z'),
    event
  })

  return {
    licence,
    notification
  }
}

/**
 * Generates a paper return notification object associated to the provided notice
 *
 * @param {object} notice - The notice to associate with the paper return notification
 *
 * @returns {object} The generated paper return notification object
 */
export function paperReturn(notice) {
  const returnLogId = generateUUID()

  const notification = {
    contactType: 'licence holder',
    createdAt: new Date('2025-10-09'),
    dueDate: new Date('2025-04-28'),
    eventId: notice.id,
    id: generateUUID(),
    licenceMonitoringStationId: null,
    licences: notice.licences,
    messageRef: 'paper return',
    messageType: 'letter',
    notifyId: generateUUID(),
    notifyStatus: 'received',
    pdf: Buffer.from('I am a paper return'),
    personalisation: {
      ...ADDRESS,
      qr_url: returnLogId,
      purpose: 'Potable Water Supply - Direct',
      due_date: '2025-04-28',
      end_date: '2025-03-31',
      format_id: '12345678',
      start_date: '2024-04-01',
      licence_ref: notice.licences[0],
      region_code: 5,
      region_name: 'South West',
      naldAreaCode: 'AASWX',
      site_description: 'Wiley Coyote Borehole No 1',
      returns_frequency: 'day',
      is_two_part_tariff: false
    },
    plaintext: null,
    returnedAt: null,
    returnLogIds: [returnLogId],
    status: 'sent',
    templateId: null
  }

  return notification
}

/**
 * Generates a renewal invitation email notification object associated to the provided notice
 *
 * @param {object} notice - The notice to associate with the renewal invitation email notification
 *
 * @returns {object} The generated renewal invitation email object
 */
export function renewalInvitationEmail(notice) {
  const notification = {
    contactType: 'primary user',
    createdAt: new Date('2025-04-02'),
    dueDate: null,
    eventId: notice.id,
    id: generateUUID(),
    licenceMonitoringStationId: null,
    licences: notice.licences,
    messageRef: 'renewal invitation',
    messageType: 'email',
    notifyId: generateUUID(),
    notifyStatus: 'delivered',
    pdf: null,
    personalisation: {
      expiryDate: '28 April 2026',
      licenceRef: notice.licences[0],
      renewalDate: '28 January 2026'
    },
    plaintext:
      'Dear licence holder\n' +
      '\n' +
      '^ Your water abstraction licence will expire on 28 April 2026.\n' +
      '\n' +
      '^ You can apply to renew your licence from 28 January 2026.\n',
    recipient: 'grace.hopper@acme.co.uk',
    returnedAt: null,
    returnLogIds: null,
    status: 'sent',
    templateId: NOTIFY_TEMPLATES.renewalInvitations.standard.email['single licence']
  }

  return notification
}

/**
 * Generates a renewal invitation letter notification object associated to the provided notice
 *
 * @param {object} notice - The notice to associate with the renewal invitation letter notification
 *
 * @returns {object} The generated renewal invitation letter object
 */
export function renewalInvitationLetter(notice) {
  const notification = {
    contactType: 'licence holder',
    createdAt: new Date('2025-04-02'),
    dueDate: null,
    eventId: notice.id,
    id: generateUUID(),
    licenceMonitoringStationId: null,
    licences: notice.licences,
    messageRef: 'renewal invitation',
    messageType: 'letter',
    notifyId: generateUUID(),
    notifyStatus: 'received',
    pdf: null,
    personalisation: {
      ...ADDRESS,
      expiryDate: '28 April 2026',
      licenceRef: notice.licences[0],
      name: 'ACME Services Ltd',
      renewalDate: '28 January 2026'
    },
    plaintext:
      'Dear ACME Services Ltd\n' +
      '\n' +
      '^ Your water abstraction licence will expire on 28 April 2026.\n' +
      '\n' +
      '^ You can apply to renew your licence from 28 January 2026.\n',
    recipient: null,
    returnedAt: null,
    returnLogIds: null,
    status: 'sent',
    templateId: NOTIFY_TEMPLATES.renewalInvitations.standard.letter['single licence']
  }

  return notification
}

/**
 * Generates an ad-hoc returns invitation email notification object associated to the provided notice
 *
 * @param {object} notice - The notice to associate with the returns invitation email notification
 *
 * @returns {object} The generated returns invitation email object
 */
export function returnsInvitationAdHocEmail(notice) {
  const notification = _returnsInvitationDefaults(notice)

  return {
    ...notification,
    contactType: 'primary user',
    messageRef: 'returns invitation ad-hoc',
    messageType: 'email',
    notifyStatus: 'delivered',
    personalisation: {
      periodEndDate: '31 March 2025',
      returnDueDate: '28 April 2025',
      periodStartDate: '1 April 2024'
    },
    plaintext:
      'Dear licence holder\n' +
      '\n' +
      '^ You must submit a record of your water abstraction from 1 April 2024 to 31 March 2025. \n' +
      '\n' +
      '^ You’ll need to submit your returns by 1 April 2025.\n',
    recipient: 'grace.hopper@acme.co.uk',
    templateId: NOTIFY_TEMPLATES.invitations.adhoc.email['primary user']
  }
}

/**
 * Generates an ad-hoc returns invitation letter notification object associated to the provided notice
 *
 * @param {object} notice - The notice to associate with the returns invitation letter notification
 *
 * @returns {object} The generated returns invitation letter object
 */
export function returnsInvitationAdHocLetter(notice) {
  const notification = _returnsInvitationDefaults(notice)

  return {
    ...notification,
    contactType: 'licence holder',
    messageRef: 'returns invitation ad-hoc',
    messageType: 'letter',
    notifyStatus: 'received',
    personalisation: {
      ...ADDRESS,
      expiryDate: '28 April 2026',
      licenceRef: notice.licences[0],
      name: 'ACME Services Ltd',
      renewalDate: '28 January 2026'
    },
    plaintext:
      'Dear ACME Services Ltd\n' +
      '\n' +
      '^ You must submit a record of your water abstraction from 1 April 2024 to 31 March 2025. \n' +
      '\n' +
      '^ You’ll need to submit your returns by 1 April 2025.\n',
    recipient: null,
    templateId: NOTIFY_TEMPLATES.invitations.adhoc.letter['licence holder']
  }
}

/**
 * Generates an alternate returns invitation letter notification object associated to the provided notice
 *
 * > There is no alternate email notification, as these are generated and sent when the email fails.
 *
 * @param {object} notice - The notice to associate with the returns invitation letter notification
 *
 * @returns {object} The generated returns invitation letter object
 */
export function returnsInvitationAlternateLetter(notice) {
  const notification = _returnsInvitationDefaults(notice)

  return {
    ...notification,
    contactType: 'licence holder',
    messageRef: 'returns invitation alternate',
    messageType: 'letter',
    notifyStatus: 'received',
    personalisation: {
      ...ADDRESS,
      expiryDate: '28 April 2026',
      licenceRef: notice.licences[0],
      name: 'ACME Services Ltd',
      renewalDate: '28 January 2026'
    },
    plaintext:
      'Dear ACME Services Ltd\n' +
      '\n' +
      '^ You must submit a record of your water abstraction from 1 April 2024 to 31 March 2025. \n' +
      '\n' +
      '^ You’ll need to submit your returns by 1 April 2025.\n',
    recipient: null,
    templateId: NOTIFY_TEMPLATES.invitations.standard.letter['licence holder']
  }
}

/**
 * Generates a returns invitation email notification object associated to the provided notice
 *
 * @param {object} notice - The notice to associate with the returns invitation email notification
 *
 * @returns {object} The generated returns invitation email object
 */
export function returnsInvitationEmail(notice) {
  const notification = _returnsInvitationDefaults(notice)

  return {
    ...notification,
    contactType: 'primary user',
    messageRef: 'returns invitation',
    messageType: 'email',
    notifyStatus: 'delivered',
    personalisation: {
      periodEndDate: '31 March 2025',
      returnDueDate: '28 April 2025',
      periodStartDate: '1 April 2024'
    },
    plaintext:
      'Dear licence holder\n' +
      '\n' +
      '^ You must submit a record of your water abstraction from 1 April 2024 to 31 March 2025. \n' +
      '\n' +
      '^ You’ll need to submit your returns by 1 April 2025.\n',
    recipient: 'grace.hopper@acme.co.uk',
    templateId: NOTIFY_TEMPLATES.invitations.standard.email['primary user']
  }
}

/**
 * Generates a returns invitation letter notification object associated to the provided notice
 *
 * @param {object} notice - The notice to associate with the returns invitation letter notification
 *
 * @returns {object} The generated returns invitation letter object
 */
export function returnsInvitationLetter(notice) {
  const notification = _returnsInvitationDefaults(notice)

  return {
    ...notification,
    contactType: 'licence holder',
    messageRef: 'returns invitation',
    messageType: 'letter',
    notifyStatus: 'received',
    personalisation: {
      ...ADDRESS,
      expiryDate: '28 April 2026',
      licenceRef: notice.licences[0],
      name: 'ACME Services Ltd',
      renewalDate: '28 January 2026'
    },
    plaintext:
      'Dear ACME Services Ltd\n' +
      '\n' +
      '^ You must submit a record of your water abstraction from 1 April 2024 to 31 March 2025. \n' +
      '\n' +
      '^ You’ll need to submit your returns by 1 April 2025.\n',
    recipient: null,
    templateId: NOTIFY_TEMPLATES.invitations.standard.letter['licence holder']
  }
}

/**
 * Generates a returns reminder email notification object associated to the provided notice
 *
 * @param {object} notice - The notice to associate with the returns reminder email notification
 *
 * @returns {object} The generated returns reminder email object
 */
export function returnsReminderEmail(notice) {
  const notification = {
    contactType: 'primary user',
    createdAt: new Date('2025-04-18'),
    dueDate: new Date('2025-04-28'),
    eventId: notice.id,
    id: generateUUID(),
    licenceMonitoringStationId: null,
    licences: notice.licences,
    messageRef: 'returns reminder',
    messageType: 'email',
    notifyId: generateUUID(),
    notifyStatus: 'delivered',
    pdf: null,
    personalisation: {
      periodEndDate: '31 March 2025',
      returnDueDate: '28 April 2025',
      periodStartDate: '1 April 2024'
    },
    plaintext:
      'Dear licence holder\n' +
      '\n' +
      '^ You must submit a record of your water abstraction from 1 April 2024 to 31 March 2025. \n' +
      '\n' +
      '^ You’ll need to submit your returns by 1 April 2025.\n',
    recipient: 'grace.hopper@acme.co.uk',
    returnedAt: null,
    returnLogIds: [generateUUID(), generateUUID()],
    status: 'sent',
    templateId: NOTIFY_TEMPLATES.reminders.standard.email['primary user']
  }

  return notification
}

/**
 * Generates a returns reminder letter notification object associated to the provided notice
 *
 * @param {object} notice - The notice to associate with the returns reminder letter notification
 *
 * @returns {object} The generated returns reminder letter object
 */
export function returnsReminderLetter(notice) {
  const notification = {
    contactType: 'licence holder',
    createdAt: new Date('2025-04-18'),
    dueDate: new Date('2025-04-28'),
    eventId: notice.id,
    id: generateUUID(),
    licenceMonitoringStationId: null,
    licences: notice.licences,
    messageRef: 'returns reminder',
    messageType: 'letter',
    notifyId: generateUUID(),
    notifyStatus: 'received',
    pdf: null,
    personalisation: {
      ...ADDRESS,
      name: 'ACME Services Ltd',
      periodEndDate: '31 March 2025',
      returnDueDate: '28 April 2025',
      periodStartDate: '1 April 2024'
    },
    plaintext:
      'Dear ACME Services Ltd\n' +
      '\n' +
      '# We do not have your returns for 1 April 2025 to 30 June 2025 \n' +
      '\n' +
      'If you’ve submitted them in the past few days, you can ignore this reminder.\n' +
      '\n' +
      'We asked you to submit your returns by 1 April 2025.\n',
    recipient: null,
    returnedAt: null,
    returnLogIds: [generateUUID(), generateUUID()],
    status: 'sent',
    templateId: NOTIFY_TEMPLATES.reminders.standard.letter['licence holder']
  }

  return notification
}

/**
 * Generates a new user external password reset email notification object
 *
 * @param {string} recipient - The email of the recipient
 * @param {object} overrides - An object of properties to override in the generated notification object
 *
 * @returns {object} The generated user external email object
 */
export function userExternalPasswordResetEmail(recipient, overrides = {}) {
  return _userPasswordResetEmail(recipient, false, overrides)
}

/**
 * Generates a user external share existing email notification object
 *
 * @param {string} recipient - The email of the recipient
 * @param {string} sender - The email of the sender
 * @param {object} overrides - An object of properties to override in the generated notification object
 *
 * @returns {object} The generated user external email object
 */
export function userExternalShareExistingEmail(recipient, sender, overrides = {}) {
  const notification = {
    contactType: null,
    createdAt: new Date('2025-04-18'),
    dueDate: null,
    eventId: null,
    id: generateUUID(),
    licenceMonitoringStationId: null,
    licences: [],
    messageRef: 'share_existing_user',
    messageType: 'email',
    notifyId: generateUUID(),
    notifyStatus: 'delivered',
    pdf: null,
    personalisation: {
      link: domains.external,
      email: recipient,
      sender
    },
    plaintext:
      'Hello\n' +
      '\n' +
      `${sender} would like to give you access to view their water abstraction or impoundment licences online.\n` +
      '\n' +
      'You will be able to see their licence details the next time you sign in to our online service:\n',
    recipient,
    returnedAt: null,
    returnLogIds: null,
    status: 'sent',
    templateId: null
  }

  return { ...notification, ...overrides }
}

/**
 * Generates a new user internal password reset email notification object
 *
 * @param {string} recipient - The email of the recipient
 * @param {object} overrides - An object of properties to override in the generated notification object
 *
 * @returns {object} The generated user internal email object
 */
export function userInternalPasswordResetEmail(recipient, overrides = {}) {
  return _userPasswordResetEmail(recipient, true, overrides)
}

/**
 * Generates a new internal user email notification object
 *
 * @param {string} recipient - The email of the recipient
 * @param {object} overrides - An object of properties to override in the generated notification object
 *
 * @returns {object} The generated user new internal email object
 */
export function userNewInternalEmail(recipient, overrides = {}) {
  const notification = {
    contactType: null,
    createdAt: new Date('2025-04-18'),
    dueDate: null,
    eventId: null,
    id: generateUUID(),
    licenceMonitoringStationId: null,
    licences: [],
    messageRef: 'new_internal_user_email',
    messageType: 'email',
    notifyId: generateUUID(),
    notifyStatus: 'delivered',
    pdf: null,
    personalisation: {
      unique_create_password_link: `${domains.internal}/reset_password_change_password?resetGuid=${generateUUID()}`
    },
    plaintext:
      'Hello\n' +
      '\n' +
      'An account has been created for you in the Water Resources Licensing Service.\n' +
      '\n' +
      'Please use this link to complete your account set up.\n',
    recipient,
    returnedAt: null,
    returnLogIds: null,
    status: 'sent',
    templateId: null
  }

  return { ...notification, ...overrides }
}

function _returnsInvitationDefaults(notice) {
  return {
    createdAt: new Date('2025-04-02'),
    dueDate: new Date('2025-04-28'),
    eventId: notice.id,
    id: generateUUID(),
    licenceMonitoringStationId: null,
    licences: notice.licences,
    notifyId: generateUUID(),
    pdf: null,
    returnedAt: null,
    returnLogIds: [generateUUID(), generateUUID()],
    status: 'sent'
  }
}

function _userPasswordResetEmail(recipient, internal, overrides) {
  const domain = internal ? domains.internal : domains.external

  const notification = {
    contactType: null,
    createdAt: new Date('2025-04-18'),
    dueDate: null,
    eventId: null,
    id: generateUUID(),
    licenceMonitoringStationId: null,
    licences: [],
    messageRef: 'password_reset_email',
    messageType: 'email',
    notifyId: generateUUID(),
    notifyStatus: 'delivered',
    pdf: null,
    personalisation: {
      firstname: '(User)',
      reset_url: `${domain}/reset_password_change_password?resetGuid=${generateUUID()}`
    },
    plaintext:
      'Hello\n' +
      '\n' +
      'You requested a password reset to view your water abstraction or impoundment licence(s). No changes have been made to your account yet.\n' +
      '\n' +
      'You can reset your password using the link below (this link will only work once):\n',
    recipient,
    returnedAt: null,
    returnLogIds: null,
    status: 'sent',
    templateId: null
  }

  return { ...notification, ...overrides }
}
