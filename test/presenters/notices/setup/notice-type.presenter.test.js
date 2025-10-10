'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const NoticeTypePresenter = require('../../../../app/presenters/notices/setup/notice-type.presenter.js')

describe('Notice Type Presenter', () => {
  let auth
  let session

  beforeEach(() => {
    auth = {
      credentials: { scope: ['bulk_return_notifications'] }
    }

    session = { id: '123' }
  })

  describe('when called', () => {
    describe('the "options" property', () => {
      describe('when a previous "noticeType" has been selected', () => {
        describe('and the selected notice type was "invitations"', () => {
          beforeEach(() => {
            session.noticeType = 'invitations'
          })

          it('returns the invitations checked', () => {
            const result = NoticeTypePresenter.go(session, auth)

            expect(result.options).to.equal([
              {
                checked: true,
                text: 'Returns invitation',
                value: 'invitations'
              },
              {
                checked: false,
                text: 'Returns reminder',
                value: 'reminders'
              },
              {
                checked: false,
                text: 'Paper return',
                value: 'paperReturn'
              }
            ])
          })
        })

        describe('and the selected notice type was "reminders"', () => {
          beforeEach(() => {
            session.noticeType = 'reminders'
          })

          it('returns the invitations checked', () => {
            const result = NoticeTypePresenter.go(session, auth)

            expect(result.options).to.equal([
              {
                checked: false,
                text: 'Returns invitation',
                value: 'invitations'
              },
              {
                checked: true,
                text: 'Returns reminder',
                value: 'reminders'
              },
              {
                checked: false,
                text: 'Paper return',
                value: 'paperReturn'
              }
            ])
          })
        })

        describe('and the selected notice type was "paperReturn"', () => {
          beforeEach(() => {
            session.noticeType = 'paperReturn'
          })

          it('returns the Return forms checked', () => {
            const result = NoticeTypePresenter.go(session, auth)

            expect(result.options).to.equal([
              {
                checked: false,
                text: 'Returns invitation',
                value: 'invitations'
              },
              {
                checked: false,
                text: 'Returns reminder',
                value: 'reminders'
              },
              {
                checked: true,
                text: 'Paper return',
                value: 'paperReturn'
              }
            ])
          })
        })

        describe('and the page has been visited', () => {
          beforeEach(() => {
            session.checkPageVisited = true
          })

          it('correctly set the back link to the check page', () => {
            const result = NoticeTypePresenter.go(session, auth)

            expect(result.backLink).to.equal({
              href: '/system/notices/setup/123/check-notice-type',
              text: 'Back'
            })
          })
        })
      })
    })

    describe('when journey is for the "standard" journey', () => {
      beforeEach(() => {
        session.journey = 'standard'
      })

      it('returns page data for the view', () => {
        const result = NoticeTypePresenter.go(session, auth)

        expect(result).to.equal({
          backLink: {
            href: '/system/notices',
            text: 'Back'
          },
          options: [
            {
              checked: false,
              text: 'Returns invitation',
              value: 'invitations'
            },
            {
              checked: false,
              text: 'Returns reminder',
              value: 'reminders'
            }
          ],
          pageTitle: 'Select the notice type'
        })
      })

      describe('and the user has the "bulk_return_notifications" scope', () => {
        beforeEach(() => {
          beforeEach(() => {
            auth.credentials.scope = ['bulk_return_notifications']
          })
        })

        it('returns page data for the view', () => {
          const result = NoticeTypePresenter.go(session, auth)

          expect(result).to.equal({
            backLink: {
              href: '/system/notices',
              text: 'Back'
            },
            options: [
              {
                checked: false,
                text: 'Returns invitation',
                value: 'invitations'
              },
              {
                checked: false,
                text: 'Returns reminder',
                value: 'reminders'
              }
            ],
            pageTitle: 'Select the notice type'
          })
        })
      })
    })

    describe('when journey is not the "standard" journey', () => {
      it('returns page data for the view', () => {
        const result = NoticeTypePresenter.go(session, auth)

        expect(result).to.equal({
          backLink: {
            href: '/system/notices/setup/123/licence',
            text: 'Back'
          },
          options: [
            {
              checked: false,
              text: 'Returns invitation',
              value: 'invitations'
            },
            {
              checked: false,
              text: 'Returns reminder',
              value: 'reminders'
            },
            {
              checked: false,
              text: 'Paper return',
              value: 'paperReturn'
            }
          ],
          pageTitle: 'Select the notice type'
        })
      })

      describe('and the user has the "bulk_return_notifications" scope', () => {
        beforeEach(() => {
          beforeEach(() => {
            auth.credentials.scope = ['bulk_return_notifications']
          })
        })

        it('returns page data for the view', () => {
          const result = NoticeTypePresenter.go(session, auth)

          expect(result).to.equal({
            backLink: {
              href: '/system/notices/setup/123/licence',
              text: 'Back'
            },
            options: [
              {
                checked: false,
                text: 'Returns invitation',
                value: 'invitations'
              },
              {
                checked: false,
                text: 'Returns reminder',
                value: 'reminders'
              },
              {
                checked: false,
                text: 'Paper return',
                value: 'paperReturn'
              }
            ],
            pageTitle: 'Select the notice type'
          })
        })
      })

      describe('and the user does not have the "bulk_return_notifications" scope', () => {
        beforeEach(() => {
          auth.credentials.scope = ['returns']
        })

        it('returns the appropriate notice option', () => {
          const result = NoticeTypePresenter.go(session, auth)

          expect(result.options).to.equal([
            {
              checked: false,
              text: 'Paper return',
              value: 'paperReturn'
            }
          ])
        })
      })
    })
  })
})
