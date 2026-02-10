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
          number: 1001,
          regions: ['1d562e9a-2104-41d9-aa75-c008a7ec9059'],
          runTypes: ['two_part_tariff'],
          statuses: ['review'],
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

    describe('because "Number" is invalid', () => {
      describe('as it is not a number', () => {
        beforeEach(() => {
          payload.number = 'xx'
        })

        it('fails validation', () => {
          const result = IndexValidator.go(payload, regions)

          expect(result.value).to.exist()
          expect(result.error.details[0].message).to.equal('The Number must be a number')
          expect(result.error.details[0].path[0]).to.equal('number')
        })
      })

      describe('as it is not greater than zero', () => {
        beforeEach(() => {
          payload.number = '0'
        })

        it('fails validation', () => {
          const result = IndexValidator.go(payload, regions)

          expect(result.value).to.exist()
          expect(result.error.details[0].message).to.equal('The Number must be greater than zero')
          expect(result.error.details[0].path[0]).to.equal('number')
        })
      })

      describe('as it is not a whole number', () => {
        beforeEach(() => {
          payload.number = '1001.5'
        })

        it('fails validation', () => {
          const result = IndexValidator.go(payload, regions)

          expect(result.value).to.exist()
          expect(result.error.details[0].message).to.equal('The Number must be a whole number')
          expect(result.error.details[0].path[0]).to.equal('number')
        })
      })
    })

    describe('because "Run type" is invalid', () => {
      describe('as it is not a valid bill run type', () => {
        beforeEach(() => {
          payload.runTypes = ['invalid-run-type']
        })

        it('fails validation', () => {
          const result = IndexValidator.go(payload, regions)

          expect(result.value).to.exist()
          expect(result.error.details[0].message).to.equal('Select a valid Run type')
          expect(result.error.details[0].path[0]).to.equal('runTypes')
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
          expect(result.error.details[0].message).to.equal('The Year created must be a number')
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
            `The Year created cannot exceed the current year of ${currentYear}`
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
          expect(result.error.details[0].message).to.equal('The Year created must be greater or equal to 2014')
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
          expect(result.error.details[0].message).to.equal('The Year created must be a whole number')
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
          expect(result.error.details[0].message).to.equal('Select a valid Region')
          expect(result.error.details[0].path[0]).to.equal('regions')
        })
      })
    })

    describe('because "Status" is invalid', () => {
      describe('as it is not a valid status', () => {
        beforeEach(() => {
          payload.statuses = ['invalid-status']
        })

        it('fails validation', () => {
          const result = IndexValidator.go(payload, regions)

          expect(result.value).to.exist()
          expect(result.error.details[0].message).to.equal('Select a valid Status')
          expect(result.error.details[0].path[0]).to.equal('statuses')
        })
      })
    })
  })
})

function _payload() {
  return {
    number: '1001',
    regions: ['1d562e9a-2104-41d9-aa75-c008a7ec9059'],
    runTypes: ['two_part_tariff'],
    statuses: ['review'],
    yearCreated: '2026'
  }
}
