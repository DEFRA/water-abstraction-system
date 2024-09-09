'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const MarkForSupplementaryBillingPresenter = require('../../../../app/presenters/licences/supplementary/mark-for-supplementary-billing.presenter.js')

describe('Mark For Supplementary Billing presenter', () => {
  let testDate
  let clock

  afterEach(() => {
    Sinon.restore()
  })

  describe('when provided with a licence record', () => {
    let licence

    beforeEach(() => {
      licence = { id: 'test-id', licenceRef: '01/Test' }
    })

    it('correctly presents the data', () => {
      const result = MarkForSupplementaryBillingPresenter.go(licence)

      expect(result.licenceId).to.equal('test-id')
      expect(result.licenceRef).to.equal('01/Test')
    })

    describe('and the current date is before April', () => {
      beforeEach(() => {
        testDate = new Date('2024-03-31')
        clock = Sinon.useFakeTimers(testDate)
      })

      afterEach(() => {
        clock.restore()
      })

      it('correctly presents the data', () => {
        const result = MarkForSupplementaryBillingPresenter.go(licence)

        expect(result).to.equal({
          licenceId: 'test-id',
          licenceRef: '01/Test',
          financialYears: [
            { text: '2023 to 2024', value: 2024 },
            { text: '2022 to 2023', value: 2023 },
            { text: 'Before 2022', value: 'preSroc', hint: { text: 'Old charge scheme' } }
          ]
        })
      })
    })

    describe('and the current date is after April', () => {
      beforeEach(() => {
        testDate = new Date('2024-04-01')
        clock = Sinon.useFakeTimers(testDate)
      })

      afterEach(() => {
        clock.restore()
      })

      it('correctly presents the data', () => {
        const result = MarkForSupplementaryBillingPresenter.go(licence)

        expect(result).to.equal({
          licenceId: 'test-id',
          licenceRef: '01/Test',
          financialYears: [
            { text: '2024 to 2025', value: 2025 },
            { text: '2023 to 2024', value: 2024 },
            { text: '2022 to 2023', value: 2023 },
            { text: 'Before 2022', value: 'preSroc', hint: { text: 'Old charge scheme' } }
          ]
        })
      })
    })
  })
})
