// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Thing under test
import ReportedValidator from '../../../../app/validators/return-logs/setup/reported.validator.js'

describe('Return Logs Setup - Reported validator', () => {
  let payload

  describe('when a valid payload is provided', () => {
    describe('because the user selected the "meterReadings" option', () => {
      beforeEach(() => {
        payload = { reported: 'meterReadings' }
      })

      it('confirms the payload is valid', () => {
        const result = ReportedValidator(payload)

        expect(result.error).toBeUndefined()
      })
    })

    describe('because the user selected the "abstractionVolumes" option', () => {
      beforeEach(() => {
        payload = { reported: 'abstractionVolumes' }
      })

      it('confirms the payload is valid', () => {
        const result = ReportedValidator(payload)

        expect(result.error).toBeUndefined()
      })
    })
  })

  describe('when an invalid payload is provided', () => {
    describe('because the user did not select an option', () => {
      beforeEach(() => {
        payload = {}
      })

      it('fails validation with the message "Select how this return was reported"', () => {
        const result = ReportedValidator(payload)

        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('Select how this return was reported')
      })
    })
  })
})
