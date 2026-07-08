// Thing under test
import CheckValidator from '../../../../app/validators/return-logs/setup/check.validator.js'

describe('Return Logs Setup - Check validator', () => {
  let lines
  let session

  describe('when valid abstraction amounts are provided', () => {
    beforeEach(() => {
      lines = [
        {
          endDate: '2025-04-30T00:00:00.000Z',
          quantity: 0,
          reading: 10,
          startDate: '2025-04-01T00:00:00.000Z'
        },
        {
          endDate: '2025-05-31T00:00:00.000Z',
          startDate: '2025-05-01T00:00:00.000Z'
        },
        {
          endDate: '2025-06-30T00:00:00.000Z',
          quantity: 0,
          reading: 456,
          startDate: '2025-06-01T00:00:00.000Z'
        }
      ]
    })

    describe('and the amount abstracted has been recorded using volumes', () => {
      beforeEach(() => {
        session = { lines, reported: 'abstractionVolumes' }
      })

      it('confirms the session data is valid', () => {
        const result = CheckValidator(session)

        expect(result.error).toBeUndefined()
      })
    })

    describe('and the amount abstracted has been recorded using meter readings', () => {
      beforeEach(() => {
        session = { lines, reported: 'meter-readings', startReading: 10 }
      })

      it('confirms the session data is valid', () => {
        const result = CheckValidator(session)

        expect(result.error).toBeUndefined()
      })
    })
  })

  describe('when invalid abstraction amounts are provided', () => {
    beforeEach(() => {
      lines = [
        {
          endDate: '2025-04-30T00:00:00.000Z',
          quantity: null,
          reading: null,
          startDate: '2025-04-01T00:00:00.000Z'
        },
        {
          endDate: '2025-05-31T00:00:00.000Z',
          startDate: '2025-05-01T00:00:00.000Z'
        },
        {
          endDate: '2025-06-30T00:00:00.000Z',
          startDate: '2025-06-01T00:00:00.000Z'
        }
      ]
    })

    describe('and the amount abstracted has been recorded using volumes', () => {
      beforeEach(() => {
        session = { lines, reported: 'abstractionVolumes' }
      })

      it('fails validation with the message "At least one return line must contain a value."', () => {
        const result = CheckValidator(session)

        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('At least one return line must contain a value.')
      })
    })

    describe('and the amount abstracted has been recorded using meter readings', () => {
      beforeEach(() => {
        session = { lines, reported: 'meter-readings', startReading: 10 }
      })

      it('fails validation with the message "At least one return line must contain a value."', () => {
        const result = CheckValidator(session)

        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('At least one return line must contain a value.')
      })
    })
  })
})
