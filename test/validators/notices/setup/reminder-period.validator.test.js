// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Thing under test
import ReminderPeriodValidator from '../../../../src/validators/notices/setup/reminder-period.validator.js'

describe('Reminder Period Validator', () => {
  let payload

  describe('when called with valid data', () => {
    beforeEach(() => {
      payload = { reminderPeriod: 'b22592ce-0152-4e3c-9f11-0d0423256012' }
    })

    it('returns with no errors', () => {
      const result = ReminderPeriodValidator(payload)

      expect(result.value).toBeDefined()
      expect(result.error).toBeUndefined()
    })
  })

  describe('when called with invalid data', () => {
    beforeEach(() => {
      payload = {}
    })

    it('returns with errors', () => {
      const result = ReminderPeriodValidator(payload)

      expect(result.value).toBeDefined()
      expect(result.error).toBeDefined()
      expect(result.error.details[0].message).toEqual('Select the returns period for the reminders')
    })
  })
})
