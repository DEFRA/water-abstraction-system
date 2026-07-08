'use strict'

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
        const result = StopOrReduceValidator(payload)

        expect(result.error).toBeUndefined()
      })
    })

    describe('because the user selected the "reduce" option', () => {
      describe('and selected "yes" for reduce at threshold', () => {
        beforeEach(() => {
          payload = {
            stopOrReduce: 'reduce',
            reduceAtThreshold: 'yes'
          }
        })

        it('confirms the data is valid', () => {
          const result = StopOrReduceValidator(payload)

          expect(result.error).toBeUndefined()
        })
      })

      describe('and selected "no" for reduce at threshold', () => {
        beforeEach(() => {
          payload = {
            stopOrReduce: 'reduce',
            reduceAtThreshold: 'no'
          }
        })

        it('confirms the data is valid', () => {
          const result = StopOrReduceValidator(payload)

          expect(result.error).toBeUndefined()
        })
      })
    })
  })

  describe('when an invalid payload is provided', () => {
    describe('because the user did not select anything', () => {
      beforeEach(() => {
        payload = {}
      })

      it('fails validation', () => {
        const result = StopOrReduceValidator(payload)

        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('Select if the licence holder needs to stop or reduce')
      })
    })

    describe('because the user selected "reduce" but did not select if the licence holder should stop abstracting water', () => {
      beforeEach(() => {
        payload = {
          stopOrReduce: 'reduce'
        }
      })

      it('fails validation', () => {
        const result = StopOrReduceValidator(payload)

        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual(
          'Select if the licence holder needs to stop abstraction when they reach a certain amount'
        )
      })
    })
  })
})
