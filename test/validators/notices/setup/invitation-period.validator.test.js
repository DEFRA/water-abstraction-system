// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Thing under test
import InvitationPeriodValidator from '../../../../src/validators/notices/setup/invitation-period.validator.js'

describe('Invitation Period Validator', () => {
  let payload

  describe('when called with valid data', () => {
    beforeEach(() => {
      payload = { invitationPeriod: 'b22592ce-0152-4e3c-9f11-0d0423256012' }
    })

    it('returns with no errors', () => {
      const result = InvitationPeriodValidator(payload)

      expect(result.value).toBeDefined()
      expect(result.error).toBeUndefined()
    })
  })

  describe('when called with invalid data', () => {
    beforeEach(() => {
      payload = {}
    })

    it('returns with errors', () => {
      const result = InvitationPeriodValidator(payload)

      expect(result.value).toBeDefined()
      expect(result.error).toBeDefined()
      expect(result.error.details[0].message).toEqual('Select the returns period for the invitations')
    })
  })
})
