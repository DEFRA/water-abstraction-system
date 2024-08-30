'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const LicenceSupplementaryYearHelper = require('../../../support/helpers/licence-supplementary-year.helper.js')

// Thing under test
const YearPresenter = require('../../../../app/presenters/bill-runs/setup/year.presenter.js')

describe('Bill Runs Setup Year presenter', () => {
  let session

  describe('when provided with a bill run setup session record for two-part tariff annual', () => {
    beforeEach(() => {
      session = {
        id: '98ad3a1f-8e4f-490a-be05-0aece6755466',
        data: {},
        type: 'two_part_tariff'
      }
    })

    describe('where the user has not previously selected a financial year', () => {
      it('correctly presents the data', async () => {
        const result = await YearPresenter.go(session)

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

      it('correctly presents the data', async () => {
        const result = await YearPresenter.go(session)

        expect(result).to.equal({
          financialYearsData: _financialYearsData('2022'),
          sessionId: '98ad3a1f-8e4f-490a-be05-0aece6755466',
          selectedYear: '2022'
        })
      })
    })
  })

  describe('when provided with a bill run setup session record for two-part tariff supplementary', () => {
    beforeEach(async () => {
      const { id: licenceId, regionId } = await LicenceHelper.add()

      await LicenceSupplementaryYearHelper.add({ licenceId, financialYearEnd: 2022, twoPartTariff: true })

      session = {
        id: '98ad3a1f-8e4f-490a-be05-0aece6755466',
        data: {},
        region: regionId,
        type: 'two_part_supplementary'
      }
    })

    describe('where the user has not previously selected a financial year', () => {
      it('correctly presents the data', async () => {
        const result = await YearPresenter.go(session)

        expect(result).to.equal({
          financialYearsData: [{
            text: '2021 to 2022',
            value: '2022',
            checked: false
          }],
          sessionId: '98ad3a1f-8e4f-490a-be05-0aece6755466',
          selectedYear: null
        })
      })
    })

    describe('where the user has previously selected a financial year', () => {
      beforeEach(() => {
        session.year = '2022'
      })

      it('correctly presents the data', async () => {
        const result = await YearPresenter.go(session)

        expect(result).to.equal({
          financialYearsData: [{
            text: '2021 to 2022',
            value: '2022',
            checked: true
          }],
          sessionId: '98ad3a1f-8e4f-490a-be05-0aece6755466',
          selectedYear: '2022'
        })
      })
    })
  })
})

function _financialYearsData (selectedYear) {
  return [
    {
      text: '2023 to 2024',
      value: '2024',
      checked: selectedYear === '2024'
    },
    {
      text: '2022 to 2023',
      value: '2023',
      checked: selectedYear === '2023'
    },
    {
      text: '2021 to 2022',
      value: '2022',
      checked: selectedYear === '2022'
    },
    {
      text: '2020 to 2021',
      value: '2021',
      checked: selectedYear === '2021'
    }
  ]
}
