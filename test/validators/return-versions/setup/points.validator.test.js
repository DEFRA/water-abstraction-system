// Test framework
import { describe, expect, it } from 'vitest'

// Thing under test
import PointsValidator from '../../../../app/validators/return-versions/setup/points.validator.js'

describe('Return Versions Setup - Point validator', () => {
  describe('when valid data is provided', () => {
    const payload = { points: ['c083c0cc-42ca-4917-a929-e1fed906ff66', '90764459-d9af-4e13-850b-cf4299fd5e8a'] }

    it('confirms the data is valid', () => {
      const result = PointsValidator(payload)

      expect(result.value).toBeDefined()
      expect(result.error).toBeUndefined()
    })
  })

  describe('when invalid data is provided', () => {
    const payload = { points: ['100345'] }

    it('fails validation', () => {
      const result = PointsValidator(payload)

      expect(result.value).toBeDefined()
      expect(result.error).toBeDefined()
      expect(result.error.details[0].message).toEqual('Select any points for the requirements for returns')
    })
  })

  describe('when no data is provided', () => {
    const payload = { points: [] }

    it('fails validation', () => {
      const result = PointsValidator(payload)

      expect(result.value).toBeDefined()
      expect(result.error).toBeDefined()
      expect(result.error.details[0].message).toEqual('Select any points for the requirements for returns')
    })
  })
})
