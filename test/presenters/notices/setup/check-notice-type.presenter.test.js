'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateLicenceRef } = require('../../../support/helpers/licence.helper.js')

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
        backLink: `/system/notices/setup/${session.id}/notice-type`,
        continueButton: {
          href: `/system/notices/setup/${session.id}/check`,
          text: 'Continue to check recipients'
        },
        pageTitle: 'Check the notice type',
        summaryList: [
          {
            actions: {
              items: [
                {
                  href: `/system/notices/setup/${session.id}/licence`,
                  text: 'Change',
                  visuallyHiddenText: 'licence number'
                }
              ]
            },
            key: {
              text: 'Licence number'
            },
            value: {
              text: licenceRef
            }
          },
          {
            actions: {
              items: [
                {
                  href: `/system/notices/setup/${session.id}/notice-type`,
                  text: 'Change',
                  visuallyHiddenText: 'notice type'
                }
              ]
            },
            key: {
              text: 'Returns notice type'
            },
            value: {
              text: 'Standard returns invitation'
            }
          }
        ]
      })
    })

    describe('and the notice type is "invitations"', () => {
      beforeEach(() => {
        session.noticeType = 'invitations'
      })

      it('returns the summary list', () => {
        const result = CheckNoticeTypePresenter.go(session)

        expect(result.summaryList).to.equal([
          {
            actions: {
              items: [
                {
                  href: `/system/notices/setup/${session.id}/licence`,
                  text: 'Change',
                  visuallyHiddenText: 'licence number'
                }
              ]
            },
            key: {
              text: 'Licence number'
            },
            value: {
              text: licenceRef
            }
          },
          {
            actions: {
              items: [
                {
                  href: `/system/notices/setup/${session.id}/notice-type`,
                  text: 'Change',
                  visuallyHiddenText: 'notice type'
                }
              ]
            },
            key: {
              text: 'Returns notice type'
            },
            value: {
              text: 'Standard returns invitation'
            }
          }
        ])
      })
    })

    describe('and the notice type is "paper-forms"', () => {
      beforeEach(() => {
        session.noticeType = 'paper-forms'
      })

      it('returns the summary list', () => {
        const result = CheckNoticeTypePresenter.go(session)

        expect(result.summaryList).to.equal([
          {
            actions: {
              items: [
                {
                  href: `/system/notices/setup/${session.id}/licence`,
                  text: 'Change',
                  visuallyHiddenText: 'licence number'
                }
              ]
            },
            key: {
              text: 'Licence number'
            },
            value: {
              text: licenceRef
            }
          },
          {
            actions: {
              items: [
                {
                  href: `/system/notices/setup/${session.id}/notice-type`,
                  text: 'Change',
                  visuallyHiddenText: 'notice type'
                }
              ]
            },
            key: {
              text: 'Returns notice type'
            },
            value: {
              text: 'Submit using a paper form invitation'
            }
          }
        ])
      })
    })
  })
})
