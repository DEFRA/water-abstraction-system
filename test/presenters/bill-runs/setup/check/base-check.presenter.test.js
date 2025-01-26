'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const BaseCheckPresenter = require('../../../../../app/presenters/bill-runs/setup/check/base-check.presenter.js')

describe('Bill Runs - Setup - Base Check presenter', () => {
  const sessionId = '98ad3a1f-8e4f-490a-be05-0aece6755466'

  describe('#checkPageBackLink()', () => {
    let session

    describe('when the selected bill run type is not "two_part_tariff" or "two_part_supplementary"', () => {
      beforeEach(() => {
        session = { id: sessionId, type: 'supplementary' }
      })

      it('returns a link to the region page', async () => {
        const result = await BaseCheckPresenter.checkPageBackLink(session)

        expect(result).to.equal('/system/bill-runs/setup/98ad3a1f-8e4f-490a-be05-0aece6755466/region')
      })
    })

    describe('when the selected bill run type is "two_part_tariff"', () => {
      beforeEach(() => {
        session = { id: sessionId, type: 'two_part_tariff' }
      })

      describe('and the selected financial year is in the SROC period', () => {
        beforeEach(() => {
          session.year = '2023'
        })

        it('returns a link to the financial year page', async () => {
          const result = await BaseCheckPresenter.checkPageBackLink(session)

          expect(result).to.equal('/system/bill-runs/setup/98ad3a1f-8e4f-490a-be05-0aece6755466/year')
        })
      })

      describe('and the selected financial year is in the PRESROC period', () => {
        beforeEach(() => {
          session.year = '2022'
        })

        it('returns a link to the season page', async () => {
          const result = await BaseCheckPresenter.checkPageBackLink(session)

          expect(result).to.equal('/system/bill-runs/setup/98ad3a1f-8e4f-490a-be05-0aece6755466/season')
        })
      })
    })

    describe('when the selected bill run type is "two_part_supplementary"', () => {
      beforeEach(() => {
        session = { id: sessionId, type: 'two_part_supplementary' }
      })

      it('returns a link to the financial year page', async () => {
        const result = await BaseCheckPresenter.checkPageBackLink(session)

        expect(result).to.equal('/system/bill-runs/setup/98ad3a1f-8e4f-490a-be05-0aece6755466/year')
      })
    })
  })
})
