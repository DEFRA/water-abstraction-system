'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const BillingPresenter = require('../../app/presenters/billing.presenter.js')

describe('Billing presenter', () => {
  describe('#formatBillRunType()', () => {
    let batchType
    let scheme
    let summer

    describe('when the batch type is "annual"', () => {
      beforeEach(() => {
        batchType = 'annual'
      })

      it('returns "Annual"', () => {
        const result = BillingPresenter.formatBillRunType(batchType, scheme, summer)

        expect(result).to.equal('Annual')
      })
    })

    describe('when the batch type is "supplementary"', () => {
      beforeEach(() => {
        batchType = 'supplementary'
      })

      it('returns "Supplementary"', () => {
        const result = BillingPresenter.formatBillRunType(batchType, scheme, summer)

        expect(result).to.equal('Supplementary')
      })
    })

    describe('when the batch type is "two_part_supplementary"', () => {
      beforeEach(() => {
        batchType = 'two_part_supplementary'
      })

      it('returns "Two-part tariff supplementary"', () => {
        const result = BillingPresenter.formatBillRunType(batchType, scheme, summer)

        expect(result).to.equal('Two-part tariff supplementary')
      })
    })

    describe('when the batch type is "two_part_tariff"', () => {
      beforeEach(() => {
        batchType = 'two_part_tariff'
      })

      describe('and the scheme is "sroc"', () => {
        beforeEach(() => {
          scheme = 'sroc'
        })

        it('returns "Two-part tariff"', () => {
          const result = BillingPresenter.formatBillRunType(batchType, scheme, summer)

          expect(result).to.equal('Two-part tariff')
        })
      })

      describe('and the scheme is "alcs"', () => {
        beforeEach(() => {
          scheme = 'alcs'
        })

        describe('and it is not summer only', () => {
          beforeEach(() => {
            summer = false
          })

          it('returns "Two-part tariff winter and all year"', () => {
            const result = BillingPresenter.formatBillRunType(batchType, scheme, summer)

            expect(result).to.equal('Two-part tariff winter and all year')
          })
        })

        describe('and it is for summer only', () => {
          beforeEach(() => {
            summer = true
          })

          it('returns "Two-part tariff summer"', () => {
            const result = BillingPresenter.formatBillRunType(batchType, scheme, summer)

            expect(result).to.equal('Two-part tariff summer')
          })
        })
      })
    })
  })

  describe('#formatChargeScheme()', () => {
    let scheme

    describe('when the scheme is "sroc"', () => {
      beforeEach(() => {
        scheme = 'sroc'
      })

      it('returns "Current"', () => {
        const result = BillingPresenter.formatChargeScheme(scheme)

        expect(result).to.equal('Current')
      })
    })

    describe('when the scheme is "alcs"', () => {
      beforeEach(() => {
        scheme = 'alcs'
      })

      it('returns "Old"', () => {
        const result = BillingPresenter.formatChargeScheme(scheme)

        expect(result).to.equal('Old')
      })
    })
  })

  describe('#generateBillRunTitle()', () => {
    const regionName = 'anglian'
    const batchType = 'two_part_tariff'
    const scheme = 'sroc'
    const summer = false

    it('generates the page title for the bill run, for example, "Anglian two-part tariff"', () => {
      const result = BillingPresenter.generateBillRunTitle(regionName, batchType, scheme, summer)

      expect(result).to.equal('Anglian two-part tariff')
    })
  })
})
