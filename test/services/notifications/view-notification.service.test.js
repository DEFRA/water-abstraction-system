'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const NotificationsFixture = require('../../fixtures/notifications.fixture.js')

// Things we need to stub
const FetchNotificationService = require('../../../app/services/notifications/fetch-notification.service.js')

// Thing under test
const ViewNotificationService = require('../../../app/services/notifications/view-notification.service.js')

describe('View Notification service', () => {
  let testNotification

  before(() => {
    testNotification = NotificationsFixture.notification()

    Sinon.stub(FetchNotificationService, 'go').resolves(testNotification)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns the page data for the view', async () => {
      const result = await ViewNotificationService.go(testNotification.notification.id, testNotification.licence.id)

      expect(result).to.equal({
        activeNavBar: 'search',
        address: ['Ferns Surfacing Limited', 'Tutsham Farm', 'West Farleigh', 'Maidstone', 'Kent', 'ME15 0NE'],
        backLink: '/system/licences/136bfed6-7e14-4144-a06f-35a21ceb4aa2/communications',
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
        licenceRef: '01/117',
        messageType: 'letter',
        pageTitle: 'Hands off flow: levels warning',
        sentDate: '2 July 2024'
      })
    })
  })
})
