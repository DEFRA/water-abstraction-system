'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const EventHelper = require('../../support/helpers/event.helper.js')
const ScheduledNotificationsHelper = require('../../support/helpers/scheduled-notification.helper.js')

// Thing under test
const FetchNotificationService = require('../../../app/services/notifications/fetch-notification.service.js')

describe('Fetch Notification service', () => {
  let event
  let licence
  let notification

  before(async () => {
    event = await EventHelper.add()
    licence = await LicenceHelper.add()

    notification = await ScheduledNotificationsHelper.add({
      eventId: event.id,
      messageType: 'letter',
      messageRef: 'notification_letter',
      personalisation: {
        address_line_1: 'Ferns Surfacing Limited',
        address_line_2: 'Tutsham Farm',
        address_line_3: 'West Farleigh',
        address_line_4: 'Maidstone',
        address_line_5: 'Kent',
        postcode: 'ME15 0NE'
      },
      plaintext:
        'Water Resources Act 1991\n' +
        'Our reference: HOF-UPMJ7G\n\n' +
        'Dear licence holder,\n\n' +
        '# This is an advance warning that you may be asked to stop or reduce your water abstraction soon.\n\n' +
        '# Why you are receiving this notification\n\n',
      sendAfter: new Date('2024-07-02 16:52:17.000')
    })
  })

  describe('when a matching notification exists', () => {
    it('returns the matching notification with its related event and licence data', async () => {
      const result = await FetchNotificationService.go(notification.id, licence.id)

      expect(result).to.equal({
        licence: {
          id: licence.id,
          licenceRef: licence.licenceRef
        },
        notification: {
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
          event: {
            metadata: {
              batch: {
                id: event.metadata.batch.id,
                region: {
                  id: event.metadata.batch.region.id
                },
                scheme: event.metadata.batch.scheme,
                type: event.metadata.batch.type
              }
            }
          }
        }
      })
    })
  })
})
