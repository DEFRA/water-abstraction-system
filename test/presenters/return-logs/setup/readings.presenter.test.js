'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const ReadingsPresenter = require('../../../../app/presenters/return-logs/setup/readings.presenter.js')

describe('Return Logs Setup - Readings presenter', () => {
  let session
  let yearMonth

  beforeEach(() => {
    session = _sessionData()
    yearMonth = '2023-4'
  })

  describe('when provided with a populated session', () => {
    it('correctly presents the data', () => {
      const result = ReadingsPresenter.go(session, yearMonth)

      expect(result).to.equal({
        backLink: '/system/return-logs/setup/e840675e-9fb9-4ce1-bf0a-d140f5c57f47/check',
        inputLines: [
          {
            endDate: '2023-05-31T00:00:00.000Z',
            label: 'May 2023',
            reading: undefined
          }
        ],
        pageTitle: 'Water abstracted May 2023',
        returnReference: '1234'
      })
    })
  })

  describe('the "inputLines" property', () => {
    describe('when the user is entering readings for April', () => {
      beforeEach(() => {
        yearMonth = '2023-3'
      })

      it('returns the line data for April 2023', () => {
        const result = ReadingsPresenter.go(session, yearMonth)

        expect(result.inputLines).to.equal([
          {
            endDate: '2023-04-30T00:00:00.000Z',
            label: 'April 2023',
            reading: '100'
          }
        ])
      })

      describe('and the return frequency is daily', () => {
        beforeEach(() => {
          session.returnsFrequency = 'day'
        })

        it('correctly formats the line label', () => {
          const result = ReadingsPresenter.go(session, yearMonth)

          expect(result.inputLines[0].label).to.equal('30 April 2023')
        })
      })

      describe('and the return frequency is weekly', () => {
        beforeEach(() => {
          session.returnsFrequency = 'week'
        })

        it('correctly formats the line label', () => {
          const result = ReadingsPresenter.go(session, yearMonth)

          expect(result.inputLines[0].label).to.equal('Week ending 30 April 2023')
        })
      })

      describe('and the return frequency is monthly', () => {
        beforeEach(() => {
          session.returnsFrequency = 'month'
        })

        it('correctly formats the line label', () => {
          const result = ReadingsPresenter.go(session, yearMonth)

          expect(result.inputLines[0].label).to.equal('April 2023')
        })
      })

      describe('and a validation error exists on the line', () => {
        beforeEach(() => {
          session.lines[0].error = 'There is an error on this line'
        })

        it('includes the error message in the line data', () => {
          const result = ReadingsPresenter.go(session, yearMonth)

          expect(result.inputLines).to.equal([
            {
              endDate: '2023-04-30T00:00:00.000Z',
              label: 'April 2023',
              reading: '100',
              error: 'There is an error on this line'
            }
          ])
        })
      })
    })
  })

  describe('the "pageTitle" property', () => {
    describe('when the user is entering readings for June 2023', () => {
      beforeEach(() => {
        yearMonth = '2023-5'
      })

      it('returns the page title for June', () => {
        const result = ReadingsPresenter.go(session, yearMonth)

        expect(result.pageTitle).to.equal('Water abstracted June 2023')
      })
    })
  })
})

function _sessionData() {
  return {
    id: 'e840675e-9fb9-4ce1-bf0a-d140f5c57f47',
    lines: [
      {
        endDate: '2023-04-30T00:00:00.000Z',
        reading: 100,
        startDate: '2023-04-01T00:00:00.000Z'
      },
      {
        endDate: '2023-05-31T00:00:00.000Z',
        startDate: '2023-05-01T00:00:00.000Z'
      },
      {
        endDate: '2023-06-30T00:00:00.000Z',
        startDate: '2023-06-01T00:00:00.000Z'
      }
    ],
    returnsFrequency: 'month',
    returnReference: '1234'
  }
}
