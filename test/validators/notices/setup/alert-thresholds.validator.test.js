// Thing under test
import AlertThresholdsValidator from '../../../../app/validators/notices/setup/alert-thresholds.validator.js'

describe('Notices Setup - Setup - Alert Thresholds validator', () => {
  let payload

  beforeEach(() => {
    payload = { alertThresholds: ['0'] }
  })

  describe('when called with valid data', () => {
    it('returns with no errors', () => {
      const result = AlertThresholdsValidator(payload)

      expect(result.value).toBeDefined()
      expect(result.error).toBeUndefined()
    })

    describe('and the "alert-thresholds"', () => {
      describe('is an array', () => {
        beforeEach(() => {
          payload = { alertThresholds: ['0'] }
        })

        it('returns with no errors', () => {
          const result = AlertThresholdsValidator(payload)

          expect(result.value).toBeDefined()
          expect(result.error).toBeUndefined()
        })
      })
    })
  })

  describe('when called with invalid data', () => {
    describe('and the "alert-thresholds"', () => {
      describe('is not present', () => {
        beforeEach(() => {
          payload = {}
        })

        it('returns with errors', () => {
          const result = AlertThresholdsValidator(payload)

          expect(result.value).toBeDefined()
          expect(result.error).toBeDefined()
          expect(result.error.details[0].message).toEqual('Select applicable threshold(s)')
        })
      })

      describe('is an array with no items', () => {
        beforeEach(() => {
          payload = { alertThresholds: [] }
        })

        it('returns with errors', () => {
          const result = AlertThresholdsValidator(payload)

          expect(result.value).toBeDefined()
          expect(result.error).toBeDefined()
          expect(result.error.details[0].message).toEqual('Select applicable threshold(s)')
        })
      })
    })
  })
})
