'use strict'

// Test helpers
const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Thing under test
const NoticeTypePresenter = require('../../../../app/presenters/notices/setup/notice-type.presenter.js')

describe('Notice - Setup - Notice Type Presenter', () => {
  let auth
  let session

  beforeEach(() => {
    auth = {
      credentials: { scope: ['bulk_return_notifications', 'renewal_notifications'] }
    }

    session = { id: generateUUID(), journey: 'adhoc' }
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = NoticeTypePresenter(session, auth)

      expect(result).toEqual({
        backLink: {
          href: '/system/notices',
          text: 'Back'
        },
        options: [
          {
            checked: false,
            text: 'Paper return',
            value: 'paperReturn'
          },
          {
            checked: false,
            text: 'Renewals invitation',
            value: 'renewalInvitations'
          },
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

    describe('the "backLink" property', () => {
      describe('when the page has not been visited', () => {
        beforeEach(() => {
          session.checkPageVisited = false
        })

        it('correctly set the back link to the check page', () => {
          const result = NoticeTypePresenter(session, auth)

          expect(result.backLink).toEqual({
            href: '/system/notices',
            text: 'Back'
          })
        })
      })

      describe('when the page has been visited', () => {
        beforeEach(() => {
          session.checkPageVisited = true
        })

        it('correctly set the back link to the check page', () => {
          const result = NoticeTypePresenter(session, auth)

          expect(result.backLink).toEqual({
            href: `/system/notices/setup/${session.id}/check-notice-type`,
            text: 'Back'
          })
        })
      })
    })

    describe('the "options" property', () => {
      describe('when a previous "noticeType" has been selected', () => {
        describe('and the selected notice type was "invitations"', () => {
          beforeEach(() => {
            session.noticeType = 'invitations'
          })

          it('returns the invitations checked', () => {
            const result = NoticeTypePresenter(session, auth)

            expect(result.options).toEqual([
              {
                checked: false,
                text: 'Paper return',
                value: 'paperReturn'
              },
              {
                checked: false,
                text: 'Renewals invitation',
                value: 'renewalInvitations'
              },
              {
                checked: true,
                text: 'Returns invitation',
                value: 'invitations'
              },
              {
                checked: false,
                text: 'Returns reminder',
                value: 'reminders'
              }
            ])
          })
        })

        describe('and the selected notice type was "reminders"', () => {
          beforeEach(() => {
            session.noticeType = 'reminders'
          })

          it('returns the invitations checked', () => {
            const result = NoticeTypePresenter(session, auth)

            expect(result.options).toEqual([
              {
                checked: false,
                text: 'Paper return',
                value: 'paperReturn'
              },
              {
                checked: false,
                text: 'Renewals invitation',
                value: 'renewalInvitations'
              },
              {
                checked: false,
                text: 'Returns invitation',
                value: 'invitations'
              },
              {
                checked: true,
                text: 'Returns reminder',
                value: 'reminders'
              }
            ])
          })
        })

        describe('and the selected notice type was "paperReturn"', () => {
          beforeEach(() => {
            session.noticeType = 'paperReturn'
          })

          it('returns the Return forms checked', () => {
            const result = NoticeTypePresenter(session, auth)

            expect(result.options).toEqual([
              {
                checked: true,
                text: 'Paper return',
                value: 'paperReturn'
              },
              {
                checked: false,
                text: 'Renewals invitation',
                value: 'renewalInvitations'
              },
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
            ])
          })
        })

        describe('and the journey is for the "standard" journey', () => {
          beforeEach(() => {
            session.journey = 'standard'
          })

          it('returns page data for the view', () => {
            const result = NoticeTypePresenter(session, auth)

            expect(result).toEqual({
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
              auth.credentials.scope = ['bulk_return_notifications']
            })

            it('returns page data for the view', () => {
              const result = NoticeTypePresenter(session, auth)

              expect(result).toEqual({
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

        describe('and the journey is the "adhoc" journey', () => {
          describe('and the user has both the "bulk_return_notifications" and "renewal_notifications" scopes', () => {
            it('returns both "returns" and "renewal" based notice types', () => {
              const result = NoticeTypePresenter(session, auth)

              expect(result).toEqual({
                backLink: {
                  href: '/system/notices',
                  text: 'Back'
                },
                options: [
                  {
                    checked: false,
                    text: 'Paper return',
                    value: 'paperReturn'
                  },
                  {
                    checked: false,
                    text: 'Renewals invitation',
                    value: 'renewalInvitations'
                  },
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

          describe('and the user only has the "bulk_return_notifications" scope', () => {
            beforeEach(() => {
              auth.credentials.scope = ['bulk_return_notifications']
            })

            it('returns only "returns" based notice types', () => {
              const result = NoticeTypePresenter(session, auth)

              expect(result).toEqual({
                backLink: {
                  href: '/system/notices',
                  text: 'Back'
                },
                options: [
                  {
                    checked: false,
                    text: 'Paper return',
                    value: 'paperReturn'
                  },
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

          describe('and the user only has the "renewal_notifications" scope', () => {
            beforeEach(() => {
              auth.credentials.scope = ['renewal_notifications']
            })

            it('returns only "renewal" based notice types', () => {
              const result = NoticeTypePresenter(session, auth)

              expect(result).toEqual({
                backLink: {
                  href: '/system/notices',
                  text: 'Back'
                },
                options: [
                  {
                    checked: false,
                    text: 'Renewals invitation',
                    value: 'renewalInvitations'
                  }
                ],
                pageTitle: 'Select the notice type'
              })
            })
          })

          describe('and the user does not have either the "bulk_return_notifications" or "renewal_notifications" scope', () => {
            beforeEach(() => {
              auth.credentials.scope = ['returns']
            })

            it('returns no options', () => {
              const result = NoticeTypePresenter(session, auth)

              expect(result.options).toEqual([])
            })
          })
        })
      })
    })
  })
})
