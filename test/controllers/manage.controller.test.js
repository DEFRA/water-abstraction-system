'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const ViewManageService = require('../../app/services/manage/view-manage.service.js')

// For running our service
const { init } = require('../../app/server.js')

describe('Manage controller', () => {
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
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('/manage', () => {
    describe('GET', () => {
      beforeEach(async () => {
        Sinon.stub(ViewManageService, 'go').resolves({
          pageTitle: 'Manage reports and notices'
        })
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions())

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Manage reports and notices')
        })
      })
    })
  })
})

function _getOptions() {
  return {
    method: 'GET',
    url: '/manage',
    auth: {
      strategy: 'session',
      credentials: { scope: ['hof_notifications'], user: { id: 1000 } }
    }
  }
}
