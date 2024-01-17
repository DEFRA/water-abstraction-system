'use strict'

const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

const StartDateValidator = require('../../../app/validators/return-requirements/start-date.validator.js')

describe('Start Date Validator', () => {
  const testData = {
    day: '15',
    month: '06',
    year: '2023',
    licenceStartDate: '2023-01-01T00:00:00.000Z',
    licenceEndDate: '2023-12-31T00:00:00.000Z'
  }

  describe('when valid data is provided', () => {
    it('confirms the data is valid', () => {
      const result = StartDateValidator.go(testData)

      expect(result.value).to.exist()
      expect(result.error).not.to.exist()
    })
  })

  describe('when invalid data is provided', () => {
    describe('because the date is non-existent', () => {
      it('fails validation', () => {
        const invalidTestData = { ...testData, day: '31', month: '09' }
        const result = StartDateValidator.go(invalidTestData)

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Enter a real start date')
      })
    })

    describe('because the date is before the licence start date', () => {
      it('fails validation', () => {
        const invalidTestData = { ...testData, day: '31', month: '12', year: '2022' }
        const result = StartDateValidator.go(invalidTestData)

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Start date must be after the original licence start date')
      })
    })

    describe('because the date is after the licence end date', () => {
      it('fails validation', () => {
        const invalidTestData = { ...testData, day: '01', month: '01', year: '2024' }
        const result = StartDateValidator.go(invalidTestData)

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Start date must be before the licence end date')
      })
    })

    describe('when the licence end date is null', () => {
      it('validates a start date after the original licence end date', () => {
        const testDataWithNullEndDate = {
          ...testData,
          licenceEndDate: null,
          day: '01',
          month: '01',
          year: '2024'
        }

        const result = StartDateValidator.go(testDataWithNullEndDate)

        expect(result.value).to.exist()
        expect(result.error).not.to.exist()
      })
    })
  })
})
