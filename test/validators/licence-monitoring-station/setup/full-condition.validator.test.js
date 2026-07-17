// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Thing under test
import FullConditionValidator from '../../../../app/validators/licence-monitoring-station/setup/full-condition.validator.js'

describe('Full Condition Validator', () => {
  let payload

  describe('when called with valid data', () => {
    describe('a uuid', () => {
      beforeEach(() => {
        payload = {
          condition: '2c7d8751-6c78-4958-bb88-02bf7801e818'
        }
      })

      it('returns with no errors', () => {
        const result = FullConditionValidator(payload)

        expect(result.value).toBeDefined()
        expect(result.error).toBeUndefined()
      })
    })

    describe('the string no_condition', () => {
      beforeEach(() => {
        payload = {
          condition: 'no_condition'
        }
      })

      it('returns with no errors', () => {
        const result = FullConditionValidator(payload)

        expect(result.value).toBeDefined()
        expect(result.error).toBeUndefined()
      })
    })
  })

  describe('when called with invalid data', () => {
    describe('a payload without condition', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns with errors', () => {
        const result = FullConditionValidator(payload)

        expect(result.value).toBeDefined()
        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('Select a condition')
      })
    })

    describe('a payload with an invalid value', () => {
      beforeEach(() => {
        payload = {
          condition: 'INVALID'
        }
      })

      it('returns with errors', () => {
        const result = FullConditionValidator(payload)

        expect(result.value).toBeDefined()
        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('"condition" must be a valid GUID')
      })
    })
  })
})
