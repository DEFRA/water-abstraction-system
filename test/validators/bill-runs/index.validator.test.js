'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const IndexValidator = require('../../../app/validators/bill-runs/index.validator.js')

describe('Bill Runs - Index validator', () => {
  let payload

  const regions = [{ id: '1d562e9a-2104-41d9-aa75-c008a7ec9059', displayName: 'Anglian' }]

  describe('when valid data is provided', () => {
    describe('that is fully populated', () => {
      beforeEach(() => {
        payload = _payload()
      })

      it('confirms the data is valid', () => {
        const result = IndexValidator.go(payload, regions)

        expect(result.value).to.equal({
          billRunTypes: ['two_part_tariff'],
          regions: ['1d562e9a-2104-41d9-aa75-c008a7ec9059'],
          yearCreated: 2026
        })
        expect(result.error).not.to.exist()
      })
    })

    describe('that is empty', () => {
      beforeEach(() => {
        payload = {}
      })

      it('confirms the data is valid', () => {
        const result = IndexValidator.go(payload, regions)

        expect(result.value).to.equal({})
        expect(result.error).not.to.exist()
      })
    })
  })

  describe('when invalid data is provided', () => {
    beforeEach(() => {
      payload = _payload()
    })

    describe('because "Run type" is invalid', () => {
      describe('as it is not a valid bill run type', () => {
        beforeEach(() => {
          payload.billRunTypes = ['invalid-run-type']
        })

        it('fails validation', () => {
          const result = IndexValidator.go(payload, regions)

          expect(result.value).to.exist()
          expect(result.error.details[0].message).to.equal('Select a valid run type')
          expect(result.error.details[0].path[0]).to.equal('billRunTypes')
        })
      })
    })

    describe('because "Year created" is invalid', () => {
      describe('as it is not a number', () => {
        beforeEach(() => {
          payload.yearCreated = 'xx'
        })

        it('fails validation', () => {
          const result = IndexValidator.go(payload, regions)

          expect(result.value).to.exist()
          expect(result.error.details[0].message).to.equal('The year created must be a number')
          expect(result.error.details[0].path[0]).to.equal('yearCreated')
        })
      })

      describe('as it is greater than the current year', () => {
        const currentYear = new Date().getFullYear()

        beforeEach(() => {
          payload.yearCreated = currentYear + 1
        })

        it('fails validation', () => {
          const result = IndexValidator.go(payload, regions)

          expect(result.value).to.exist()
          expect(result.error.details[0].message).to.equal(
            `The year created cannot exceed the current year of ${currentYear}`
          )
          expect(result.error.details[0].path[0]).to.equal('yearCreated')
        })
      })

      describe('as it is less than the first year of bill runs (2014)', () => {
        beforeEach(() => {
          payload.yearCreated = '2013'
        })

        it('fails validation', () => {
          const result = IndexValidator.go(payload, regions)

          expect(result.value).to.exist()
          expect(result.error.details[0].message).to.equal('The year created must be greater or equal to 2014')
          expect(result.error.details[0].path[0]).to.equal('yearCreated')
        })
      })

      describe('as it is not a whole number', () => {
        beforeEach(() => {
          payload.yearCreated = '2025.5'
        })

        it('fails validation', () => {
          const result = IndexValidator.go(payload, regions)

          expect(result.value).to.exist()
          expect(result.error.details[0].message).to.equal('The year created must be a whole number')
          expect(result.error.details[0].path[0]).to.equal('yearCreated')
        })
      })
    })

    describe('because "Region" is invalid', () => {
      describe('as it is not a valid region', () => {
        beforeEach(() => {
          payload.regions = ['invalid-region-id']
        })

        it('fails validation', () => {
          const result = IndexValidator.go(payload, regions)

          expect(result.value).to.exist()
          expect(result.error.details[0].message).to.equal('Select a valid region')
          expect(result.error.details[0].path[0]).to.equal('regions')
        })
      })
    })
  })
})

function _payload() {
  return {
    billRunTypes: ['two_part_tariff'],
    regions: ['1d562e9a-2104-41d9-aa75-c008a7ec9059'],
    yearCreated: '2026'
  }
}
