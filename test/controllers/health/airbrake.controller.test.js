// Test framework dependencies
import Lab from '@hapi/lab'
import Code from '@hapi/code'
import Sinon from 'sinon'

// Things we need to stub
import Airbrake from '@airbrake/node'

// For running our service
import { init } from '../../../app/server.js'

const { describe, it, beforeEach, after, afterEach } = exports.lab = Lab.script()
const { expect } = Code

describe('Airbrake controller: GET /status/airbrake', () => {
  let server, airbrakeStub

  const options = {
    method: 'GET',
    url: '/health/airbrake'
  }

  beforeEach(async () => {
    server = await init()

    airbrakeStub = Sinon
      .stub(Airbrake.Notifier.prototype, 'notify')
      .resolves({ id: 1 })
  })

  afterEach(() => {
    airbrakeStub.restore()
  })

  after(() => {
    Sinon.restore()
  })

  it('returns a 500 error', async () => {
    const response = await server.inject(options)

    expect(response.statusCode).to.equal(500)
  })

  it('causes Airbrake to send a notification', async () => {
    await server.inject(options)

    expect(airbrakeStub.called).to.equal(true)
  })
})
