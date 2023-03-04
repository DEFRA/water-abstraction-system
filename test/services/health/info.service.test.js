'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')
const Proxyquire = require('proxyquire')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const servicesConfig = require('../../../config/services.config.js')

// Things we need to stub
const ChargingModuleRequestLib = require('../../../app/lib/charging-module-request.lib.js')
const LegacyRequestLib = require('../../../app/lib/legacy-request.lib.js')
const RequestLib = require('../../../app/lib/request.lib.js')

// Thing under test
// Normally we'd set this to `= require('../../app/services/health/info.service')`. But to control how
// `child_process.exec()` behaves in the service, after it's been promisfied we have to use proxyquire.
let InfoService // = require('../../app/services/health/info.service')

describe('Info service', () => {
  const goodRequestResults = {
    addressFacade: { succeeded: true, response: { statusCode: 200, body: 'hey there' } },
    chargingModule: {
      succeeded: true,
      response: {
        statusCode: 200,
        info: {
          gitCommit: '273604040a47e0977b0579a0fef0f09726d95e39',
          dockerTag: 'ghcr.io/defra/sroc-charging-module-api:v0.19.0'
        }
      }
    },
    app: { succeeded: true, response: { statusCode: 200, body: { version: '9.0.99', commit: '99d0e8c' } } }
  }
  let chargingModuleRequestLibStub
  let legacyRequestLibStub
  let requestLibStub

  beforeEach(() => {
    chargingModuleRequestLibStub = Sinon.stub(ChargingModuleRequestLib, 'get')
    legacyRequestLibStub = Sinon.stub(LegacyRequestLib, 'get')
    requestLibStub = Sinon.stub(RequestLib, 'get')

    // These requests will remain unchanged throughout the tests. We do alter the ones to the AddressFacade and the
    // water-api (foreground-service) though, which is why they are defined separately in each test.
    legacyRequestLibStub.withArgs('background', 'health/info', false).resolves(goodRequestResults.app)
    legacyRequestLibStub.withArgs('reporting', 'health/info', false).resolves(goodRequestResults.app)
    legacyRequestLibStub.withArgs('import', 'health/info', false).resolves(goodRequestResults.app)
    legacyRequestLibStub.withArgs('crm', 'health/info', false).resolves(goodRequestResults.app)
    legacyRequestLibStub.withArgs('external', 'health/info', false).resolves(goodRequestResults.app)
    legacyRequestLibStub.withArgs('internal', 'health/info', false).resolves(goodRequestResults.app)
    legacyRequestLibStub.withArgs('idm', 'health/info', false).resolves(goodRequestResults.app)
    legacyRequestLibStub.withArgs('permits', 'health/info', false).resolves(goodRequestResults.app)
    legacyRequestLibStub.withArgs('returns', 'health/info', false).resolves(goodRequestResults.app)

    chargingModuleRequestLibStub
      .withArgs('status')
      .resolves(goodRequestResults.chargingModule)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when all the services are running', () => {
    beforeEach(async () => {
      // In this scenario everything is hunky-dory so we return 2xx responses from these services
      requestLibStub
        .withArgs(`${servicesConfig.addressFacade.url}/address-service/hola`)
        .resolves(goodRequestResults.addressFacade)
      legacyRequestLibStub.withArgs('water', 'health/info', false).resolves(goodRequestResults.app)

      // Unfortunately, this convoluted test setup is the only way we've managed to stub how the promisified version of
      // `child-process.exec()` behaves in the module under test.
      // We create an anonymous stub, which responds differently depending on which service is being checked. We then
      // stub the util library's `promisify()` method and tell it to call our anonymous stub when invoked. The bit that
      // makes all this work is the fact we use Proxyquire to load our stubbed util instead of the real one when we load
      // our module under test
      const execStub = Sinon
        .stub()
        .withArgs('clamdscan --version')
        .resolves({
          stdout: 'ClamAV 9.99.9/26685/Mon Oct 10 08:00:01 2022\n',
          stderror: null
        })
      execStub
        .withArgs('redis-server --version')
        .resolves({
          stdout: 'Redis server v=9.99.9 sha=00000000:0 malloc=jemalloc-5.2.1 bits=64 build=66bd629f924ac924\n',
          stderror: null
        })
      const utilStub = { promisify: Sinon.stub().callsFake(() => execStub) }
      InfoService = Proxyquire('../../../app/services/health/info.service', { util: utilStub })
    })

    it('returns details on each', async () => {
      const result = await InfoService.go()

      expect(result).to.include([
        'virusScannerData', 'redisConnectivityData', 'addressFacadeData', 'chargingModuleData', 'appData'
      ])

      expect(result.appData).to.have.length(10)
    })
  })

  describe('when a service we check via the shell', () => {
    beforeEach(async () => {
      // In these scenarios everything is hunky-dory so we return 2xx responses from these services
      requestLibStub
        .withArgs(`${servicesConfig.addressFacade.url}/address-service/hola`)
        .resolves(goodRequestResults.addressFacade)
      legacyRequestLibStub.withArgs('water', 'health/info', false).resolves(goodRequestResults.app)
    })

    describe('is not running', () => {
      beforeEach(async () => {
        // We tweak our anonymous stub so that it returns stderr populated, which is what happens if the shell call
        // returns a non-zero exit code.
        const execStub = Sinon
          .stub()
          .withArgs('clamdscan --version')
          .resolves({
            stdout: null,
            stderr: 'Could not connect to clamd'
          })
        execStub
          .withArgs('redis-server --version')
          .resolves({
            stdout: null,
            stderr: 'Could not connect to Redis'
          })
        const utilStub = { promisify: Sinon.stub().callsFake(() => execStub) }
        InfoService = Proxyquire('../../../app/services/health/info.service', { util: utilStub })
      })

      it('handles the error and still returns a result for the other services', async () => {
        const result = await InfoService.go()

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
        const execStub = Sinon
          .stub()
          .withArgs('clamdscan --version')
          .throwsException(new Error('ClamAV check went boom'))
        execStub
          .withArgs('redis-server --version')
          .throwsException(new Error('Redis check went boom'))
        const utilStub = { promisify: Sinon.stub().callsFake(() => execStub) }
        InfoService = Proxyquire('../../../app/services/health/info.service', { util: utilStub })
      })

      it('handles the error and still returns a result for the other services', async () => {
        const result = await InfoService.go()

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
      const execStub = Sinon
        .stub()
        .withArgs('clamdscan --version')
        .resolves({
          stdout: 'ClamAV 9.99.9/26685/Mon Oct 10 08:00:01 2022\n',
          stderror: null
        })
      execStub
        .withArgs('redis-server --version')
        .resolves({
          stdout: 'Redis server v=9.99.9 sha=00000000:0 malloc=jemalloc-5.2.1 bits=64 build=66bd629f924ac924\n',
          stderror: null
        })
      const utilStub = { promisify: Sinon.stub().callsFake(() => execStub) }
      InfoService = Proxyquire('../../../app/services/health/info.service', { util: utilStub })
    })

    describe('cannot be reached because of a network error', () => {
      beforeEach(async () => {
        const badResult = { succeeded: false, response: new Error('Kaboom') }

        requestLibStub
          .withArgs(`${servicesConfig.addressFacade.url}/address-service/hola`)
          .resolves(badResult)
        legacyRequestLibStub.withArgs('water', 'health/info', false).resolves(badResult)
      })

      it('handles the error and still returns a result for the other services', async () => {
        const result = await InfoService.go()

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
        const badResult = { succeeded: false, response: { statusCode: 500, body: { message: 'Kaboom' } } }

        requestLibStub
          .withArgs(`${servicesConfig.addressFacade.url}/address-service/hola`)
          .resolves(badResult)
        legacyRequestLibStub.withArgs('water', 'health/info', false).resolves(badResult)
      })

      it('handles the error and still returns a result for the other services', async () => {
        const result = await InfoService.go()

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
