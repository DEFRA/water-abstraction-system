'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// For running our service
const { init } = require('../../app/server.js')

describe.only('Callbacks controller', () => {
  let notifierStub
  let options
  let server

  // Create server before running the tests
  before(async () => {
    server = await init()
  })

  beforeEach(async () => {
    // We silence any calls to server.logger.error and info to try and keep the test output as clean as possible
    Sinon.stub(server.logger, 'error')
    Sinon.stub(server.logger, 'info')

    // We silence sending a notification to our Errbit instance using Airbrake
    Sinon.stub(server.app.airbrake, 'notify').resolvesThis()

    notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('/callback/returned-letter', () => {
    describe('POST', () => {
      describe('when the request has valid authorization', () => {
        beforeEach(() => {
          options = {
            headers: {
              authorization: `Bearer ${process.env.GOV_UK_NOTIFY_AUTH_TOKEN}`
            },
            method: 'POST',
            payload: {
              notification_id: '506c20c7-7741-4c95-85c1-de3fe87314f3',
              reference: 'reference'
            },
            url: '/callback/returned-letter'
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
            url: '/callback/returned-letter'
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
