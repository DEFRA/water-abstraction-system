// Test framework
import { describe, expect, it } from 'vitest'

// Thing under test
import SubmissionValidator from '../../../../app/validators/return-logs/setup/submission.validator.js'

describe('Return Logs Setup - Submission validator', () => {
  describe('when valid data is provided', () => {
    it('confirms the data is valid', () => {
      const result = SubmissionValidator({ journey: 'enterReturn' })

      expect(result.value).toBeDefined()
      expect(result.error).toBeUndefined()
    })
  })

  describe('when invalid data is provided', () => {
    describe('because no "journey" is given', () => {
      it('fails validation', () => {
        const result = SubmissionValidator({ journey: '' })

        expect(result.value).toBeDefined()
        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('Select what you want to do with this return')
      })
    })

    describe('because an unknown "type" is given', () => {
      it('fails validation', () => {
        const result = SubmissionValidator({ journey: 'invalid' })

        expect(result.value).toBeDefined()
        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('Select what you want to do with this return')
      })
    })
  })
})
