'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')
const Nock = require('nock')
const Proxyquire = require('proxyquire')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
// Normally we'd set this to `= require('../../app/services/service_status.service')`. But to control how
// `child_process.exec()` behaves in the service, after it's been promisfied we have to use proxyquire.
let ServiceStatusService // = require('../../app/services/service_status.service')

describe('Service Status service', () => {
  beforeEach(() => {
    // These requests will remain unchanged throughout the tests. We do alter the ones to the AddressFacade and the
    // water-api (foreground-service) though, which is why they are defined separately in each test.
    Nock('http://localhost:8020')
      .get('/status')
      .reply(200, { status: 'alive' },
        [
          'x-cma-git-commit', '273604040a47e0977b0579a0fef0f09726d95e39',
          'x-cma-docker-tag', 'ghcr.io/defra/sroc-charging-module-api:v9.99.9'
        ]
      )

    Nock('http://localhost:8012').get('/health/info').reply(200, { version: '8.0.12', commit: '83d0e8c' })
    Nock('http://localhost:8011').get('/health/info').reply(200, { version: '8.0.11', commit: 'a7030dc' })
    Nock('http://localhost:8007').get('/health/info').reply(200, { version: '8.0.7', commit: 'a181fb1' })
    Nock('http://localhost:8002').get('/health/info').reply(200, { version: '8.0.2', commit: '58bd0c1' })
    Nock('http://localhost:8000').get('/health/info').reply(200, { version: '8.0.0', commit: 'f154e3f' })
    Nock('http://localhost:8008').get('/health/info').reply(200, { version: '8.0.8', commit: 'f154e3f' })
    Nock('http://localhost:8003').get('/health/info').reply(200, { version: '8.0.3', commit: '2ddff3c' })
    Nock('http://localhost:8004').get('/health/info').reply(200, { version: '8.0.4', commit: '09d5261' })
    Nock('http://localhost:8006').get('/health/info').reply(200, { version: '8.0.6', commit: 'b181625' })
  })

  afterEach(() => {
    Sinon.restore()
    Nock.cleanAll()
  })

  describe('when all the services are running', () => {
    beforeEach(async () => {
      // In this scenario everything is hunky-dory so we return 2xx responses from these services
      Nock('http://localhost:8009').get('/address-service/hola').reply(200, 'hey there')
      Nock('http://localhost:8001').get('/health/info').reply(200, { version: '8.0.1', commit: '83d0e8c' })

      // Unfortunately, this convoluted test setup is the only way we've managed to stub how the promisified version of
      // `child-process.exec()` behaves in the class under test.
      // We create an anonymous stub, which responds differently for the 1st and 2nd call. We rely on knowing the order
      // they are called in the class under test for this to work.
      // We then stub the util library's `promisify()` method and tell it to calll our anonymous stub when invoked.
      // The bit that makes all this work is the fact we use Proxyquire to load our stubbed util instead of the real
      // one when we load our class under test
      const execStub = Sinon.stub().onFirstCall().resolves({ stdout: 'ClamAV 9.99.9/26685/Mon Oct 10 08:00:01 2022\n', stderror: null })
      execStub.onSecondCall().resolves({ stdout: 'Redis server v=9.99.9 sha=00000000:0 malloc=jemalloc-5.2.1 bits=64 build=66bd629f924ac924\n', stderror: null })
      const utilStub = { promisify: Sinon.stub().callsFake(() => execStub) }
      ServiceStatusService = Proxyquire('../../app/services/service_status.service', { util: utilStub })
    })

    it('returns details on each', async () => {
      const result = await ServiceStatusService.go()

      expect(result).to.include([
        'virusScannerData', 'redisConnectivityData', 'addressFacadeData', 'chargingModuleData', 'appData'
      ])

      expect(result.appData).to.have.length(10)
    })
  })

  describe('when a service we check via the shell', () => {
    beforeEach(async () => {
      // In these scenarios everything is hunky-dory so we return 2xx responses from these services
      Nock('http://localhost:8009').get('/address-service/hola').reply(200, 'hey there')
      Nock('http://localhost:8001').get('/health/info').reply(200, { version: '8.0.1', commit: '83d0e8c' })
    })

    describe('is not running', () => {
      beforeEach(async () => {
        // We tweak our anonymous stub so that it returns stderr populated, which is what happens if the shell call
        // returns a non-zero exit code.
        const execStub = Sinon.stub().onFirstCall().resolves({ stdout: null, stderr: 'Could not connect to clamd' })
        execStub.onSecondCall().resolves({ stdout: null, stderr: 'Could not connect to Redis' })
        const utilStub = { promisify: Sinon.stub().callsFake(() => execStub) }
        ServiceStatusService = Proxyquire('../../app/services/service_status.service', { util: utilStub })
      })

      it('handles the error and still returns a result for the other services', async () => {
        const result = await ServiceStatusService.go()

        expect(result).to.include([
          'virusScannerData', 'redisConnectivityData', 'addressFacadeData', 'chargingModuleData', 'appData'
        ])
        expect(result.appData).to.have.length(10)

        expect(result.virusScannerData).to.startWith('ERROR:')
        expect(result.redisConnectivityData).to.startWith('ERROR:')
      })
    })

    describe('throws an exception', () => {
      beforeEach(async () => {
        // In this tweak we tell our anonymous stub to throw an exception when invoked. Not sure when this would happen
        // but we've coded for the eventuality so we need to test it
        const execStub = Sinon.stub().onFirstCall().throwsException(new Error('ClamAV check went boom'))
        execStub.onSecondCall().throwsException(new Error('Redis check went boom'))
        const utilStub = { promisify: Sinon.stub().callsFake(() => execStub) }
        ServiceStatusService = Proxyquire('../../app/services/service_status.service', { util: utilStub })
      })

      it('handles the error and still returns a result for the other services', async () => {
        const result = await ServiceStatusService.go()

        expect(result).to.include([
          'virusScannerData', 'redisConnectivityData', 'addressFacadeData', 'chargingModuleData', 'appData'
        ])
        expect(result.appData).to.have.length(10)

        expect(result.virusScannerData).to.startWith('ERROR:')
        expect(result.redisConnectivityData).to.startWith('ERROR:')
      })
    })
  })

  describe('when a service we check via http request', () => {
    beforeEach(async () => {
      // In these scenarios everything is hunky-dory with clamav and redis. So, we go back to our original stubbing
      const execStub = Sinon.stub().onFirstCall().resolves({ stdout: 'ClamAV 9.99.9/26685/Mon Oct 10 08:00:01 2022\n', stderror: null })
      execStub.onSecondCall().resolves({ stdout: 'Redis server v=9.99.9 sha=00000000:0 malloc=jemalloc-5.2.1 bits=64 build=66bd629f924ac924\n', stderror: null })
      const utilStub = { promisify: Sinon.stub().callsFake(() => execStub) }
      ServiceStatusService = Proxyquire('../../app/services/service_status.service', { util: utilStub })
    })

    describe('cannot be reached because of a network error', () => {
      beforeEach(async () => {
        Nock('http://localhost:8009').get('/address-service/hola').replyWithError({ code: 'ECONNRESET' })
        Nock('http://localhost:8001').get('/health/info').replyWithError({ code: 'ECONNRESET' })
      })

      it('handles the error and still returns a result for the other services', async () => {
        const result = await ServiceStatusService.go()

        expect(result).to.include([
          'virusScannerData', 'redisConnectivityData', 'addressFacadeData', 'chargingModuleData', 'appData'
        ])
        expect(result.appData).to.have.length(10)

        expect(result.addressFacadeData).to.startWith('ERROR:')
        expect(result.appData[0].version).to.startWith('ERROR:')
      })
    })

    describe('returns a 5xx response', () => {
      beforeEach(async () => {
        Nock('http://localhost:8009').get('/address-service/hola').reply(500, 'Kaboom')
        Nock('http://localhost:8001').get('/health/info').reply(500, 'Kaboom')
      })

      it('handles the error and still returns a result for the other services', async () => {
        const result = await ServiceStatusService.go()

        expect(result).to.include([
          'virusScannerData', 'redisConnectivityData', 'addressFacadeData', 'chargingModuleData', 'appData'
        ])
        expect(result.appData).to.have.length(10)

        expect(result.addressFacadeData).to.startWith('ERROR:')
        expect(result.appData[0].version).to.startWith('ERROR:')
      })
    })
  })
})
