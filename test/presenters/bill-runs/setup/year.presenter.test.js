'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const YearPresenter = require('../../../../app/presenters/bill-runs/setup/year.presenter.js')

describe('Bill Runs - Setup - Year presenter', () => {
  let licenceSupplementaryYears
  let session

  describe('when provided with a bill run setup session record for two-part tariff supplementary', () => {
    beforeEach(() => {
      licenceSupplementaryYears = [{ financialYearEnd: 2024 }, { financialYearEnd: 2022 }]
      session = {
        id: '98ad3a1f-8e4f-490a-be05-0aece6755466',
        data: {},
        type: 'two_part_supplementary'
      }
    })

    describe('where the user has not previously selected a financial year', () => {
      it('correctly presents the data', () => {
        const result = YearPresenter.go(licenceSupplementaryYears, session)

        expect(result).to.equal({
          financialYearsData: [
            {
              text: '2023 to 2024',
              value: 2024,
              checked: false
            },
            {
              text: '2021 to 2022',
              value: 2022,
              checked: false
            }
          ],
          sessionId: '98ad3a1f-8e4f-490a-be05-0aece6755466',
          selectedYear: null
        })
      })
    })

    describe('where the user has previously selected a financial year', () => {
      beforeEach(() => {
        session.year = '2022'
      })

      it('correctly presents the data', () => {
        const result = YearPresenter.go(licenceSupplementaryYears, session)

        expect(result).to.equal({
          financialYearsData: [
            {
              text: '2023 to 2024',
              value: 2024,
              checked: false
            },
            {
              text: '2021 to 2022',
              value: 2022,
              checked: true
            }
          ],
          sessionId: '98ad3a1f-8e4f-490a-be05-0aece6755466',
          selectedYear: '2022'
        })
      })
    })
  })

  describe('when provided with a bill run setup session record for two-part tariff annual', () => {
    beforeEach(() => {
      session = {
        id: '98ad3a1f-8e4f-490a-be05-0aece6755466',
        data: {},
        type: 'two_part_tariff'
      }
    })

    describe('where the user has not previously selected a financial year', () => {
      it('correctly presents the data', () => {
        const result = YearPresenter.go(licenceSupplementaryYears, session)

        expect(result).to.equal({
          financialYearsData: _financialYearsData(null),
          sessionId: '98ad3a1f-8e4f-490a-be05-0aece6755466',
          selectedYear: null
        })
      })
    })

    describe('where the user has previously selected a financial year', () => {
      beforeEach(() => {
        session.year = '2022'
      })

      it('correctly presents the data', () => {
        const result = YearPresenter.go(licenceSupplementaryYears, session)

        expect(result).to.equal({
          financialYearsData: _financialYearsData('2022'),
          sessionId: '98ad3a1f-8e4f-490a-be05-0aece6755466',
          selectedYear: '2022'
        })
      })
    })
  })
})

function _financialYearsData(selectedYear) {
  return [
    {
      text: '2023 to 2024',
      value: 2024,
      checked: selectedYear === '2024'
    },
    {
      text: '2022 to 2023',
      value: 2023,
      checked: selectedYear === '2023'
    },
    {
      text: '2021 to 2022',
      value: 2022,
      checked: selectedYear === '2022'
    },
    {
      text: '2020 to 2021',
      value: 2021,
      checked: selectedYear === '2021'
    }
  ]
}
