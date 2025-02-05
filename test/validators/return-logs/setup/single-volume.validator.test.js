'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const SingleVolumeValidator = require('../../../../app/validators/return-logs/setup/single-volume.validator.js')

describe.only('Return Logs Setup - Single Volume validator', () => {
  let payload

  describe('when a valid payload is provided', () => {
    describe('because the user selected the `yes` option', () => {
      beforeEach(() => {
        payload = { singleVolume: 'yes', singleVolumeQuantity: '1000' }
      })

      it('confirms the payload is valid', () => {
        const result = SingleVolumeValidator.go(payload)

        expect(result.error).not.to.exist()
      })
    })

    describe('because the user selected the `no` option', () => {
      beforeEach(() => {
        payload = { singleVolume: 'no' }
      })

      it('confirms the payload is valid', () => {
        const result = SingleVolumeValidator.go(payload)

        expect(result.error).not.to.exist()
      })
    })
  })

  describe('when an invalid payload is provided', () => {
    describe('because the user did not select an option', () => {
      beforeEach(() => {
        payload = {}
      })

      it('fails validation with the message "Select if its a single volume"', () => {
        const result = SingleVolumeValidator.go(payload)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal("Select if it's a single volume")
      })
    })

    describe('because the user selected "yes"', () => {
      beforeEach(() => {
        payload = { singleVolume: 'yes' }
      })

      describe('but then entered no volume', () => {
        it('fails validation with the message "Enter a total figure"', () => {
          const result = SingleVolumeValidator.go(payload)

          expect(result.error).to.exist()
          expect(result.error.details[0].message).to.equal('Enter a total figure')
        })
      })

      describe('but entered text', () => {
        beforeEach(() => {
          payload.singeVolumeQuantity = 'Test'
        })

        it('fails validation with the message "Enter a total figure"', () => {
          const result = SingleVolumeValidator.go(payload)

          expect(result.error).to.exist()
          expect(result.error.details[0].message).to.equal('Enter a total figure')
        })
      })

      describe('but entered a negative volume', () => {
        beforeEach(() => {
          payload.singeVolumeQuantity = '-0.1'
        })

        it('fails validation with the message "Enter a total figure"', () => {
          const result = SingleVolumeValidator.go(payload)

          expect(result.error).to.exist()
          expect(result.error.details[0].message).to.equal('Enter a total figure')
        })
      })

      describe('but entered a volume too small', () => {
        beforeEach(() => {
          payload.singeVolumeQuantity = '0'
        })

        it('fails validation with the message "Enter a total figure"', () => {
          const result = SingleVolumeValidator.go(payload)

          expect(result.error).to.exist()
          expect(result.error.details[0].message).to.equal('Enter a total figure')
        })
      })

      describe('but entered a volume too big', () => {
        beforeEach(() => {
          payload.singeVolumeQuantity = '9007199254740992'
        })

        it('fails validation with the message "Enter a total figure"', () => {
          const result = SingleVolumeValidator.go(payload)

          expect(result.error).to.exist()
          expect(result.error.details[0].message).to.equal('Enter a total figure')
        })
      })
    })
  })
})
