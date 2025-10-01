'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const NotificationsFixture = require('../../fixtures/notifications.fixture.js')

// Thing under test
const ViewNotificationPresenter = require('../../../app/presenters/notifications/view-notification.presenter.js')

describe('View Notification presenter', () => {
  let testNotification

  beforeEach(() => {
    testNotification = NotificationsFixture.notification()
  })

  describe('when provided with a populated notification with related event and licence data', () => {
    it('correctly presents the data', () => {
      const result = ViewNotificationPresenter.go(testNotification)

      expect(result).to.equal({
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
        returnForm: {
          text: 'No preview available'
        },
        sentDate: '2 July 2024'
      })
    })

    describe('the "address" property', () => {
      describe('when the "messageType" is "letter"', () => {
        describe('when only some of the address values in the "notifications.personalisation" property are filled', () => {
          beforeEach(() => {
            testNotification.notification.personalisation.address_line_1 = ''
            testNotification.notification.personalisation.address_line_3 = ''
          })

          it('correctly formats the address data into an array with the populated values', () => {
            const result = ViewNotificationPresenter.go(testNotification)

            expect(result.address).to.equal(['Tutsham Farm', 'Maidstone', 'Kent', 'ME15 0NE'])
          })
        })
      })

      describe('when the "messageType" is "email"', () => {
        beforeEach(() => {
          testNotification.notification.messageType = 'email'
          testNotification.notification.recipient = 'bob@bobbins.co.uk'
        })

        it('returns the recipients email address', () => {
          const result = ViewNotificationPresenter.go(testNotification)

          expect(result.address).to.equal('bob@bobbins.co.uk')
        })
      })
    })

    describe('the "returnForm" property', () => {
      describe('when there is no pdf data', () => {
        it('correctly returns the text', () => {
          const result = ViewNotificationPresenter.go(testNotification)

          expect(result.returnForm).to.equal({
            text: 'No preview available'
          })
        })
      })

      describe('when there is pdf data', () => {
        beforeEach(() => {
          testNotification.notification.pdf = Buffer.from('mock file')
        })

        it('correctly returns the text', () => {
          const result = ViewNotificationPresenter.go(testNotification)

          expect(result.returnForm).to.equal({
            link: `/system/notifications/${testNotification.notification.id}/download`,
            text: 'Preview paper return'
          })
        })
      })
    })

    describe('the "pageTitle" property', () => {
      describe('when the "event.metadata.name" is not "Water abstraction alert"', () => {
        it('returns the "event.metadata.name"', () => {
          const result = ViewNotificationPresenter.go(testNotification)

          expect(result.pageTitle).to.equal('Hands off flow: levels warning')
        })
      })

      describe('when the "event.metadata.name" is "Water abstraction alert"', () => {
        beforeEach(() => {
          testNotification.notification.event.metadata = {
            name: 'Water abstraction alert',
            options: { sendingAlertType: 'warning' }
          }
        })

        it('returns the "event.metadata.options.sendingAlertType" capitalised followed by the "event.name"', () => {
          const result = ViewNotificationPresenter.go(testNotification)

          expect(result.pageTitle).to.equal('Warning - Water abstraction alert')
        })
      })
    })
  })
})
