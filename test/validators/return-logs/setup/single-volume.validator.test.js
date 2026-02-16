'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const SingleVolumeValidator = require('../../../../app/validators/return-logs/setup/single-volume.validator.js')

describe('Return Logs Setup - Single Volume validator', () => {
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
        it('fails validation with the message "Enter a total amount"', () => {
          const result = SingleVolumeValidator.go(payload)

          expect(result.error).to.exist()
          expect(result.error.details[0].message).to.equal('Enter a total amount')
        })
      })

      describe('but entered text', () => {
        beforeEach(() => {
          payload.singleVolumeQuantity = 'Test'
        })

        it('fails validation with the message "Enter a number for the total amount"', () => {
          const result = SingleVolumeValidator.go(payload)

          expect(result.error).to.exist()
          expect(result.error.details[0].message).to.equal('Enter a number for the total amount')
        })
      })

      describe('but entered a negative volume', () => {
        beforeEach(() => {
          payload.singleVolumeQuantity = '-0.1'
        })

        it('fails validation with the message "Enter a total amount greater than zero"', () => {
          const result = SingleVolumeValidator.go(payload)

          expect(result.error).to.exist()
          expect(result.error.details[0].message).to.equal('Enter a total amount greater than zero')
        })
      })

      describe('but entered a volume too small', () => {
        beforeEach(() => {
          payload.singleVolumeQuantity = '0'
        })

        it('fails validation with the message "Enter a total amount greater than zero"', () => {
          const result = SingleVolumeValidator.go(payload)

          expect(result.error).to.exist()
          expect(result.error.details[0].message).to.equal('Enter a total amount greater than zero')
        })
      })

      describe('but entered an unsafe number', () => {
        const MAX_SAFE_NUMBER = 9007199254740991

        beforeEach(() => {
          payload.singleVolumeQuantity = MAX_SAFE_NUMBER + 1
        })

        it('fails validation with the message "Enter a positive total amount up to a maximum of 9007199254740991"', () => {
          const result = SingleVolumeValidator.go(payload)

          expect(result.error).to.exist()
          expect(result.error.details[0].message).to.equal(
            'Enter a positive total amount up to a maximum of 9007199254740991'
          )
        })
      })

      describe('but entered a volume with more than 6 decimal places', () => {
        beforeEach(() => {
          payload.singleVolumeQuantity = '1.1234567'
        })

        it('fails validation with the message "Enter a total amount with no more than 6 decimal places"', () => {
          const result = SingleVolumeValidator.go(payload)

          expect(result.error).to.exist()
          expect(result.error.details[0].message).to.equal('Enter a total amount with no more than 6 decimal places')
        })
      })
    })
  })
})
