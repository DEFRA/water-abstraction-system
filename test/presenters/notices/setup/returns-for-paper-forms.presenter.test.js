'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const ReturnsForPaperFormsPresenter = require('../../../../app/presenters/notices/setup/returns-for-paper-forms.presenter.js')

describe('Notices - Setup - Returns For Paper Forms Presenter', () => {
  let session
  let returns

  beforeEach(() => {
    session = {}

    returns = [
      {
        startDate: new Date('2002-04-01'),
        endDate: new Date('2003-03-31'),
        returnReference: '3135',
        description: 'Potable Water Supply - Direct'
      }
    ]
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = ReturnsForPaperFormsPresenter.go(session, returns)

      expect(result).to.equal({
        pageTitle: 'Select the returns for the paper forms',
        returns: [
          {
            checked: false,
            hint: { text: '1 April 2002 to 31 March 2003' },
            text: '3135 Potable Water Supply - Direct',
            value: '3135'
          }
        ]
      })
    })

    describe('and returns have previously been selected', () => {
      beforeEach(() => {
        session.selectedReturns = ['3135']
      })

      it('returns the "returns" previously selected as checked', () => {
        const result = ReturnsForPaperFormsPresenter.go(session, returns)

        expect(result.returns).to.equal([
          {
            checked: true,
            hint: { text: '1 April 2002 to 31 March 2003' },
            text: '3135 Potable Water Supply - Direct',
            value: '3135'
          }
        ])
      })
    })
  })
})
