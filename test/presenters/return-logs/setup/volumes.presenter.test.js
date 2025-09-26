'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const VolumesPresenter = require('../../../../app/presenters/return-logs/setup/volumes.presenter.js')

describe('Return Logs Setup - Volumes presenter', () => {
  let session
  let yearMonth

  beforeEach(() => {
    session = _sessionData()
    yearMonth = '2023-4'
  })

  describe('when provided with a populated session', () => {
    it('correctly presents the data', () => {
      const result = VolumesPresenter.go(session, yearMonth)

      expect(result).to.equal({
        backLink: '/system/return-logs/setup/e840675e-9fb9-4ce1-bf0a-d140f5c57f47/check',
        inputLines: [
          {
            endDate: '2023-05-31T00:00:00.000Z',
            label: 'May 2023',
            quantity: undefined
          }
        ],
        pageTitle: 'Water abstracted May 2023',
        caption: 'Return reference 1234',
        units: 'Cubic metres'
      })
    })
  })

  describe('the "inputLines" property', () => {
    describe('when the user is entering volumes for April', () => {
      beforeEach(() => {
        yearMonth = '2023-3'
      })

      it('returns the line data for April 2023', () => {
        const result = VolumesPresenter.go(session, yearMonth)

        expect(result.inputLines).to.equal([
          {
            endDate: '2023-04-30T00:00:00.000Z',
            label: 'April 2023',
            quantity: 100
          }
        ])
      })

      describe('and the return frequency is daily', () => {
        beforeEach(() => {
          session.returnsFrequency = 'day'
        })

        it('correctly formats the line label', () => {
          const result = VolumesPresenter.go(session, yearMonth)

          expect(result.inputLines[0].label).to.equal('30 April 2023')
        })
      })

      describe('and the return frequency is weekly', () => {
        beforeEach(() => {
          session.returnsFrequency = 'week'
        })

        it('correctly formats the line label', () => {
          const result = VolumesPresenter.go(session, yearMonth)

          expect(result.inputLines[0].label).to.equal('Week ending 30 April 2023')
        })
      })

      describe('and the return frequency is monthly', () => {
        beforeEach(() => {
          session.returnsFrequency = 'month'
        })

        it('correctly formats the line label', () => {
          const result = VolumesPresenter.go(session, yearMonth)

          expect(result.inputLines[0].label).to.equal('April 2023')
        })
      })

      describe('and a validation error exists on the line', () => {
        beforeEach(() => {
          session.lines[0].error = 'There is an error on this line'
        })

        it('includes the error message in the line data', () => {
          const result = VolumesPresenter.go(session, yearMonth)

          expect(result.inputLines).to.equal([
            {
              endDate: '2023-04-30T00:00:00.000Z',
              label: 'April 2023',
              quantity: 100,
              error: 'There is an error on this line'
            }
          ])
        })
      })
    })
  })

  describe('the "pageTitle" property', () => {
    describe('when the user is entering volumes for June 2023', () => {
      beforeEach(() => {
        yearMonth = '2023-5'
      })

      it('returns the page title for June', () => {
        const result = VolumesPresenter.go(session, yearMonth)

        expect(result.pageTitle).to.equal('Water abstracted June 2023')
      })
    })
  })

  describe('the "units" property', () => {
    describe('when the user has used cubic metres', () => {
      beforeEach(() => {
        session.units = 'cubicMetres'
      })

      it('returns the unit of measurement as "Cubic metres"', () => {
        const result = VolumesPresenter.go(session, yearMonth)

        expect(result.units).to.equal('Cubic metres')
      })
    })

    describe('when the user has used litres', () => {
      beforeEach(() => {
        session.units = 'litres'
      })

      it('returns the unit of measurement as "Litres"', () => {
        const result = VolumesPresenter.go(session, yearMonth)

        expect(result.units).to.equal('Litres')
      })
    })

    describe('when the user has used megalitres', () => {
      beforeEach(() => {
        session.units = 'megalitres'
      })

      it('returns the unit of measurement as "Megalitres"', () => {
        const result = VolumesPresenter.go(session, yearMonth)

        expect(result.units).to.equal('Megalitres')
      })
    })

    describe('when the user has used gallons', () => {
      beforeEach(() => {
        session.units = 'gallons'
      })

      it('returns the unit of measurement as "Gallons"', () => {
        const result = VolumesPresenter.go(session, yearMonth)

        expect(result.units).to.equal('Gallons')
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
        quantity: 100,
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
    returnReference: '1234',
    units: 'cubicMetres'
  }
}
