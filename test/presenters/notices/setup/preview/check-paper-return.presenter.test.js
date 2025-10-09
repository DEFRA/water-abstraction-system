'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateUUID } = require('../../../../../app/lib/general.lib.js')

// Thing under test
const CheckPaperReturnPresenter = require('../../../../../app/presenters/notices/setup/preview/check-paper-return.presenter.js')

describe('Notices - Setup - Preview - Check Paper Return Presenter', () => {
  const contactHashId = '9df5923f179a0ed55c13173c16651ed9'
  const sessionId = '7334a25e-9723-4732-a6e1-8e30c5f3732e'

  let dueReturn
  let session

  beforeEach(() => {
    dueReturn = {
      siteDescription: 'Potable Water Supply - Direct',
      endDate: '2003-03-31',
      returnId: generateUUID(),
      returnReference: '3135',
      startDate: '2002-04-01'
    }

    session = {
      id: sessionId,
      dueReturns: [dueReturn],
      referenceCode: 'PRTF-WJUKBX',
      selectedReturns: [dueReturn.returnId]
    }
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = CheckPaperReturnPresenter.go(session, contactHashId)

      expect(result).to.equal({
        backLink: `/system/notices/setup/${sessionId}/check`,
        caption: 'Notice PRTF-WJUKBX',
        pageTitle: 'Check the recipient previews',
        returnLogs: [
          {
            action: {
              link: `/system/notices/setup/${sessionId}/preview/${contactHashId}/paper-return/${dueReturn.returnId}`,
              text: 'Preview'
            },
            returnPeriod: '1 April 2002 to 31 March 2003',
            returnReference: '3135',
            siteDescription: 'Potable Water Supply - Direct'
          }
        ]
      })
    })

    describe('the "returnLogs" property', () => {
      describe('when there are multiple "dueReturns"', () => {
        let additionalDueReturn

        beforeEach(() => {
          additionalDueReturn = {
            siteDescription: 'Not a moon',
            endDate: '2003-05-04',
            returnId: generateUUID(),
            returnReference: '5653',
            startDate: '2002-04-01'
          }
        })

        describe('and they are all "selectedReturns"', () => {
          beforeEach(() => {
            session.dueReturns = [dueReturn, additionalDueReturn]
            session.selectedReturns = [dueReturn.returnId, additionalDueReturn.returnId]
          })

          it('returns page data for the view', () => {
            const result = CheckPaperReturnPresenter.go(session, contactHashId)

            expect(result.returnLogs).to.equal([
              {
                action: {
                  link: `/system/notices/setup/${sessionId}/preview/${contactHashId}/paper-return/${dueReturn.returnId}`,
                  text: 'Preview'
                },
                returnPeriod: '1 April 2002 to 31 March 2003',
                returnReference: '3135',
                siteDescription: 'Potable Water Supply - Direct'
              },
              {
                action: {
                  link: `/system/notices/setup/${sessionId}/preview/${contactHashId}/paper-return/${additionalDueReturn.returnId}`,
                  text: 'Preview'
                },
                returnPeriod: '1 April 2002 to 4 May 2003',
                returnReference: '5653',
                siteDescription: 'Not a moon'
              }
            ])
          })
        })

        describe('and there are some "selectedReturns"', () => {
          beforeEach(() => {
            session.dueReturns = [dueReturn, additionalDueReturn]
            session.selectedReturns = [dueReturn.returnId]
          })

          it('returns page data for the view - with only the selected returns', () => {
            const result = CheckPaperReturnPresenter.go(session, contactHashId)

            expect(result.returnLogs).to.equal([
              {
                action: {
                  link: `/system/notices/setup/${sessionId}/preview/${contactHashId}/paper-return/${dueReturn.returnId}`,
                  text: 'Preview'
                },
                returnPeriod: '1 April 2002 to 31 March 2003',
                returnReference: '3135',
                siteDescription: 'Potable Water Supply - Direct'
              }
            ])
          })
        })
      })
    })
  })
})
