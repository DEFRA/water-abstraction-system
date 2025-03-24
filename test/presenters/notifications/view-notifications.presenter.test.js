'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const ViewNotificationsPresenter = require('../../../app/presenters/notifications/view-notifications.presenter.js')

describe('View Notifications presenter', () => {
  let testNotification

  before(() => {
    testNotification = _testNotification()
  })

  describe('when provided with a populated notification with related event and licence data', () => {
    it('correctly presents the data', () => {
      const result = ViewNotificationsPresenter.go(testNotification)

      expect(result).to.equal({
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

    describe('the "address" property', () => {
      describe('when the "messageType" is "letter"', () => {
        describe('when only some of the address values in the "notifications.personalisation" property are filled', () => {
          before(() => {
            testNotification.notification.personalisation.address_line_1 = ''
            testNotification.notification.personalisation.address_line_3 = ''
          })

          it('correctly formats the address data into an array with the populated values', () => {
            const result = ViewNotificationsPresenter.go(testNotification)

            expect(result.address).to.equal(['Tutsham Farm', 'Maidstone', 'Kent', 'ME15 0NE'])
          })
        })
      })

      describe('when the "messageType" is "email"', () => {
        before(() => {
          testNotification.notification.messageType = 'email'
        })

        it('returns null', () => {
          const result = ViewNotificationsPresenter.go(testNotification)

          expect(result.address).to.be.null()
        })
      })
    })

    describe('the "pageTitle" property', () => {
      describe('when the "event.metadata.name" is not "Water abstraction alert"', () => {
        it('returns the "event.metadata.name"', () => {
          const result = ViewNotificationsPresenter.go(testNotification)

          expect(result.pageTitle).to.equal('Hands off flow: levels warning')
        })
      })

      describe('when the "event.metadata.name" is "Water abstraction alert"', () => {
        before(() => {
          testNotification.notification.event.metadata = {
            name: 'Water abstraction alert',
            options: { sendingAlertType: 'warning' }
          }
        })

        it('returns the "event.metadata.options.sendingAlertType" capitalised followed by the "event.name"', () => {
          const result = ViewNotificationsPresenter.go(testNotification)

          expect(result.pageTitle).to.equal('Warning - Water abstraction alert')
        })
      })
    })
  })
})

function _testNotification() {
  return {
    licence: {
      id: '136bfed6-7e14-4144-a06f-35a21ceb4aa2',
      licenceRef: '01/117'
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
