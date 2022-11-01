'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')
const Nock = require('nock')
const Proxyquire = require('proxyquire')

const { describe, it, before, beforeEach, after } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
// Normally we'd set this to `= require('../../app/services/service_status.service')`. But to control how
// `child_process.exec()` behaves in the service, after it's been promisfied we have to use proxyquire.
let ServiceStatusService // = require('../../app/services/service_status.service')

describe('Service Status service', () => {
  before(() => {
    Nock('http://localhost:8009')
      .get('/address-service/hola')
      .reply(200, 'hey there')

    Nock('http://localhost:8020')
      .get('/status')
      .reply(200, { status: 'alive' }, [
        'x-cma-git-commit',
        '273604040a47e0977b0579a0fef0f09726d95e39',
        'x-cma-docker-tag',
        'ghcr.io/defra/sroc-charging-module-api:v9.99.9']
      )

    Nock('http://localhost:8001')
      .get('/health/info')
      .reply(200, { version: '8.0.1', commit: '83d0e8cdde5b7ac700cb29107503d9c5464ee964' })

    Nock('http://localhost:8012')
      .get('/health/info')
      .reply(200, { version: '8.0.12', commit: '83d0e8cdde5b7ac700cb29107503d9c5464ee964' })

    Nock('http://localhost:8011')
      .get('/health/info')
      .reply(200, { version: '8.0.11', commit: 'a7030dc9180708a8539b7e7d46b7317ad246017a' })

    Nock('http://localhost:8007')
      .get('/health/info')
      .reply(200, { version: '8.0.7', commit: 'a181fb112d61a36e2d3dabc95f81e29369139c5c' })

    Nock('http://localhost:8002')
      .get('/health/info')
      .reply(200, { version: '8.0.2', commit: '58bd0c18ffc7f4248bed0ed4ef8c06a3ef4dff6b' })

    Nock('http://localhost:8000')
      .get('/health/info')
      .reply(200, { version: '8.0.0', commit: 'f154e3f9e4c87366e070c32f231e8590157d7d39' })

    Nock('http://localhost:8008')
      .get('/health/info')
      .reply(200, { version: '8.0.8', commit: 'f154e3f9e4c87366e070c32f231e8590157d7d39' })

    Nock('http://localhost:8003')
      .get('/health/info')
      .reply(200, { version: '8.0.3', commit: '2ddff3c9e6b705273cace0e4c1e6a60a6a533289' })

    Nock('http://localhost:8004')
      .get('/health/info')
      .reply(200, { version: '8.0.4', commit: '09d5261d7f92c6dbe5a99ef9afc14722696258e6' })

    Nock('http://localhost:8006')
      .get('/health/info')
      .reply(200, { version: '8.0.6', commit: 'b1816252a6a2f071c02cf68ead590e9cd977e135' })
  })

  after(() => {
    Sinon.restore()
    Nock.cleanAll()
  })

  describe('when all the services are running', () => {
    beforeEach(async () => {
      const execStub = Sinon.stub().onFirstCall().resolves({ stdout: 'ClamAV 9.99.9/26685/Mon Oct 10 08:00:01 2022\n', stderror: null })
      execStub.onSecondCall().resolves({ stdout: 'Redis server v=9.99.9 sha=00000000:0 malloc=jemalloc-5.2.1 bits=64 build=66bd629f924ac924\n', stderror: null })
      const utilStub = { promisify: Sinon.stub().callsFake(() => execStub) }
      ServiceStatusService = Proxyquire('../../app/services/service_status.service', { util: utilStub })
    })

    it('returns details on each', async () => {
      const result = await ServiceStatusService.go()

      console.log(result)

      expect(result).to.include([
        'virusScannerData', 'redisConnectivityData', 'addressFacadeData', 'chargingModuleData', 'appData'
      ])

      expect(result.appData).to.have.length(10)
    })
  })
})
