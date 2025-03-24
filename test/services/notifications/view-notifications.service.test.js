'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const FetchNotificationsService = require('../../../app/services/notifications/fetch-notifications.service.js')

// Thing under test
const ViewNotificationsService = require('../../../app/services/notifications/view-notifications.service.js')

describe('View Notifications service', () => {
  let testNotification

  before(() => {
    testNotification = _testFetchNotification()

    Sinon.stub(FetchNotificationsService, 'go').resolves(testNotification)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns the page data for the view', async () => {
      const result = await ViewNotificationsService.go(testNotification.notification.id, testNotification.licence.id)

      expect(result).to.equal({
        activeNavBar: 'search',
        address: ['Ferns Surfacing Limited', 'Tutsham Farm', 'West Farleigh', 'Maidstone', 'Kent', 'ME15 0NE'],
        contents:
          'Water Resources Act 1991\n' +
          'Our reference: HOF-UPMJ7G\n' +
          '\n' +
          'Dear licence holder,\n' +
          '\n' +
          '# This is an advance warning that you may be asked to stop or reduce your water abstraction soon.\n' +
          '\n' +
          '# Why you are receiving this notification\n' +
          '\n',
        licenceId: '136bfed6-7e14-4144-a06f-35a21ceb4aa2',
        licenceRef: '01/117',
        messageType: 'letter',
        pageTitle: 'Hands off flow: levels warning',
        sentDate: '2 July 2024'
      })
    })
  })
})

function _testFetchNotification() {
  return {
    licence: {
      id: '136bfed6-7e14-4144-a06f-35a21ceb4aa2',
      licenceRef: '01/117'
    },
    notification: {
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
      event: {
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
      }
    }
  }
}
