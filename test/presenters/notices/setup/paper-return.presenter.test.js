// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import { generateUUID } from '../../../../app/lib/general.lib.js'

// Thing under test
import PaperReturnPresenter from '../../../../app/presenters/notices/setup/paper-return.presenter.js'

describe('Notices - Setup - Paper Return presenter', () => {
  let dueReturn
  let session

  beforeEach(() => {
    dueReturn = {
      siteDescription: 'Potable Water Supply - Direct',
      endDate: '2003-03-31',
      returnLogId: generateUUID(),
      returnReference: '3135',
      startDate: '2002-04-01'
    }

    session = {
      id: generateUUID(),
      dueReturns: [dueReturn]
    }
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = PaperReturnPresenter(session)

      expect(result).toEqual({
        backLink: {
          href: `/system/notices/setup/${session.id}/licence`,
          text: 'Back'
        },
        pageTitle: 'Select the returns for the paper return',
        returns: [
          {
            checked: false,
            hint: { text: '1 April 2002 to 31 March 2003' },
            text: `${dueReturn.returnReference} Potable Water Supply - Direct`,
            value: dueReturn.returnLogId
          }
        ]
      })
    })

    describe('and returns have previously been selected', () => {
      beforeEach(() => {
        session.selectedReturns = [dueReturn.returnLogId]
      })

      it('returns the "returns" previously selected as checked', () => {
        const result = PaperReturnPresenter(session)

        expect(result.returns).toEqual([
          {
            checked: true,
            hint: { text: '1 April 2002 to 31 March 2003' },
            text: `${dueReturn.returnReference} Potable Water Supply - Direct`,
            value: dueReturn.returnLogId
          }
        ])
      })

      describe('and the page has been visited', () => {
        beforeEach(() => {
          session.checkPageVisited = true
        })

        it('correctly set the back link to the check page', () => {
          const result = PaperReturnPresenter(session)

          expect(result.backLink).toEqual({
            href: `/system/notices/setup/${session.id}/check-notice-type`,
            text: 'Back'
          })
        })
      })
    })
  })
})
