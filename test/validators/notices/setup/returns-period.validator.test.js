'use strict'

// Thing under test
const ReturnsPeriodValidator = require('../../../../app/validators/notices/setup/returns-periods.validator.js')

describe('Notices - Setup - Returns Period validator', () => {
  const noticeType = 'invitations'

  describe('when valid data is provided', () => {
    it('confirms the data is valid', () => {
      const result = ReturnsPeriodValidator.go({ returnsPeriod: 'summer' }, noticeType)

      expect(result.value).toBeDefined()
      expect(result.error).toBeUndefined()
    })
  })

  describe('when invalid data is provided', () => {
    describe('because no "returnsPeriod" is given', () => {
      it('fails validation', () => {
        const result = ReturnsPeriodValidator.go({ returnsPeriod: '' }, noticeType)

        expect(result.value).toBeDefined()
        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('Select the returns periods for the invitations')
      })
    })

    describe('because an unknown "returnsPeriod" is given', () => {
      it('fails validation', () => {
        const result = ReturnsPeriodValidator.go({ returnsPeriod: 'just-because' }, noticeType)

        expect(result.value).toBeDefined()
        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('Select the returns periods for the invitations')
      })
    })
  })
})
