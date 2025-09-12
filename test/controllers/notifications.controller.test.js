'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

const NotifyConfig = require('../../config/notify.config.js')

// Things we need to stub
const ViewNotificationService = require('../../app/services/notifications/view-notification.service.js')

// For running our service
const { init } = require('../../app/server.js')

describe('Notifications controller', () => {
  let notifierStub
  let options
  let server

  // Create server before running the tests
  before(async () => {
    server = await init()
  })

  beforeEach(async () => {
    // We silence any calls to server.logger.error made in the plugin to try and keep the test output as clean as
    // possible
    Sinon.stub(server.logger, 'error')

    // We silence sending a notification to our Errbit instance using Airbrake
    Sinon.stub(server.app.airbrake, 'notify').resolvesThis()
    notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('Notifications controller', () => {
    describe('/notifications/{notificationId}', () => {
      describe('GET', () => {
        beforeEach(async () => {
          options = {
            method: 'GET',
            url: '/notifications/499247a2-bebf-4a94-87dc-b83af2a133f3?id=LICENCE_ID',
            auth: {
              strategy: 'session',
              credentials: { scope: ['returns'] }
            }
          }
        })

        describe('when a request is valid', () => {
          beforeEach(async () => {
            Sinon.stub(ViewNotificationService, 'go').resolves(_viewNotification())
          })

          it('returns the page successfully', async () => {
            const response = await server.inject(options)

            expect(response.statusCode).to.equal(200)
            expect(response.payload).to.contain('Licence 01/117')
            expect(response.payload).to.contain('Hands off flow: levels warning')
          })
        })
      })
    })

    describe('/notifications/callbacks/letters', () => {
      describe('POST', () => {
        describe('when the request has valid authorization', () => {
          beforeEach(() => {
            options = {
              headers: {
                authorization: `Bearer ${NotifyConfig.callbackToken}`
              },
              method: 'POST',
              payload: {
                notification_id: '506c20c7-7741-4c95-85c1-de3fe87314f3',
                reference: 'reference'
              },
              url: '/notifications/callbacks/letters'
            }
          })

          it('returns a 204 response', async () => {
            const response = await server.inject(options)

            const logDataArg = notifierStub.omg.args[0][1]

            expect(response.statusCode).to.equal(204)
            expect(notifierStub.omg.calledWith('Return letter callback triggered')).to.be.true()
            expect(logDataArg.notificationId).to.equal('506c20c7-7741-4c95-85c1-de3fe87314f3')
            expect(logDataArg.reference).to.equal('reference')
          })
        })

        describe('when the request has an invalid authorization', () => {
          beforeEach(() => {
            options = {
              headers: {
                authorization: 'Bearer wrong'
              },
              method: 'POST',
              payload: {
                notification_id: '506c20c7-7741-4c95-85c1-de3fe87314f3',
                reference: 'reference'
              },
              url: '/notifications/callbacks/letters'
            }
          })

          it('returns a 404 response', async () => {
            const response = await server.inject(options)

            expect(response.statusCode).to.equal(404)
          })
        })
      })
    })
  })
})

function _viewNotification() {
  return {
    activeNavBar: 'search',
    address: ['Ferns Surfacing Limited', 'Tutsham Farm', 'West Farleigh', 'Maidstone', 'Kent', 'ME15 0NE'],
    contents:
      'Water Resources Act 1991\n' +
      'Our reference: HOF-UPMJ7G\n\n' +
      'Dear licence holder,\n\n' +
      '# This is an advance warning that you may be asked to stop or reduce your water abstraction soon.\n\n' +
      '# Why you are receiving this notification\n\n' +
      'You have a ‘hands off flow’ condition in your water abstraction licence. That condition authorises and restricts how much water you can abstract when the flow in the relevant watercourse has fallen below a certain level.\n\n' +
      '# What you need to do\n\n' +
      'You can continue to abstract water until further notice, if the conditions of your licence allow it.\n\n' +
      'We will send you a notification if river levels fall further and restrictions on abstraction are applied. You must follow any instructions given in that notification.\n\n' +
      '# How to contact us\n\n' +
      'If you have any questions about this notification, please contact Alan on 01179350249 or admin-internal@wrls.gov.uk.\n\n\n' +
      'Yours faithfully\n\n' +
      'Alan\n' +
      'Important person\n' +
      'Horizon House\n' +
      'Deanery Lane\n' +
      'Bristol\n' +
      'BS3 1PR\n\n' +
      '# Your hands off flow details\n\n' +
      'Licence number: 01/117\n' +
      'Gauging station: Gorge Station\n' +
      'Hands off flow threshold: 100',
    licenceId: '91aff99a-3204-4727-86bd-7bdf3ef24533',
    licenceRef: '01/117',
    messageType: 'letter',
    pageTitle: 'Hands off flow: levels warning',
    sentDate: '2 July 2024'
  }
}
