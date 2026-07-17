// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Thing under test
import FrequencyCollectedValidator from '../../../../app/validators/return-versions/setup/frequency-collected.validator.js'

describe('Return Versions Setup - Frequency Collected validator', () => {
  let payload

  describe('when valid data is provided', () => {
    beforeEach(() => {
      payload = {
        frequencyCollected: 'month'
      }
    })

    it('confirms the data is valid', async () => {
      const result = FrequencyCollectedValidator(payload)

      expect(result.error).toBeUndefined()
      expect(result.value.frequencyCollected).toEqual('month')
    })
  })

  describe('when invalid data is provided', () => {
    beforeEach(() => {
      payload = {
        frequencyCollected: 'ABC123'
      }
    })

    it('fails validation', () => {
      const result = FrequencyCollectedValidator(payload)

      expect(result.error.details[0].message).toEqual('Select how often readings or volumes are collected')
    })
  })

  describe('when no data is provided', () => {
    beforeEach(() => {
      payload = {}
    })

    it('fails validation', () => {
      const result = FrequencyCollectedValidator(payload)

      expect(result.error.details[0].message).toEqual('Select how often readings or volumes are collected')
    })
  })
})
