'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const NoticeTypePresenter = require('../../../../app/presenters/notices/setup/notice-type.presenter.js')

describe('Notice Type Presenter', () => {
  let session

  beforeEach(() => {
    session = { id: '123' }
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = NoticeTypePresenter.go(session)

      expect(result).to.equal({
        backLink: '/system/notices/setup/123/licence',
        options: [
          {
            checked: false,
            text: 'Standard returns invitation',
            value: 'invitations'
          },
          {
            checked: false,
            text: 'Submit using a paper form invitation',
            value: 'returnForms'
          }
        ],
        pageTitle: 'Select the notice type'
      })
    })

    describe('when a previous "noticeType" has been selected', () => {
      describe('and the selected notice type was "invitations"', () => {
        beforeEach(() => {
          session.noticeType = 'invitations'
        })

        it('returns the invitations checked', () => {
          const result = NoticeTypePresenter.go(session)

          expect(result.options).to.equal([
            {
              checked: true,
              text: 'Standard returns invitation',
              value: 'invitations'
            },
            {
              checked: false,
              text: 'Submit using a paper form invitation',
              value: 'returnForms'
            }
          ])
        })
      })

      describe('and the selected notice type was "returnForms"', () => {
        beforeEach(() => {
          session.noticeType = 'returnForms'
        })

        it('returns the paper invitation checked', () => {
          const result = NoticeTypePresenter.go(session)

          expect(result.options).to.equal([
            {
              checked: false,
              text: 'Standard returns invitation',
              value: 'invitations'
            },
            {
              checked: true,
              text: 'Submit using a paper form invitation',
              value: 'returnForms'
            }
          ])
        })
      })

      describe('and the page has been visited', () => {
        beforeEach(() => {
          session.checkPageVisited = true
        })

        it('correctly set the back link to the check page', () => {
          const result = NoticeTypePresenter.go(session)

          expect(result.backLink).to.equal('/system/notices/setup/123/check-notice-type')
        })
      })
    })
  })
})
