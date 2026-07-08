// Thing under test
import PaperReturnValidator from '../../../../app/validators/notices/setup/paper-return.validator.js'

describe('Paper Return Validator', () => {
  let payload

  beforeEach(() => {
    payload = { returns: ['f8243c89-880c-4a66-9452-5da019ef4f4e'] }
  })

  describe('when called with valid data', () => {
    it('returns with no errors', () => {
      const result = PaperReturnValidator(payload)

      expect(result.value).toBeDefined()
      expect(result.error).toBeUndefined()
    })
  })

  describe('when called with invalid data', () => {
    beforeEach(() => {
      payload = { returns: [] }
    })

    it('returns with errors', () => {
      const result = PaperReturnValidator(payload)

      expect(result.value).toBeDefined()
      expect(result.error).toBeDefined()
      expect(result.error.details[0].message).toEqual('Select the returns for the paper return')
    })
  })
})
