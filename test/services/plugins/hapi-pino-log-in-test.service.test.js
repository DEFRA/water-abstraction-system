'use strict'

// Test framework dependencies

const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = require('node:test')
const { expect } = Code

// Thing under test
const HapiPinoLogInTestService = require('../../../app/services/plugins//hapi-pino-log-in-test.service.js')

describe('Hapi Pino Log In Test service', () => {
  afterEach(() => {
    Sinon.restore()
  })

  describe('when unit tests are running', () => {
    describe('and we tell it to log events', () => {
      it('returns an empty object - hapi-pino is not silenced', () => {
        const result = HapiPinoLogInTestService.go(true)

        expect(result).to.equal({})
      })
    })

    describe('and we tell it not to log events in test', () => {
      it('returns an object containing config to silence hapi-pino', () => {
        const result = HapiPinoLogInTestService.go(false)

        expect(result).to.equal({
          logEvents: false,
          ignoredEventTags: { log: ['DEBUG', 'INFO'], request: ['DEBUG', 'INFO'] }
        })
      })
    })
  })

  describe('when unit tests are not running', () => {
    beforeEach(() => {
      Sinon.stub(process, 'env').value({ ...process.env, NODE_ENV: 'development' })
    })

    describe('and we tell it not to log events in test', () => {
      it('returns an empty object - hapi-pino is not silenced', () => {
        const result = HapiPinoLogInTestService.go(false)

        expect(result).to.equal({})
      })
    })

    describe('and we tell it to log events in test', () => {
      it('returns an empty object - hapi-pino is not silenced', () => {
        const result = HapiPinoLogInTestService.go(true)

        expect(result).to.equal({})
      })
    })
  })
})
