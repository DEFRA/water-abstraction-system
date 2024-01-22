'use strict'

const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

const StartDateValidator = require('../../../app/validators/return-requirements/start-date.validator.js')

describe('Start Date Validator', () => {
  const testData = {
    startDate: 'anotherStartDate',
    'start-date-day': '15',
    'start-date-month': '06',
    'start-date-year': '2023',
    licenceStartDate: '2023-01-01T00:00:00.000Z',
    licenceEndDate: '2023-12-31T00:00:00.000Z'
  }
  const customErrorMessages = {
    realStartDate: 'Enter a real start date',
    selectStartDate: 'Select the start date for the return requirement',
    dateGreaterThan: 'Start date must be after the original licence start date',
    dateLessThan: 'Start date must be before the licence end date'
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
        const invalidTestData = { ...testData, 'start-date-day': '31', 'start-date-month': '02', 'start-date-year': 'aaa' }
        const result = StartDateValidator.go(invalidTestData)

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal(customErrorMessages.realStartDate)
      })
    })

    describe('because the date is before the licence start date', () => {
      it('fails validation', () => {
        const invalidTestData = { ...testData, 'start-date-day': '31', 'start-date-month': '12', 'start-date-year': '2022' }
        const result = StartDateValidator.go(invalidTestData)

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal(customErrorMessages.dateGreaterThan)
      })
    })

    describe('because the date is after the licence end date', () => {
      it('fails validation', () => {
        const invalidTestData = { ...testData, 'start-date-day': '01', 'start-date-month': '01', 'start-date-year': '2024' }
        const result = StartDateValidator.go(invalidTestData)

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal(customErrorMessages.dateLessThan)
      })
    })

    describe('when the licence end date is null', () => {
      it('validates a start date after the original licence end date', () => {
        const testDataWithNullEndDate = {
          ...testData,
          licenceEndDate: null,
          'start-date-day': '01',
          'start-date-month': '01',
          'start-date-year': '2024'
        }

        const result = StartDateValidator.go(testDataWithNullEndDate)

        expect(result.value).to.exist()
        expect(result.error).not.to.exist()
      })
    })

    describe('when invalid individual date fields are provided', () => {
      it('fails validation for an invalid day', () => {
        const invalidDayTestData = { ...testData, 'start-date-day': '32' }
        const result = StartDateValidator.go(invalidDayTestData)

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal(customErrorMessages.realStartDate)
        expect(result.error.details[0].invalidFields).to.include('day')
      })

      it('fails validation for an invalid month', () => {
        const invalidMonthTestData = { ...testData, 'start-date-month': '13' }
        const result = StartDateValidator.go(invalidMonthTestData)

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal(customErrorMessages.realStartDate)
        expect(result.error.details[0].invalidFields).to.include('month')
      })

      it('fails validation for an invalid year', () => {
        const invalidYearTestData = { ...testData, 'start-date-year': 'abc' }
        const result = StartDateValidator.go(invalidYearTestData)

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal(customErrorMessages.realStartDate)
        expect(result.error.details[0].invalidFields).to.include('year')
      })
    })
  })
})
