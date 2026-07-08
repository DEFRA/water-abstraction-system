// Thing under test
import AlertEmailAddressValidator from '../../../../app/validators/notices/setup/alert-email-address.validator.js'

describe('Notices - Setup - Alert Email Address validator', () => {
  let payload

  beforeEach(() => {
    payload = { alertEmailAddressType: 'username' }
  })

  describe('when called with valid data', () => {
    it('returns with no errors', () => {
      const result = AlertEmailAddressValidator(payload)

      expect(result.value).toBeDefined()
      expect(result.error).toBeUndefined()
    })

    describe('and the "otherUser"', () => {
      describe('is an invalid email address', () => {
        beforeEach(() => {
          payload = { alertEmailAddressType: 'other', otherUser: '123123123' }
        })

        it('returns with errors', () => {
          const result = AlertEmailAddressValidator(payload)

          expect(result.value).toBeDefined()
          expect(result.error).toBeDefined()
          expect(result.error.details[0].message).toEqual(
            'Enter an email address in the correct format, like name@example.com'
          )
        })
      })

      describe('is an empty string', () => {
        beforeEach(() => {
          payload = { alertEmailAddressType: 'other', otherUser: '' }
        })

        it('returns with errors', () => {
          const result = AlertEmailAddressValidator(payload)

          expect(result.value).toBeDefined()
          expect(result.error).toBeDefined()
          expect(result.error.details[0].message).toEqual('Enter an email address')
        })
      })

      describe('is a valid email address', () => {
        beforeEach(() => {
          payload = { alertEmailAddressType: 'other', otherUser: 'test@defra.gov.uk' }
        })

        it('returns with no errors', () => {
          const result = AlertEmailAddressValidator(payload)

          expect(result.value).toBeDefined()
          expect(result.error).toBeUndefined()
        })
      })

      describe('is a valid email address but "alertEmailAddressType" is username', () => {
        beforeEach(() => {
          payload = { alertEmailAddressType: 'username', otherUser: 'test@defra.gov.uk' }
        })

        it('returns with no errors', () => {
          const result = AlertEmailAddressValidator(payload)

          expect(result.value).toBeDefined()
          expect(result.error).toBeUndefined()
        })
      })
    })
  })

  describe('when called with invalid data', () => {
    beforeEach(() => {
      payload = {}
    })

    it('returns with errors', () => {
      const result = AlertEmailAddressValidator(payload)

      expect(result.value).toBeDefined()
      expect(result.error).toBeDefined()
      expect(result.error.details[0].message).toEqual('Enter an email address')
    })
  })
})
