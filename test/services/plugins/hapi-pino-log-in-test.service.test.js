// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Thing under test
import HapiPinoLogInTestService from '../../../app/services/plugins//hapi-pino-log-in-test.service.js'

describe('Hapi Pino Log In Test service', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when unit tests are running', () => {
    describe('and we tell it to log events', () => {
      it('returns an empty object - hapi-pino is not silenced', () => {
        const result = HapiPinoLogInTestService(true)

        expect(result).toEqual({})
      })
    })

    describe('and we tell it not to log events in test', () => {
      it('returns an object containing config to silence hapi-pino', () => {
        const result = HapiPinoLogInTestService(false)

        expect(result).toEqual({
          logEvents: false,
          ignoredEventTags: { log: ['DEBUG', 'INFO'], request: ['DEBUG', 'INFO'] }
        })
      })
    })
  })

  describe('when unit tests are not running', () => {
    beforeEach(() => {
      vi.replaceProperty(process, 'env', { ...process.env, NODE_ENV: 'development' })
    })

    describe('and we tell it not to log events in test', () => {
      it('returns an empty object - hapi-pino is not silenced', () => {
        const result = HapiPinoLogInTestService(false)

        expect(result).toEqual({})
      })
    })

    describe('and we tell it to log events in test', () => {
      it('returns an empty object - hapi-pino is not silenced', () => {
        const result = HapiPinoLogInTestService(true)

        expect(result).toEqual({})
      })
    })
  })
})
