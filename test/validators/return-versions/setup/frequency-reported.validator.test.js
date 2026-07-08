'use strict'

// Thing under test
const FrequencyReportedValidator = require('../../../../app/validators/return-versions/setup/frequency-reported.validator.js')

describe('Return Versions Setup - Frequency reported validator', () => {
  let payload

  describe('when valid data is provided', () => {
    beforeEach(() => {
      payload = {
        frequencyReported: 'month'
      }
    })

    it('confirms the data is valid', async () => {
      const result = FrequencyReportedValidator(payload)

      expect(result.value.frequencyReported).toEqual('month')
      expect(result.error).toBeUndefined()
    })
  })

  describe('when invalid data is provided', () => {
    beforeEach(() => {
      payload = {
        frequencyReported: 'ABC123'
      }
    })

    it('fails validation', () => {
      const result = FrequencyReportedValidator(payload)

      expect(result.error.details[0].message).toEqual('Select how often readings or volumes are reported')
    })
  })

  describe('when no data is provided', () => {
    beforeEach(() => {
      payload = {}
    })

    it('fails validation', () => {
      const result = FrequencyReportedValidator(payload)

      expect(result.error.details[0].message).toEqual('Select how often readings or volumes are reported')
    })
  })
})
