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

    session = { id: generateUUID(), noticeType }
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = CheckNoticeTypePresenter.go(session)

      expect(result).to.equal({
        links: {
          licenceNumber: `/system/notices/setup/${session.id}/licence`,
          noticeType: `/system/notices/setup/${session.id}/notice-type`,
          returns: `/system/notices/setup/${session.id}/paper-return`,
          returnsPeriod: `/system/notices/setup/${session.id}/returns-period`
        },
        pageTitle: 'Check the notice type',
        returnNoticeType: 'Returns invitation',
        sessionId: session.id
      })
    })

    describe('and the notice type is "invitations"', () => {
      beforeEach(() => {
        session.noticeType = 'invitations'
      })

      describe('and it is for the "adhoc" journey', () => {
        beforeEach(() => {
          session.licenceRef = licenceRef
        })

        it('returns page data', () => {
          const result = CheckNoticeTypePresenter.go(session)

          expect(result).to.equal({
            licenceRef,
            links: {
              licenceNumber: `/system/notices/setup/${session.id}/licence`,
              noticeType: `/system/notices/setup/${session.id}/notice-type`,
              returns: `/system/notices/setup/${session.id}/paper-return`,
              returnsPeriod: `/system/notices/setup/${session.id}/returns-period`
            },
            pageTitle: 'Check the notice type',
            returnNoticeType: 'Returns invitation',
            sessionId: session.id
          })
        })
      })

      describe('and it is for the "standard" journey', () => {
        beforeEach(() => {
          session.determinedReturnsPeriod = {
            name: 'summer',
            summer: 'true',
            dueDate: '2025-11-28T00:00:00.000Z',
            endDate: '2025-10-31T00:00:00.000Z',
            startDate: '2024-11-01T00:00:00.000Z'
          }
        })

        it('returns page data', () => {
          const result = CheckNoticeTypePresenter.go(session)

          expect(result).to.equal({
            links: {
              licenceNumber: `/system/notices/setup/${session.id}/licence`,
              noticeType: `/system/notices/setup/${session.id}/notice-type`,
              returns: `/system/notices/setup/${session.id}/paper-return`,
              returnsPeriod: `/system/notices/setup/${session.id}/returns-period`
            },
            pageTitle: 'Check the notice type',
            returnNoticeType: 'Returns invitation',
            returnsPeriodText: 'Summer annual 1 November 2024 to 31 October 2025',
            sessionId: session.id
          })
        })
      })
    })

    describe('and the notice type is "reminders"', () => {
      beforeEach(() => {
        session.noticeType = 'reminders'
      })

      describe('and it is for the "adhoc" journey', () => {
        beforeEach(() => {
          session.licenceRef = licenceRef
        })

        it('returns page data', () => {
          const result = CheckNoticeTypePresenter.go(session)

          expect(result).to.equal({
            licenceRef,
            links: {
              licenceNumber: `/system/notices/setup/${session.id}/licence`,
              noticeType: `/system/notices/setup/${session.id}/notice-type`,
              returns: `/system/notices/setup/${session.id}/paper-return`,
              returnsPeriod: `/system/notices/setup/${session.id}/returns-period`
            },
            pageTitle: 'Check the notice type',
            returnNoticeType: 'Returns reminder',
            sessionId: session.id
          })
        })
      })

      describe('and it is for the "standard" journey', () => {
        beforeEach(() => {
          session.determinedReturnsPeriod = {
            name: 'summer',
            summer: 'true',
            dueDate: '2025-11-28T00:00:00.000Z',
            endDate: '2025-10-31T00:00:00.000Z',
            startDate: '2024-11-01T00:00:00.000Z'
          }
        })

        it('returns page data', () => {
          const result = CheckNoticeTypePresenter.go(session)

          expect(result).to.equal({
            links: {
              licenceNumber: `/system/notices/setup/${session.id}/licence`,
              noticeType: `/system/notices/setup/${session.id}/notice-type`,
              returns: `/system/notices/setup/${session.id}/paper-return`,
              returnsPeriod: `/system/notices/setup/${session.id}/returns-period`
            },
            pageTitle: 'Check the notice type',
            returnNoticeType: 'Returns reminder',
            returnsPeriodText: 'Summer annual 1 November 2024 to 31 October 2025',
            sessionId: session.id
          })
        })
      })
    })

    describe('and the notice type is "paperReturn"', () => {
      beforeEach(() => {
        session.licenceRef = licenceRef
        session.noticeType = 'paperReturn'
      })

      describe('and it is for the "adhoc" journey', () => {
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

          session.dueReturns = [dueReturnOne, dueReturnTwo]

          session.selectedReturns = [dueReturnOne.returnId]
        })

        it('returns the page data', () => {
          const result = CheckNoticeTypePresenter.go(session)

          expect(result).to.equal({
            licenceRef,
            links: {
              licenceNumber: `/system/notices/setup/${session.id}/licence`,
              noticeType: `/system/notices/setup/${session.id}/notice-type`,
              returns: `/system/notices/setup/${session.id}/paper-return`,
              returnsPeriod: `/system/notices/setup/${session.id}/returns-period`
            },
            pageTitle: 'Check the notice type',
            returnNoticeType: 'Paper return',
            returns: ['3135 - 1 April 2002 to 31 March 2003'],
            sessionId: session.id
          })
        })

        describe('and there are more than one "selectedReturns"', () => {
          beforeEach(() => {
            session.selectedReturns = [dueReturnOne.returnId, dueReturnTwo.returnId]
          })

          it('returns an array of "selectedDueReturns"', () => {
            const result = CheckNoticeTypePresenter.go(session)

            expect(result.returns).to.equal([
              '3135 - 1 April 2002 to 31 March 2003',
              '3135 - 1 April 2003 to 31 March 2004'
            ])
          })
        })
      })
    })
  })
})
