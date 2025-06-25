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
            value: 'paper-forms'
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
              value: 'paper-forms'
            }
          ])
        })
      })

      describe('and the selected notice type was "paper-forms"', () => {
        beforeEach(() => {
          session.noticeType = 'paper-forms'
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
              value: 'paper-forms'
            }
          ])
        })
      })
    })
  })
})
