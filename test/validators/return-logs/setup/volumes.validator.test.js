// Thing under test
import VolumesValidator from '../../../../app/validators/return-logs/setup/volumes.validator.js'

describe('Return Logs Setup - Volumes validator', () => {
  let payload

  describe('when a valid payload is provided', () => {
    describe('because the user entered a valid volume', () => {
      beforeEach(() => {
        payload = { '2023-05-31T00:00:00.000Z': '200' }
      })

      it('confirms the payload is valid', () => {
        const result = VolumesValidator(payload)

        expect(result.error).toBeUndefined()
      })
    })
  })

  describe('when an invalid payload is provided', () => {
    describe('because the user did not enter a number', () => {
      beforeEach(() => {
        payload = { '2023-05-31T00:00:00.000Z': 'INVALID' }
      })

      it('fails validation with the message "Volume must be a number or blank"', () => {
        const result = VolumesValidator(payload)

        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('Volume must be a number or blank')
      })
    })

    describe('because the user entered a number with more than 6 decimal places', () => {
      beforeEach(() => {
        payload = { '2023-05-31T00:00:00.000Z': '10.1234567' }
      })

      it('fails validation with the message "Enter a Volume with no more than 6 decimal places"', () => {
        const result = VolumesValidator(payload)

        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('Enter a Volume with no more than 6 decimal places')
      })
    })

    describe('because the user entered a negative number', () => {
      beforeEach(() => {
        payload = { '2023-05-31T00:00:00.000Z': '-200' }
      })

      it('fails validation with the message "Volume cannot be negative"', () => {
        const result = VolumesValidator(payload)

        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('Volume cannot be negative')
      })
    })

    describe('because the user entered a number that exceeds the maximum allowed volume of "9999999999"', () => {
      beforeEach(() => {
        payload = { '2023-05-31T00:00:00.000Z': '99999999991' }
      })

      it('fails validation with the message "Volume entered exceeds the maximum of 9999999999"', () => {
        const result = VolumesValidator(payload)

        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('Volume entered exceeds the maximum of 9999999999')
      })
    })

    describe('because the user entered a number that exceeds the maximum safe number "9007199254740991"', () => {
      const MAX_SAFE_NUMBER = 9007199254740991

      beforeEach(() => {
        payload = { '2023-05-31T00:00:00.000Z': MAX_SAFE_NUMBER + 1 }
      })

      it('fails validation with the message "Volume must be blank or between 0 and 9999999999"', () => {
        const result = VolumesValidator(payload)

        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('Volume must be blank or between 0 and 9999999999')
      })
    })
  })
})
