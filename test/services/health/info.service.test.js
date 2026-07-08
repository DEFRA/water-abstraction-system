import http2 from 'node:http2'
const { HTTP_STATUS_INTERNAL_SERVER_ERROR, HTTP_STATUS_OK } = http2.constants

// Test framework dependencies

// Things we need to stub
import * as AddressFacadeViewHealthRequest from '../../../app/requests/address-facade/view-health.request.js'
import * as ChargingModuleViewHealthRequest from '../../../app/requests/charging-module/view-health.request.js'
import * as CreateRedisClientService from '../../../app/services/health/create-redis-client.service.js'
import * as GotenbergViewHealthRequest from '../../../app/requests/gotenberg/view-health.request.js'
import * as LegacyViewHealthRequest from '../../../app/requests/legacy/view-health.request.js'
import * as NotifyViewHealthRequest from '../../../app/requests/notify/view-health.request.js'
import * as RespViewHealthRequest from '../../../app/requests/resp/view-health.request.js'
import util from 'node:util'

// Thing under test
import InfoService from '../../../app/services/health/info.service.js'

describe('Health - Info service', () => {
  const goodRequestResults = {
    addressFacade: { succeeded: true, response: { statusCode: HTTP_STATUS_OK, body: 'hola' } },
    chargingModule: {
      succeeded: true,
      response: {
        statusCode: HTTP_STATUS_OK,
        info: {
          gitCommit: '273604040a47e0977b0579a0fef0f09726d95e39',
          dockerTag: 'v0.19.1'
        },
        body: { status: 'alive' }
      }
    },
    gotenberg: {
      succeeded: true,
      response: { body: { status: 'up', details: { chromium: { status: 'up' } } } }
    },
    notify: {
      succeeded: true,
      response: {
        body: {
          build_time: '2025-08-20:07:53:38',
          db_version: '0511_process_type_nullable',
          git_commit: '9a404353ee55a7f7cb3b8348b169ad00cc2d540a',
          status: 'ok'
        },
        statusCode: HTTP_STATUS_OK
      }
    },
    resp: {
      succeeded: true,
      response: {
        body: {
          error: null,
          result: [],
          source: 'ReSP'
        },
        statusCode: HTTP_STATUS_OK
      }
    },
    app: { succeeded: true, response: { statusCode: HTTP_STATUS_OK, body: { version: '9.0.99', commit: '99d0e8c' } } }
  }

  let addressFacadeViewStatusRequestStub
  let chargingModuleViewHealthRequestStub
  let gotenbergViewHealthRequestStub
  let legacyViewHealthRequestStub
  let notifyViewHealthRequestStub
  let respViewHealthRequestStub

  beforeEach(() => {
    addressFacadeViewStatusRequestStub = vi.spyOn(AddressFacadeViewHealthRequest, 'send').mockImplementation(() => {})
    chargingModuleViewHealthRequestStub = vi.spyOn(ChargingModuleViewHealthRequest, 'send').mockImplementation(() => {})
    gotenbergViewHealthRequestStub = vi.spyOn(GotenbergViewHealthRequest, 'send').mockImplementation(() => {})
    legacyViewHealthRequestStub = vi.spyOn(LegacyViewHealthRequest, 'send').mockImplementation(() => {})
    notifyViewHealthRequestStub = vi.spyOn(NotifyViewHealthRequest, 'send').mockImplementation(() => {})
    respViewHealthRequestStub = vi.spyOn(RespViewHealthRequest, 'send').mockImplementation(() => {})

    // These requests will remain unchanged throughout the tests. We do alter the ones to the AddressFacade and the
    // water-api (foreground-service) though, which is why they are defined separately in each test.
    legacyViewHealthRequestStub.withArgs('background').resolves(goodRequestResults.app)
    legacyViewHealthRequestStub.withArgs('reporting').resolves(goodRequestResults.app)
    legacyViewHealthRequestStub.withArgs('import').resolves(goodRequestResults.app)
    legacyViewHealthRequestStub.withArgs('crm').resolves(goodRequestResults.app)
    legacyViewHealthRequestStub.withArgs('external').resolves(goodRequestResults.app)
    legacyViewHealthRequestStub.withArgs('internal').resolves(goodRequestResults.app)
    legacyViewHealthRequestStub.withArgs('idm').resolves(goodRequestResults.app)
    legacyViewHealthRequestStub.withArgs('permits').resolves(goodRequestResults.app)
    legacyViewHealthRequestStub.withArgs('returns').resolves(goodRequestResults.app)

    chargingModuleViewHealthRequestStub.mockResolvedValue(goodRequestResults.chargingModule)
    gotenbergViewHealthRequestStub.mockResolvedValue(goodRequestResults.gotenberg)
    notifyViewHealthRequestStub.mockResolvedValue(goodRequestResults.notify)
    respViewHealthRequestStub.mockResolvedValue(goodRequestResults.resp)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when all the services are running', () => {
    beforeEach(() => {
      vi.spyOn(CreateRedisClientService, 'default').mockReturnValue({ ping: vi.fn().mockResolvedValue(), disconnect: vi.fn().mockResolvedValue() })

      // In this scenario everything is hunky-dory so we return 2xx responses from these services
      addressFacadeViewStatusRequestStub.mockResolvedValue(goodRequestResults.addressFacade)

      legacyViewHealthRequestStub.withArgs('water').resolves(goodRequestResults.app)

      const execStub = vi.fn().mockResolvedValue({
        stdout: 'ClamAV 9.99.9/26685/Mon Oct 10 08:00:01 2022\n',
        stderror: null
      })

      vi.spyOn(util, 'promisify').mockReturnValue(execStub)
    })

    it('returns details on each', async () => {
      const result = await InfoService()

      expect(Object.keys(result)).toEqual(
        expect.arrayContaining([
          'addressFacadeData',
          'appData',
          'chargingModuleData',
          'gotenbergData',
          'notifyData',
          'redisConnectivityData',
          'respData',
          'virusScannerData'
        ])
      )

      expect(result.appData).toHaveLength(10)
      expect(result.appData[0].name).toEqual('Import')
      expect(result.appData[0].serviceName).toEqual('import')
      expect(result.appData[0].version).toEqual('9.0.99')
      expect(result.appData[0].commit).toEqual('99d0e8c')

      expect(result.virusScannerData).toEqual('ClamAV 9.99.9/26685/Mon Oct 10 08:00:01 2022\n')
      expect(result.redisConnectivityData).toEqual('Up and running')
      expect(result.addressFacadeData).toEqual('hola')
      expect(result.chargingModuleData).toEqual('v0.19.1')
      expect(result.gotenbergData).toEqual('Up - Chromium Up')
      expect(result.notifyData).toEqual('Up and running')
      expect(result.respData).toEqual('Up and running')
    })
  })

  describe('when Redis', () => {
    beforeEach(async () => {
      // In these scenarios everything is hunky-dory so we return 2xx responses from these services
      addressFacadeViewStatusRequestStub.mockResolvedValue(goodRequestResults.addressFacade)

      legacyViewHealthRequestStub.withArgs('water').resolves(goodRequestResults.app)

      const execStub = vi.fn().mockResolvedValue({
        stdout: 'ClamAV 9.99.9/26685/Mon Oct 10 08:00:01 2022\n',
        stderror: null
      })

      vi.spyOn(util, 'promisify').mockReturnValue(execStub)
    })

    describe('is not running', () => {
      beforeEach(async () => {
        vi.spyOn(CreateRedisClientService, 'default').mockReturnValue({
          ping: vi.fn().mockImplementation(() => { throw new Error('Redis check went boom' })),
          disconnect: vi.fn().mockResolvedValue()
        })
      })

      it('handles the error and still returns a result for the other services', async () => {
        const result = await InfoService()

        expect(Object.keys(result)).toEqual(
          expect.arrayContaining([
            'addressFacadeData',
            'appData',
            'chargingModuleData',
            'gotenbergData',
            'notifyData',
            'redisConnectivityData',
            'respData',
            'virusScannerData'
          ])
        )
        expect(result.appData).toHaveLength(10)
        expect(result.appData[0].version).toEqual('9.0.99')

        expect(result.virusScannerData).toEqual('ClamAV 9.99.9/26685/Mon Oct 10 08:00:01 2022\n')
        expect(result.redisConnectivityData).toEqual('ERROR: Redis check went boom')
        expect(result.addressFacadeData).toEqual('hola')
        expect(result.chargingModuleData).toEqual('v0.19.1')
        expect(result.gotenbergData).toEqual('Up - Chromium Up')
        expect(result.notifyData).toEqual('Up and running')
        expect(result.respData).toEqual('Up and running')
      })
    })
  })

  describe('when ClamAV', () => {
    beforeEach(async () => {
      vi.spyOn(CreateRedisClientService, 'default').mockReturnValue({ ping: vi.fn().mockResolvedValue(), disconnect: vi.fn().mockResolvedValue() })

      // In these scenarios everything is hunky-dory so we return 2xx responses from these services
      addressFacadeViewStatusRequestStub.mockResolvedValue(goodRequestResults.addressFacade)

      legacyViewHealthRequestStub.withArgs('water').resolves(goodRequestResults.app)
    })

    describe('is not running', () => {
      beforeEach(async () => {
        // We tweak the execStub so that it returns stderr populated, which is what happens if the shell call
        // returns a non-zero exit code.
        const execStub = vi.fn().mockResolvedValue({
          stdout: null,
          stderr: 'Could not connect to clamd'
        })

        vi.spyOn(util, 'promisify').mockReturnValue(execStub)
      })

      it('handles the error and still returns a result for the other services', async () => {
        const result = await InfoService()

        expect(Object.keys(result)).toEqual(
          expect.arrayContaining([
            'addressFacadeData',
            'appData',
            'chargingModuleData',
            'gotenbergData',
            'notifyData',
            'redisConnectivityData',
            'respData',
            'virusScannerData'
          ])
        )
        expect(result.appData).toHaveLength(10)
        expect(result.appData[0].version).toEqual('9.0.99')

        expect(result.virusScannerData).toMatch(/^ERROR:/)
        expect(result.redisConnectivityData).toEqual('Up and running')
        expect(result.addressFacadeData).toEqual('hola')
        expect(result.chargingModuleData).toEqual('v0.19.1')
        expect(result.gotenbergData).toEqual('Up - Chromium Up')
        expect(result.notifyData).toEqual('Up and running')
        expect(result.respData).toEqual('Up and running')
      })
    })

    describe('throws an exception', () => {
      beforeEach(async () => {
        // In this tweak we tell the execStub to throw an exception when invoked. Not sure when this would happen
        // but we've coded for the eventuality so we need to test it
        const execStub = vi.fn().withArgs('clamdscan --version').throwsException(new Error('ClamAV check went boom'))

        vi.spyOn(util, 'promisify').mockReturnValue(execStub)
      })

      it('handles the error and still returns a result for the other services', async () => {
        const result = await InfoService()

        expect(Object.keys(result)).toEqual(
          expect.arrayContaining([
            'addressFacadeData',
            'appData',
            'chargingModuleData',
            'gotenbergData',
            'notifyData',
            'redisConnectivityData',
            'respData',
            'virusScannerData'
          ])
        )
        expect(result.appData).toHaveLength(10)
        expect(result.appData[0].version).toEqual('9.0.99')

        expect(result.virusScannerData).toMatch(/^ERROR:/)
        expect(result.redisConnectivityData).toEqual('Up and running')
        expect(result.addressFacadeData).toEqual('hola')
        expect(result.chargingModuleData).toEqual('v0.19.1')
        expect(result.gotenbergData).toEqual('Up - Chromium Up')
        expect(result.notifyData).toEqual('Up and running')
        expect(result.respData).toEqual('Up and running')
      })
    })
  })

  describe('when a service we check via http request', () => {
    beforeEach(async () => {
      // In these scenarios everything is hunky-dory with clamav and redis. So, we go back to our original stubbing
      const execStub = vi.fn().mockResolvedValue({
        stdout: 'ClamAV 9.99.9/26685/Mon Oct 10 08:00:01 2022\n',
        stderror: null
      })

      vi.spyOn(util, 'promisify').mockReturnValue(execStub)

      vi.spyOn(CreateRedisClientService, 'default').mockReturnValue({ ping: vi.fn().mockResolvedValue(), disconnect: vi.fn().mockResolvedValue() })
    })

    describe('cannot be reached because of a network error', () => {
      beforeEach(async () => {
        const badResult = { succeeded: false, response: new Error('Kaboom') }

        addressFacadeViewStatusRequestStub.mockResolvedValue(badResult)

        legacyViewHealthRequestStub.withArgs('water').resolves(badResult)
      })

      it('handles the error and still returns a result for the other services', async () => {
        const result = await InfoService()

        expect(Object.keys(result)).toEqual(
          expect.arrayContaining([
            'addressFacadeData',
            'appData',
            'chargingModuleData',
            'gotenbergData',
            'notifyData',
            'redisConnectivityData',
            'respData',
            'virusScannerData'
          ])
        )
        expect(result.appData).toHaveLength(10)
        expect(result.appData[0].version).toEqual('9.0.99')

        expect(result.virusScannerData).toEqual('ClamAV 9.99.9/26685/Mon Oct 10 08:00:01 2022\n')
        expect(result.redisConnectivityData).toEqual('Up and running')
        expect(result.addressFacadeData).toMatch(/^ERROR:/)
        expect(result.chargingModuleData).toEqual('v0.19.1')
        expect(result.gotenbergData).toEqual('Up - Chromium Up')
        expect(result.notifyData).toEqual('Up and running')
        expect(result.respData).toEqual('Up and running')
      })
    })

    describe('returns a 5xx response', () => {
      beforeEach(async () => {
        const badResult = {
          succeeded: false,
          response: { statusCode: HTTP_STATUS_INTERNAL_SERVER_ERROR, body: { message: 'Kaboom' } }
        }

        addressFacadeViewStatusRequestStub.mockResolvedValue(badResult)

        legacyViewHealthRequestStub.withArgs('water').resolves(badResult)
      })

      it('handles the error and still returns a result for the other services', async () => {
        const result = await InfoService()

        expect(Object.keys(result)).toEqual(
          expect.arrayContaining([
            'addressFacadeData',
            'appData',
            'chargingModuleData',
            'gotenbergData',
            'notifyData',
            'redisConnectivityData',
            'respData',
            'virusScannerData'
          ])
        )
        expect(result.appData).toHaveLength(10)
        expect(result.appData[0].version).toEqual('9.0.99')

        expect(result.virusScannerData).toEqual('ClamAV 9.99.9/26685/Mon Oct 10 08:00:01 2022\n')
        expect(result.redisConnectivityData).toEqual('Up and running')
        expect(result.addressFacadeData).toMatch(/^ERROR:/)
        expect(result.chargingModuleData).toEqual('v0.19.1')
        expect(result.gotenbergData).toEqual('Up - Chromium Up')
        expect(result.notifyData).toEqual('Up and running')
        expect(result.respData).toEqual('Up and running')
      })
    })
  })
})
