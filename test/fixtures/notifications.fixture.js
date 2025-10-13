'use strict'

const EventModel = require('../../app/models/event.model.js')
const LicenceModel = require('../../app/models/licence.model.js')
const NotificationModel = require('../../app/models/notification.model.js')
const { generateUUID } = require('../../app/lib/general.lib.js')

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
function abstractionAlertEmail(notice) {
  const licenceMonitoringStationId = generateUUID()

  const notification = {
    createdAt: new Date('2025-10-09'),
    eventId: notice.id,
    licenceMonitoringStationId,
    licences: notice.licences,
    messageRef: 'water_abstraction_alert_stop_email',
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
    status: 'sent'
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
function abstractionAlertLetter(notice) {
  const licenceMonitoringStationId = generateUUID()

  const notification = {
    createdAt: new Date('2025-10-09'),
    eventId: notice.id,
    licenceMonitoringStationId,
    licences: notice.licences,
    messageRef: 'water_abstraction_alert_stop',
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
    status: 'sent'
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
function legacyHandsOfFlow(notice) {
  const notification = {
    createdAt: new Date('2022-10-09'),
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
    status: 'sent'
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
function legacyRenewal(notice) {
  const notification = {
    createdAt: new Date('2022-10-09'),
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
    status: 'sent'
  }

  return notification
}

/**
 * Represents a complete response from `FetchNotificationsService`
 *
 * @returns {object} an object representing the notification and its related licence
 */
function notification() {
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
function paperReturn(notice) {
  const notification = {
    createdAt: new Date('2025-10-09'),
    eventId: notice.id,
    licenceMonitoringStationId: null,
    licences: notice.licences,
    messageRef: 'pdf.return_form',
    messageType: 'letter',
    notifyId: generateUUID(),
    notifyStatus: 'received',
    pdf: Buffer.from('I am a paper return'),
    personalisation: {
      ...ADDRESS,
      qr_url: `v1:5:${notice.licences[0]}:12345678:2024-04-01:2025-03-31`,
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
    returnLogIds: [generateUUID()],
    status: 'sent'
  }

  return notification
}

/**
 * Generates a returns invitation email notification object associated to the provided notice
 *
 * @param {object} notice - The notice to associate with the returns invitation email notification
 *
 * @returns {object} The generated returns invitation email object
 */
function returnsInvitationEmail(notice) {
  const notification = {
    createdAt: new Date('2025-04-02'),
    eventId: notice.id,
    licenceMonitoringStationId: null,
    licences: notice.licences,
    messageRef: 'returns_invitation_primary_user_email',
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
    returnLogIds: null,
    status: 'sent'
  }

  return notification
}

/**
 * Generates a returns invitation letter notification object associated to the provided notice
 *
 * @param {object} notice - The notice to associate with the returns invitation letter notification
 *
 * @returns {object} The generated returns invitation letter object
 */
function returnsInvitationLetter(notice) {
  const notification = {
    createdAt: new Date('2025-04-02'),
    eventId: notice.id,
    licenceMonitoringStationId: null,
    licences: notice.licences,
    messageRef: 'returns_invitation_licence_holder_letter',
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
      '^ You must submit a record of your water abstraction from 1 April 2024 to 31 March 2025. \n' +
      '\n' +
      '^ You’ll need to submit your returns by 1 April 2025.\n',
    recipient: null,
    returnedAt: null,
    returnLogIds: null,
    status: 'sent'
  }

  return notification
}

/**
 * Generates a returns reminder email notification object associated to the provided notice
 *
 * @param {object} notice - The notice to associate with the returns reminder email notification
 *
 * @returns {object} The generated returns reminder email object
 */
function returnsReminderEmail(notice) {
  const notification = {
    createdAt: new Date('2025-04-18'),
    eventId: notice.id,
    licenceMonitoringStationId: null,
    licences: notice.licences,
    messageRef: 'returns_reminder_primary_user_email',
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
    returnLogIds: null,
    status: 'sent'
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
function returnsReminderLetter(notice) {
  const notification = {
    createdAt: new Date('2025-04-18'),
    eventId: notice.id,
    licenceMonitoringStationId: null,
    licences: notice.licences,
    messageRef: 'returns_reminder_licence_holder_letter',
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
    returnLogIds: null,
    status: 'sent'
  }

  return notification
}

module.exports = {
  abstractionAlertEmail,
  abstractionAlertLetter,
  legacyHandsOfFlow,
  legacyRenewal,
  notification,
  paperReturn,
  returnsInvitationEmail,
  returnsInvitationLetter,
  returnsReminderEmail,
  returnsReminderLetter
}
