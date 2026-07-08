// Thing under test
import MeterProvidedValidator from '../../../../app/validators/return-logs/setup/meter-provided.validator.js'

describe('Return Logs Setup - Meter Provided validator', () => {
  let payload

  describe('when a valid payload is provided', () => {
    describe('because the user selected the "yes" option', () => {
      beforeEach(() => {
        payload = { meterProvided: 'yes' }
      })

      it('confirms the payload is valid', () => {
        const result = MeterProvidedValidator(payload)

        expect(result.error).toBeUndefined()
      })
    })

    describe('because the user selected the "no" option', () => {
      beforeEach(() => {
        payload = { meterProvided: 'no' }
      })

      it('confirms the payload is valid', () => {
        const result = MeterProvidedValidator(payload)

        expect(result.error).toBeUndefined()
      })
    })
  })

  describe('when an invalid payload is provided', () => {
    describe('because the user did not select an option', () => {
      beforeEach(() => {
        payload = {}
      })

      it('fails validation with the message "Select if meter details have been provided"', () => {
        const result = MeterProvidedValidator(payload)

        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('Select if meter details have been provided')
      })
    })
  })
})
