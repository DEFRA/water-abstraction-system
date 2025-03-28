'use strict'

const EventModel = require('../../app/models/event.model.js')
const LicenceModel = require('../../app/models/licence.model.js')
const ScheduledNotificationsModel = require('../../app/models/scheduled-notification.model.js')

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

  const notification = ScheduledNotificationsModel.fromJson({
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
    sendAfter: new Date('2024-07-02T16:52:17.000Z'),
    event
  })

  return {
    licence,
    notification
  }
}

module.exports = {
  notification
}
