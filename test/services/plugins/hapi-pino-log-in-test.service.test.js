const HapiPinoLogInTestService = require('../../../app/services/plugins/hapi-pino-log-in-test.service.js')

describe('Hapi Pino Log In Test service', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('when unit tests are running', () => {
    describe('and we tell it to log events', () => {
      it('returns an empty object - hapi-pino is not silenced', () => {
        const result = HapiPinoLogInTestService.go(true)

        expect(result).toEqual({})
      })
    })

    describe('and we tell it not to log events in test', () => {
      it('returns an object containing config to silence hapi-pino', () => {
        const result = HapiPinoLogInTestService.go(false)

        expect(result).toEqual({
          logEvents: false,
          ignoredEventTags: { log: ['DEBUG', 'INFO'], request: ['DEBUG', 'INFO'] }
        })
      })
    })
  })

  describe('when unit tests are not running', () => {
    beforeEach(() => {
      const originalProcessEnv = process.env
      process.env = {
        ...originalProcessEnv,
        NODE_ENV: 'development'
      }
    })
    afterAll(() => {
      jest.restoreAllMocks()
    })
    describe('and we tell it not to log events in test', () => {
      it('returns an empty object - hapi-pino is not silenced', () => {
        const result = HapiPinoLogInTestService.go(false)

        expect(result).toEqual({})
      })
    })

    describe('and we tell it to log events in test', () => {
      it('returns an empty object - hapi-pino is not silenced', () => {
        const result = HapiPinoLogInTestService.go(true)

        expect(result).toEqual({})
      })
    })
  })
})
