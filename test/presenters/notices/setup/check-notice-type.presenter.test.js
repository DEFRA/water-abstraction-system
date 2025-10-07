'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateLicenceRef } = require('../../../support/helpers/licence.helper.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Thing under test
const CheckNoticeTypePresenter = require('../../../../app/presenters/notices/setup/check-notice-type.presenter.js')

describe('Notices - Setup - Check Notice Type Presenter', () => {
  let licenceRef
  let noticeType
  let session

  beforeEach(() => {
    licenceRef = generateLicenceRef()
    noticeType = 'invitations'

    session = { id: '123', licenceRef, noticeType }
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = CheckNoticeTypePresenter.go(session)

      expect(result).to.equal({
        licenceRef,
        noticeType: 'invitations',
        pageTitle: 'Check the notice type',
        returnNoticeType: 'Standard returns invitation',
        selectedDueReturns: [],
        sessionId: '123'
      })
    })

    describe('and the notice type is "invitations"', () => {
      beforeEach(() => {
        session.noticeType = 'invitations'
      })

      it('returns page data', () => {
        const result = CheckNoticeTypePresenter.go(session)

        expect(result).to.equal({
          licenceRef,
          noticeType: 'invitations',
          pageTitle: 'Check the notice type',
          returnNoticeType: 'Standard returns invitation',
          selectedDueReturns: [],
          sessionId: '123'
        })
      })
    })

    describe('and the notice type is "paperReturn"', () => {
      let dueReturnOne
      let dueReturnTwo

      beforeEach(() => {
        dueReturnOne = {
          description: 'Potable Water Supply - Direct',
          endDate: '2003-03-31',
          returnId: generateUUID(),
          returnReference: '3135',
          startDate: '2002-04-01'
        }

        dueReturnTwo = {
          description: 'Potable Water Supply - Direct',
          endDate: '2004-03-31',
          returnId: generateUUID(),
          returnReference: '3135',
          startDate: '2003-04-01'
        }

        session.noticeType = 'paperReturn'

        session.dueReturns = [dueReturnOne, dueReturnTwo]

        session.selectedReturns = [dueReturnOne.returnId]
      })

      it('returns the page data', () => {
        const result = CheckNoticeTypePresenter.go(session)

        expect(result).to.equal({
          licenceRef,
          noticeType: 'paperReturn',
          pageTitle: 'Check the notice type',
          returnNoticeType: 'Submit using a paper form invitation',
          selectedDueReturns: ['3135 - 1 April 2002 to 31 March 2003'],
          sessionId: '123'
        })
      })

      describe('and there are more than one "selectedReturns"', () => {
        beforeEach(() => {
          session.selectedReturns = [dueReturnOne.returnId, dueReturnTwo.returnId]
        })

        it('returns an array of "selectedDueReturns"', () => {
          const result = CheckNoticeTypePresenter.go(session)

          expect(result.selectedDueReturns).to.equal([
            '3135 - 1 April 2002 to 31 March 2003',
            '3135 - 1 April 2003 to 31 March 2004'
          ])
        })
      })
    })
  })
})
