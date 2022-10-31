'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')
const Nock = require('nock')

const { describe, it, before, after } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers

// Thing under test
const ServiceStatusService = require('../../app/services/service_status.service')

describe.only('Service Status service', () => {
  before(() => {
    Nock('http://localhost:8009')
      .get('/address-service/hola')
      .reply(200, 'hola')

    Nock('http://localhost:8020')
      .get('/status')
      .reply(200, { status: 'alive' }, [
        'x-cma-git-commit',
        '273604040a47e0977b0579a0fef0f09726d95e39',
        'x-cma-docker-tag',
        'ghcr.io/defra/sroc-charging-module-api:v0.19.0']
      )

    Nock('http://localhost:8001')
      .get('/health/info')
      .reply(200, { version: '3.0.2', commit: '83d0e8cdde5b7ac700cb29107503d9c5464ee964' })

    Nock('http://localhost:8012')
      .get('/health/info')
      .reply(200, { version: '3.0.2', commit: '83d0e8cdde5b7ac700cb29107503d9c5464ee964' })

    Nock('http://localhost:8011')
      .get('/health/info')
      .reply(200, { version: '2.25.2', commit: 'a7030dc9180708a8539b7e7d46b7317ad246017a' })

    Nock('http://localhost:8007')
      .get('/health/info')
      .reply(200, { version: '2.25.2', commit: 'a181fb112d61a36e2d3dabc95f81e29369139c5c' })

    Nock('http://localhost:8002')
      .get('/health/info')
      .reply(200, { version: '2.25.2', commit: '58bd0c18ffc7f4248bed0ed4ef8c06a3ef4dff6b' })

    Nock('http://localhost:8000')
      .get('/health/info')
      .reply(200, { version: '2.26.1', commit: 'f154e3f9e4c87366e070c32f231e8590157d7d39' })

    Nock('http://localhost:8008')
      .get('/health/info')
      .reply(200, { version: '2.26.1', commit: 'f154e3f9e4c87366e070c32f231e8590157d7d39' })

    Nock('http://localhost:8003')
      .get('/health/info')
      .reply(200, { version: '2.25.2', commit: '2ddff3c9e6b705273cace0e4c1e6a60a6a533289' })

    Nock('http://localhost:8004')
      .get('/health/info')
      .reply(200, { version: '2.25.2', commit: '09d5261d7f92c6dbe5a99ef9afc14722696258e6' })

    Nock('http://localhost:8006')
      .get('/health/info')
      .reply(200, { version: '2.25.2', commit: 'b1816252a6a2f071c02cf68ead590e9cd977e135' })
  })

  after(() => {
    Sinon.restore()
    Nock.cleanAll()
  })

  describe('when all the services are running', () => {
    it('does a thing', async () => {
      const result = await ServiceStatusService.go()

      expect(result).not.to.be.undefined()
    })
  })
})
