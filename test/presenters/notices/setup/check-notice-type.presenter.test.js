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

        session.noticeType = 'paper-forms'

        session.dueReturns = [dueReturnOne, dueReturnTwo]

        session.selectedReturns = [dueReturnOne.returnId]
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
          },
          {
            actions: {
              items: [
                {
                  href: '/system/notices/setup/123/returns-for-paper-forms',
                  text: 'Change',
                  visuallyHiddenText: 'returns for paper forms'
                }
              ]
            },
            key: {
              text: 'Returns'
            },
            value: {
              html: '3135 - 1 April 2002 to 31 March 2003'
            }
          }
        ])
      })

      describe('and there are more than one "selectedReturns"', () => {
        beforeEach(() => {
          session.selectedReturns = [dueReturnOne.returnId, dueReturnTwo.returnId]
        })

        it('returns the html with a line break', () => {
          const result = CheckNoticeTypePresenter.go(session)

          expect(result.summaryList[2].value.html).to.equal(
            '3135 - 1 April 2002 to 31 March 2003<br>3135 - 1 April 2003 to 31 March 2004'
          )
        })
      })
    })
  })
})
