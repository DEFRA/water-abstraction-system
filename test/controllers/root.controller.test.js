// Test framework dependencies
import Lab from '@hapi/lab'
import Code from '@hapi/code'

// For running our service
import { init } from '../../app/server.js'

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

describe('Root controller: GET /', () => {
  let server

  // Create server before each test
  beforeEach(async () => {
    server = await init()
  })

  it('displays the correct message', async () => {
    const options = {
      method: 'GET',
      url: '/'
    }

    const response = await server.inject(options)
    const payload = JSON.parse(response.payload)

    expect(response.statusCode).to.equal(200)
    expect(payload.status).to.equal('alive')
  })
})
