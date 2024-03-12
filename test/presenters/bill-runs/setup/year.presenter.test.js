'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const YearPresenter = require('../../../../app/presenters/bill-runs/setup/year.presenter.js')

describe('Bill Runs Setup Year presenter', () => {
  let session

  describe('when provided with a bill run setup session record', () => {
    beforeEach(() => {
      session = {
        id: '98ad3a1f-8e4f-490a-be05-0aece6755466',
        data: {}
      }
    })

    describe('where the user has not previously selected a financial year', () => {
      it('correctly presents the data', () => {
        const result = YearPresenter.go(session)

        expect(result).to.equal({
          sessionId: '98ad3a1f-8e4f-490a-be05-0aece6755466',
          selectedYear: null
        })
      })
    })

    describe('where the user has previously selected a financial year', () => {
      beforeEach(() => {
        session.data.year = 2022
      })

      it('correctly presents the data', () => {
        const result = YearPresenter.go(session)

        expect(result).to.equal({
          sessionId: '98ad3a1f-8e4f-490a-be05-0aece6755466',
          selectedYear: 2022
        })
      })
    })
  })
})
