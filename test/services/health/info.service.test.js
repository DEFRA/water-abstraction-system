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
const ChargingModuleRequest = require('../../../app/requests/charging-module.request.js')
const CreateRedisClientService = require('../../../app/services/health/create-redis-client.service.js')
const FetchImportJobsService = require('../../../app/services/health/fetch-import-jobs.service.js')
const LegacyRequest = require('../../../app/requests/legacy.request.js')
const BaseRequest = require('../../../app/requests/base.request.js')

// Thing under test
// Normally we'd set this to `= require('../../app/services/health/info.service')`. But to control how
// `child_process.exec()` behaves in the service, after it's been promisified we have to use proxyquire.
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

  const goodFetchImportJobsResults = [
    {
      name: 'import.charging-data',
      completedCount: 1,
      failedCount: 0,
      activeCount: 0,
      maxCompletedonDate: new Date('2023-09-04T14:00:10.758Z')
    },
    {
      name: 'licence-import.import-company',
      completedCount: 52963,
      failedCount: 1,
      activeCount: 123,
      maxCompletedonDate: new Date('2023-09-04T10:43:44.503Z')
    }
  ]

  let chargingModuleRequestStub
  let fetchImportJobsStub
  let legacyRequestStub
  let baseRequestStub
  let redisStub

  beforeEach(() => {
    chargingModuleRequestStub = Sinon.stub(ChargingModuleRequest, 'get')
    fetchImportJobsStub = Sinon.stub(FetchImportJobsService, 'go')
    legacyRequestStub = Sinon.stub(LegacyRequest, 'get')
    baseRequestStub = Sinon.stub(BaseRequest, 'get')
    redisStub = Sinon.stub(CreateRedisClientService, 'go')

    // These requests will remain unchanged throughout the tests. We do alter the ones to the AddressFacade and the
    // water-api (foreground-service) though, which is why they are defined separately in each test.
    legacyRequestStub.withArgs('background', 'health/info', null, false).resolves(goodRequestResults.app)
    legacyRequestStub.withArgs('reporting', 'health/info', null, false).resolves(goodRequestResults.app)
    legacyRequestStub.withArgs('import', 'health/info', null, false).resolves(goodRequestResults.app)
    legacyRequestStub.withArgs('crm', 'health/info', null, false).resolves(goodRequestResults.app)
    legacyRequestStub.withArgs('external', 'health/info', null, false).resolves(goodRequestResults.app)
    legacyRequestStub.withArgs('internal', 'health/info', null, false).resolves(goodRequestResults.app)
    legacyRequestStub.withArgs('idm', 'health/info', null, false).resolves(goodRequestResults.app)
    legacyRequestStub.withArgs('permits', 'health/info', null, false).resolves(goodRequestResults.app)
    legacyRequestStub.withArgs('returns', 'health/info', null, false).resolves(goodRequestResults.app)

    chargingModuleRequestStub
      .withArgs('status')
      .resolves(goodRequestResults.chargingModule)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when all the services are running', () => {
    beforeEach(async () => {
      fetchImportJobsStub.resolves(goodFetchImportJobsResults)
      redisStub.returns({ ping: Sinon.stub().resolves(), disconnect: Sinon.stub().resolves() })

      // In this scenario everything is hunky-dory so we return 2xx responses from these services
      baseRequestStub
        .withArgs(`${servicesConfig.addressFacade.url}/address-service/hola`)
        .resolves(goodRequestResults.addressFacade)
      legacyRequestStub.withArgs('water', 'health/info', null, false).resolves(goodRequestResults.app)

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
      const utilStub = {
        promisify: Sinon.stub().callsFake(() => {
          return execStub
        })
      }

      InfoService = Proxyquire('../../../app/services/health/info.service', { util: utilStub })
    })

    it('returns details on each', async () => {
      const result = await InfoService.go()

      expect(result).to.include([
        'virusScannerData', 'redisConnectivityData', 'addressFacadeData', 'chargingModuleData', 'appData'
      ])

      expect(result.appData).to.have.length(10)
      expect(result.appData[0].name).to.equal('Import')
      expect(result.appData[0].serviceName).to.equal('import')
      expect(result.appData[0].version).to.equal('9.0.99')
      expect(result.appData[0].commit).to.equal('99d0e8c')
      expect(result.appData[0].jobs).to.equal([
        [
          { text: 'import.charging-data' },
          { text: 1 },
          { text: 0 },
          { text: 0 },
          { text: '4 September 2023 at 14:00:10' }
        ],
        [
          { text: 'licence-import.import-company' },
          { text: 52963 },
          { text: 1 },
          { text: 123 },
          { text: '4 September 2023 at 10:43:44' }
        ]
      ])
      expect(result.appData[1].jobs).to.equal([])

      expect(result.redisConnectivityData).to.equal('Up and running')
      expect(result.virusScannerData).to.equal('ClamAV 9.99.9/26685/Mon Oct 10 08:00:01 2022\n')
    })
  })

  describe('when Redis', () => {
    beforeEach(async () => {
      fetchImportJobsStub.resolves(goodFetchImportJobsResults)

      // In these scenarios everything is hunky-dory so we return 2xx responses from these services
      baseRequestStub
        .withArgs(`${servicesConfig.addressFacade.url}/address-service/hola`)
        .resolves(goodRequestResults.addressFacade)
      legacyRequestStub.withArgs('water', 'health/info', null, false).resolves(goodRequestResults.app)

      const execStub = Sinon
        .stub()
        .withArgs('clamdscan --version')
        .resolves({
          stdout: 'ClamAV 9.99.9/26685/Mon Oct 10 08:00:01 2022\n',
          stderror: null
        })
      const utilStub = {
        promisify: Sinon.stub().callsFake(() => {
          return execStub
        })
      }

      InfoService = Proxyquire('../../../app/services/health/info.service', { util: utilStub })
    })

    describe('is not running', () => {
      beforeEach(async () => {
        redisStub.returns({
          ping: Sinon.stub().throwsException(new Error('Redis check went boom')),
          disconnect: Sinon.stub().resolves()
        })
      })

      it('handles the error and still returns a result for the other services', async () => {
        const result = await InfoService.go()

        expect(result).to.include([
          'virusScannerData', 'redisConnectivityData', 'addressFacadeData', 'chargingModuleData', 'appData'
        ])
        expect(result.appData).to.have.length(10)
        expect(result.appData[0].version).to.equal('9.0.99')
        expect(result.appData[0].jobs).to.have.length(2)

        expect(result.redisConnectivityData).to.equal('ERROR: Redis check went boom')
        expect(result.virusScannerData).to.equal('ClamAV 9.99.9/26685/Mon Oct 10 08:00:01 2022\n')
      })
    })
  })

  describe('when ClamAV', () => {
    beforeEach(async () => {
      fetchImportJobsStub.resolves(goodFetchImportJobsResults)
      redisStub.returns({ ping: Sinon.stub().resolves(), disconnect: Sinon.stub().resolves() })

      // In these scenarios everything is hunky-dory so we return 2xx responses from these services
      baseRequestStub
        .withArgs(`${servicesConfig.addressFacade.url}/address-service/hola`)
        .resolves(goodRequestResults.addressFacade)
      legacyRequestStub.withArgs('water', 'health/info', null, false).resolves(goodRequestResults.app)
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
        const utilStub = {
          promisify: Sinon.stub().callsFake(() => {
            return execStub
          })
        }

        InfoService = Proxyquire('../../../app/services/health/info.service', { util: utilStub })
      })

      it('handles the error and still returns a result for the other services', async () => {
        const result = await InfoService.go()

        expect(result).to.include([
          'virusScannerData', 'redisConnectivityData', 'addressFacadeData', 'chargingModuleData', 'appData'
        ])
        expect(result.appData).to.have.length(10)
        expect(result.appData[0].version).to.equal('9.0.99')
        expect(result.appData[0].jobs).to.have.length(2)

        expect(result.redisConnectivityData).to.equal('Up and running')
        expect(result.virusScannerData).to.startWith('ERROR:')
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
        const utilStub = {
          promisify: Sinon.stub().callsFake(() => {
            return execStub
          })
        }

        InfoService = Proxyquire('../../../app/services/health/info.service', { util: utilStub })
      })

      it('handles the error and still returns a result for the other services', async () => {
        const result = await InfoService.go()

        expect(result).to.include([
          'virusScannerData', 'redisConnectivityData', 'addressFacadeData', 'chargingModuleData', 'appData'
        ])
        expect(result.appData).to.have.length(10)
        expect(result.appData[0].version).to.equal('9.0.99')
        expect(result.appData[0].jobs).to.have.length(2)

        expect(result.virusScannerData).to.startWith('ERROR:')
        expect(result.redisConnectivityData).to.equal('Up and running')
      })
    })
  })

  describe('when FetchImportJobs service', () => {
    beforeEach(async () => {
      redisStub.returns({ ping: Sinon.stub().resolves(), disconnect: Sinon.stub().resolves() })

      // In this scenario everything is hunky-dory so we return 2xx responses from these services
      baseRequestStub
        .withArgs(`${servicesConfig.addressFacade.url}/address-service/hola`)
        .resolves(goodRequestResults.addressFacade)
      legacyRequestStub.withArgs('water', 'health/info', null, false).resolves(goodRequestResults.app)

      const execStub = Sinon
        .stub()
        .withArgs('clamdscan --version')
        .resolves({
          stdout: 'ClamAV 9.99.9/26685/Mon Oct 10 08:00:01 2022\n',
          stderror: null
        })
      const utilStub = {
        promisify: Sinon.stub().callsFake(() => {
          return execStub
        })
      }

      InfoService = Proxyquire('../../../app/services/health/info.service', { util: utilStub })
    })

    describe('returns no results', () => {
      beforeEach(async () => {
        fetchImportJobsStub.resolves([])
      })

      it('jobs are empty and still returns a result for the other services', async () => {
        const result = await InfoService.go()

        expect(result).to.include([
          'virusScannerData', 'redisConnectivityData', 'addressFacadeData', 'chargingModuleData', 'appData'
        ])
        expect(result.appData).to.have.length(10)
        expect(result.appData[0].version).to.equal('9.0.99')
        expect(result.appData[0].jobs).to.have.length(0)

        expect(result.redisConnectivityData).to.equal('Up and running')
        expect(result.virusScannerData).to.equal('ClamAV 9.99.9/26685/Mon Oct 10 08:00:01 2022\n')
      })
    })

    describe('throws an exception', () => {
      beforeEach(async () => {
        fetchImportJobsStub.throwsException(new Error('FetchImportJobs went boom'))
      })

      it('handles the error and still returns a result for the other services', async () => {
        const result = await InfoService.go()

        expect(result).to.include([
          'virusScannerData', 'redisConnectivityData', 'addressFacadeData', 'chargingModuleData', 'appData'
        ])
        expect(result.appData).to.have.length(10)
        expect(result.appData[0].version).to.equal('9.0.99')
        expect(result.appData[0].jobs).to.have.length(0)

        expect(result.redisConnectivityData).to.equal('Up and running')
        expect(result.virusScannerData).to.equal('ClamAV 9.99.9/26685/Mon Oct 10 08:00:01 2022\n')
      })
    })
  })

  describe('when a service we check via http request', () => {
    beforeEach(async () => {
      fetchImportJobsStub.resolves(goodFetchImportJobsResults)

      // In these scenarios everything is hunky-dory with clamav and redis. So, we go back to our original stubbing
      const execStub = Sinon
        .stub()
        .withArgs('clamdscan --version')
        .resolves({
          stdout: 'ClamAV 9.99.9/26685/Mon Oct 10 08:00:01 2022\n',
          stderror: null
        })
      const utilStub = {
        promisify: Sinon.stub().callsFake(() => {
          return execStub
        })
      }

      InfoService = Proxyquire('../../../app/services/health/info.service', { util: utilStub })

      redisStub.returns({ ping: Sinon.stub().resolves(), disconnect: Sinon.stub().resolves() })
    })

    describe('cannot be reached because of a network error', () => {
      beforeEach(async () => {
        const badResult = { succeeded: false, response: new Error('Kaboom') }

        baseRequestStub
          .withArgs(`${servicesConfig.addressFacade.url}/address-service/hola`)
          .resolves(badResult)
        legacyRequestStub.withArgs('water', 'health/info', null, false).resolves(badResult)
      })

      it('handles the error and still returns a result for the other services', async () => {
        const result = await InfoService.go()

        expect(result).to.include([
          'virusScannerData', 'redisConnectivityData', 'addressFacadeData', 'chargingModuleData', 'appData'
        ])
        expect(result.appData).to.have.length(10)
        expect(result.appData[0].version).to.equal('9.0.99')
        expect(result.appData[0].jobs).to.have.length(2)

        expect(result.addressFacadeData).to.startWith('ERROR:')

        expect(result.virusScannerData).to.equal('ClamAV 9.99.9/26685/Mon Oct 10 08:00:01 2022\n')
        expect(result.redisConnectivityData).to.equal('Up and running')
      })
    })

    describe('returns a 5xx response', () => {
      beforeEach(async () => {
        const badResult = { succeeded: false, response: { statusCode: 500, body: { message: 'Kaboom' } } }

        baseRequestStub
          .withArgs(`${servicesConfig.addressFacade.url}/address-service/hola`)
          .resolves(badResult)
        legacyRequestStub.withArgs('water', 'health/info', null, false).resolves(badResult)
      })

      it('handles the error and still returns a result for the other services', async () => {
        const result = await InfoService.go()

        expect(result).to.include([
          'virusScannerData', 'redisConnectivityData', 'addressFacadeData', 'chargingModuleData', 'appData'
        ])
        expect(result.appData).to.have.length(10)
        expect(result.appData[0].version).to.equal('9.0.99')
        expect(result.appData[0].jobs).to.have.length(2)

        expect(result.addressFacadeData).to.startWith('ERROR:')

        expect(result.virusScannerData).to.equal('ClamAV 9.99.9/26685/Mon Oct 10 08:00:01 2022\n')
        expect(result.redisConnectivityData).to.equal('Up and running')
      })
    })
  })
})
