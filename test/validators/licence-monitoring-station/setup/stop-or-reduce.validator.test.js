'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const StopOrReduceValidator = require('../../../../app/validators/licence-monitoring-station/setup/stop-or-reduce.validator.js')

describe('Licence Monitoring Station Setup - Stop Or Reduce validator', () => {
  let payload

  describe('when valid data is provided', () => {
    describe('because the user selected the "stop" option', () => {
      beforeEach(() => {
        payload = {
          stopOrReduce: 'stop'
        }
      })

      it('confirms the data is valid', () => {
        const result = StopOrReduceValidator.go(payload)

        expect(result.error).not.to.exist()
      })
    })

    describe('because the user selected the "reduce" option', () => {
      beforeEach(() => {
        payload = {
          stopOrReduce: 'reduce',
          reduceAtThreshold: 'yes'
        }
      })

      it('confirms the data is valid', () => {
        const result = StopOrReduceValidator.go(payload)

        expect(result.error).not.to.exist()
      })
    })
  })

  describe('when an invalid payload is provided', () => {
    describe('because the user did not select anything', () => {
      beforeEach(() => {
        payload = {}
      })

      it('fails validation', () => {
        const result = StopOrReduceValidator.go(payload)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Select if the licence holder needs to stop or reduce')
      })
    })

    describe('because the user selected "reduce" but did not select if the licence holder should stop abstracting water', () => {
      beforeEach(() => {
        payload = {
          stopOrReduce: 'reduce'
        }
      })

      it('fails validation', () => {
        const result = StopOrReduceValidator.go(payload)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal(
          'Select if the licence holder needs to stop abstraction when they reach a certain amount'
        )
      })
    })
  })
})
