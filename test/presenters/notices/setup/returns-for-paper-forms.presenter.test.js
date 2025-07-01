'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const ReturnsForPaperFormsPresenter = require('../../../../app/presenters/notices/setup/returns-for-paper-forms.presenter.js')

describe('Returns For Paper Forms Presenter', () => {
  let session

  beforeEach(() => {
    session = {}
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = ReturnsForPaperFormsPresenter.go(session)

      expect(result).to.equal({
        pageTitle: 'Select the returns for the paper forms',
        returns: [
          {
            checked: false,
            hint: {
              text: '1 January 2025 to 1 January 2026'
            },
            text: '1 Potable Water Supply - Direct',
            value: '1'
          },
          {
            checked: false,
            hint: {
              text: '1 January 2025 to 1 January 2026'
            },
            text: '2 Potable Water Supply - Direct',
            value: '2'
          }
        ]
      })
    })

    describe('and returns have previously been selected', () => {
      beforeEach(() => {
        session.selectedReturns = ['1']
      })

      it('returns the "returns" previously selected as checked', () => {
        const result = ReturnsForPaperFormsPresenter.go(session)

        expect(result.returns).to.equal([
          {
            hint: {
              text: '1 January 2025 to 1 January 2026'
            },
            text: '1 Potable Water Supply - Direct',
            value: '1',
            checked: true
          },
          {
            checked: false,
            hint: {
              text: '1 January 2025 to 1 January 2026'
            },
            text: '2 Potable Water Supply - Direct',
            value: '2'
          }
        ])
      })
    })
  })
})
