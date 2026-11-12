// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Thing under test
import YearPresenter from '../../../../src/presenters/bill-runs/setup/year.presenter.js'

describe('Bill Runs - Setup - Year presenter', () => {
  let licenceSupplementaryYears
  let session

  describe('when provided with a bill run setup session record for two-part tariff supplementary', () => {
    beforeEach(() => {
      licenceSupplementaryYears = [{ financialYearEnd: 2024 }, { financialYearEnd: 2022 }]
      session = {
        data: {},
        id: '98ad3a1f-8e4f-490a-be05-0aece6755466',
        type: 'two_part_supplementary'
      }
    })

    describe('where the user has not previously selected a financial year', () => {
      it('correctly presents the data', () => {
        const result = YearPresenter(licenceSupplementaryYears, session)

        expect(result).toEqual({
          backlink: `/system/bill-runs/setup/98ad3a1f-8e4f-490a-be05-0aece6755466/region`,
          financialYearsData: [
            {
              checked: false,
              text: '2023 to 2024',
              value: 2024
            },
            {
              checked: false,
              text: '2021 to 2022',
              value: 2022
            }
          ],
          pageTitle: 'Select the financial year',
          selectedYear: null,
          sessionId: '98ad3a1f-8e4f-490a-be05-0aece6755466'
        })
      })
    })

    describe('where the user has previously selected a financial year', () => {
      beforeEach(() => {
        session.year = '2022'
      })

      it('correctly presents the data', () => {
        const result = YearPresenter(licenceSupplementaryYears, session)

        expect(result).toEqual({
          backlink: `/system/bill-runs/setup/98ad3a1f-8e4f-490a-be05-0aece6755466/region`,
          financialYearsData: [
            {
              checked: false,
              text: '2023 to 2024',
              value: 2024
            },
            {
              checked: true,
              text: '2021 to 2022',
              value: 2022
            }
          ],
          pageTitle: 'Select the financial year',
          selectedYear: '2022',
          sessionId: '98ad3a1f-8e4f-490a-be05-0aece6755466'
        })
      })
    })
  })

  describe('when provided with a bill run setup session record for two-part tariff annual', () => {
    beforeEach(() => {
      session = {
        data: {},
        id: '98ad3a1f-8e4f-490a-be05-0aece6755466',
        type: 'two_part_tariff'
      }
    })

    describe('where the user has not previously selected a financial year', () => {
      it('correctly presents the data', () => {
        const result = YearPresenter(licenceSupplementaryYears, session)

        expect(result).toEqual({
          backlink: `/system/bill-runs/setup/98ad3a1f-8e4f-490a-be05-0aece6755466/region`,
          financialYearsData: _financialYearsData(null),
          pageTitle: 'Select the financial year',
          selectedYear: null,
          sessionId: '98ad3a1f-8e4f-490a-be05-0aece6755466'
        })
      })
    })

    describe('where the user has previously selected a financial year', () => {
      beforeEach(() => {
        session.year = '2022'
      })

      it('correctly presents the data', () => {
        const result = YearPresenter(licenceSupplementaryYears, session)

        expect(result).toEqual({
          backlink: `/system/bill-runs/setup/98ad3a1f-8e4f-490a-be05-0aece6755466/region`,
          financialYearsData: _financialYearsData('2022'),
          pageTitle: 'Select the financial year',
          selectedYear: '2022',
          sessionId: '98ad3a1f-8e4f-490a-be05-0aece6755466'
        })
      })
    })
  })
})

function _financialYearsData(selectedYear) {
  return [
    {
      checked: selectedYear === '2026',
      text: '2025 to 2026',
      value: 2026
    },
    {
      checked: selectedYear === '2025',
      text: '2024 to 2025',
      value: 2025
    },
    {
      checked: selectedYear === '2022',
      text: '2021 to 2022',
      value: 2022
    },
    {
      checked: selectedYear === '2021',
      text: '2020 to 2021',
      value: 2021
    }
  ]
}
