'use strict'

// Thing under test
const AbstractionPeriodValidator = require('../../app/validators/abstraction-period.validator.js')

describe('Abstraction Period validator', () => {
  let payload

  describe('when valid data is provided', () => {
    describe('and the data is provided as strings', () => {
      beforeEach(() => {
        payload = {
          abstractionPeriodStartDay: '01',
          abstractionPeriodStartMonth: '12',
          abstractionPeriodEndDay: '02',
          abstractionPeriodEndMonth: '7'
        }
      })

      it('confirms the data is valid', () => {
        const result = AbstractionPeriodValidator(payload)

        expect(result.value.abstractionPeriodStart).toBeDefined()
        expect(result.value.abstractionPeriodEnd).toBeDefined()
        expect(result.error).toBeUndefined()
      })
    })

    describe('and the data is provided as numbers', () => {
      beforeEach(() => {
        payload = {
          abstractionPeriodStartDay: 1,
          abstractionPeriodStartMonth: 12,
          abstractionPeriodEndDay: 2,
          abstractionPeriodEndMonth: 7
        }
      })

      it('confirms the data is valid', () => {
        const result = AbstractionPeriodValidator(payload)

        expect(result.value.abstractionPeriodStart).toBeDefined()
        expect(result.value.abstractionPeriodEnd).toBeDefined()
        expect(result.error).toBeUndefined()
      })
    })
  })

  describe('when invalid data is provided', () => {
    describe('for the start date, with a valid end date', () => {
      beforeEach(() => {
        payload = {
          abstractionPeriodStartDay: 'INVALID_START_DAY',
          abstractionPeriodStartMonth: 'INVALID_START_MONTH',
          abstractionPeriodEndDay: '02',
          abstractionPeriodEndMonth: '07'
        }
      })

      it('fails validation for only the start date', () => {
        const result = AbstractionPeriodValidator(payload)

        expect(result.value.abstractionPeriodStart).toBeDefined()
        expect(result.value.abstractionPeriodEnd).toBeDefined()
        expect(result.error.details[0].message).toEqual('Enter a real start date')
        expect(result.error.details.length).toEqual(1)
      })
    })

    describe('for the end date, with a valid start date', () => {
      beforeEach(() => {
        payload = {
          abstractionPeriodStartDay: '01',
          abstractionPeriodStartMonth: '12',
          abstractionPeriodEndDay: 'INVALID_END_DAY',
          abstractionPeriodEndMonth: 'INVALID_END_MONTH'
        }
      })

      it('fails validation for only the end date', () => {
        const result = AbstractionPeriodValidator(payload)

        expect(result.value.abstractionPeriodStart).toBeDefined()
        expect(result.value.abstractionPeriodEnd).toBeDefined()
        expect(result.error.details[0].message).toEqual('Enter a real end date')
        expect(result.error.details.length).toEqual(1)
      })
    })

    describe('for the start date, with no end date', () => {
      beforeEach(() => {
        payload = {
          abstractionPeriodStartDay: 'INVALID_START_DAY',
          abstractionPeriodStartMonth: 'INVALID_START_MONTH',
          abstractionPeriodEndDay: null,
          abstractionPeriodEndMonth: null
        }
      })

      it('fails validation correctly for both dates', () => {
        const result = AbstractionPeriodValidator(payload)

        expect(result.value.abstractionPeriodStart).toBeDefined()
        expect(result.value.abstractionPeriodEnd).toBeNull()
        expect(result.error.details[0].message).toEqual('Enter a real start date')
        expect(result.error.details[1].message).toEqual('Select the end date of the abstraction period')
        expect(result.error.details.length).toEqual(2)
      })
    })

    describe('for the end date, with no start date', () => {
      beforeEach(() => {
        payload = {
          abstractionPeriodStartDay: null,
          abstractionPeriodStartMonth: null,
          abstractionPeriodEndDay: 'INVALID_END_DAY',
          abstractionPeriodEndMonth: 'INVALID_END_MONTH'
        }
      })

      it('fails validation correctly for both dates', () => {
        const result = AbstractionPeriodValidator(payload)

        expect(result.value.abstractionPeriodStart).toBeNull()
        expect(result.value.abstractionPeriodEnd).toBeDefined()
        expect(result.error.details[0].message).toEqual('Select the start date of the abstraction period')
        expect(result.error.details[1].message).toEqual('Enter a real end date')
        expect(result.error.details.length).toEqual(2)
      })
    })

    describe('for both dates', () => {
      beforeEach(() => {
        payload = {
          abstractionPeriodStartDay: 'INVALID_START_DAY',
          abstractionPeriodStartMonth: 'INVALID_START_MONTH',
          abstractionPeriodEndDay: 'INVALID_END_DAY',
          abstractionPeriodEndMonth: 'INVALID_END_MONTH'
        }
      })

      it('fails validation correctly for both dates', () => {
        const result = AbstractionPeriodValidator(payload)

        expect(result.value.abstractionPeriodStart).toBeDefined()
        expect(result.value.abstractionPeriodEnd).toBeDefined()
        expect(result.error.details[0].message).toEqual('Enter a real start date')
        expect(result.error.details[1].message).toEqual('Enter a real end date')
        expect(result.error.details.length).toEqual(2)
      })
    })
  })

  describe('when only start abstraction period data is provided', () => {
    beforeEach(() => {
      payload = {
        abstractionPeriodStartDay: '01',
        abstractionPeriodStartMonth: '12',
        abstractionPeriodEndDay: null,
        abstractionPeriodEndMonth: null
      }
    })

    it('fails validation for only the end date', () => {
      const result = AbstractionPeriodValidator(payload)

      expect(result.value.abstractionPeriodStart).toBeDefined()
      expect(result.value.abstractionPeriodEnd).toBeNull()
      expect(result.error.details[0].message).toEqual('Select the end date of the abstraction period')
      expect(result.error.details.length).toEqual(1)
    })
  })

  describe('when only end abstraction period data is provided', () => {
    beforeEach(() => {
      payload = {
        abstractionPeriodStartDay: null,
        abstractionPeriodStartMonth: null,
        abstractionPeriodEndDay: '02',
        abstractionPeriodEndMonth: '7'
      }
    })

    it('fails validation for only the start date', () => {
      const result = AbstractionPeriodValidator(payload)

      expect(result.value.abstractionPeriodStart).toBeNull()
      expect(result.value.abstractionPeriodEnd).toBeDefined()
      expect(result.error.details[0].message).toEqual('Select the start date of the abstraction period')
      expect(result.error.details.length).toEqual(1)
    })
  })

  describe('when no data is provided', () => {
    beforeEach(() => {
      payload = {}
    })

    it('fails validation correctly for both dates', () => {
      const result = AbstractionPeriodValidator(payload)

      expect(result.value.abstractionPeriodStart).toBeNull()
      expect(result.value.abstractionPeriodEnd).toBeNull()
      expect(result.error.details[0].message).toEqual('Select the start date of the abstraction period')
      expect(result.error.details[1].message).toEqual('Select the end date of the abstraction period')
      expect(result.error.details.length).toEqual(2)
    })
  })
})
