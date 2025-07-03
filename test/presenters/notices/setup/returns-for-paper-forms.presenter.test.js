'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Thing under test
const ReturnsForPaperFormsPresenter = require('../../../../app/presenters/notices/setup/returns-for-paper-forms.presenter.js')

describe('Notices - Setup - Returns For Paper Forms presenter', () => {
  let dueReturn
  let session

  beforeEach(() => {
    dueReturn = {
      description: 'Potable Water Supply - Direct',
      endDate: '2003-03-31',
      returnId: generateUUID(),
      returnReference: '3135',
      startDate: '2002-04-01'
    }

    session = {
      id: '123',
      dueReturns: [dueReturn]
    }
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = ReturnsForPaperFormsPresenter.go(session)

      expect(result).to.equal({
        backLink: '/system/notices/setup/123/notice-type',
        pageTitle: 'Select the returns for the paper forms',
        returns: [
          {
            checked: false,
            hint: { text: '1 April 2002 to 31 March 2003' },
            text: `${dueReturn.returnReference} Potable Water Supply - Direct`,
            value: dueReturn.returnId
          }
        ]
      })
    })

    describe('and returns have previously been selected', () => {
      beforeEach(() => {
        session.selectedReturns = [dueReturn.returnId]
      })

      it('returns the "returns" previously selected as checked', () => {
        const result = ReturnsForPaperFormsPresenter.go(session)

        expect(result.returns).to.equal([
          {
            checked: true,
            hint: { text: '1 April 2002 to 31 March 2003' },
            text: `${dueReturn.returnReference} Potable Water Supply - Direct`,
            value: dueReturn.returnId
          }
        ])
      })

      describe('and the page has been visited', () => {
        beforeEach(() => {
          session.checkPageVisited = true
        })

        it('correctly set the back link to the check page', () => {
          const result = ReturnsForPaperFormsPresenter.go(session)

          expect(result.backLink).to.equal('/system/notices/setup/123/check-notice-type')
        })
      })
    })
  })
})
