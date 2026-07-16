// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import LicenceHelper from '../../../support/helpers/licence.helper.js'
import SessionModelStub from '../../../support/stubs/session.stub.js'
import { generateUUID } from '../../../../app/lib/general.lib.js'

// Test helpers
import YarStub from '../../../support/stubs/yar.stub.js'

// Things we need to stub
import * as FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'

// Thing under test
import SubmitPaperReturnService from '../../../../app/services/notices/setup/submit-paper-return.service.js'

describe('Notices - Setup - Submit Paper Return service', () => {
  let dueReturn
  let licenceRef
  let payload
  let session
  let sessionData
  let yarStub

  beforeEach(() => {
    licenceRef = LicenceHelper.generateLicenceRef()

    dueReturn = {
      siteDescription: 'Potable Water Supply - Direct',
      endDate: '2003-03-31',
      returnLogId: generateUUID(),
      returnReference: '3135',
      startDate: '2002-04-01'
    }

    payload = { returns: [dueReturn.returnLogId] }

    sessionData = { licenceRef }

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)

    yarStub = YarStub()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('saves the selected returns', async () => {
      await SubmitPaperReturnService(session.id, payload, yarStub)

      expect(session.selectedReturns).toEqual([dueReturn.returnLogId])
      expect(session.$update).toHaveBeenCalled()
    })

    it('continues the journey', async () => {
      const result = await SubmitPaperReturnService(session.id, payload, yarStub)

      expect(result).toEqual({})
    })

    describe('and the payload has one item (is not an array)', () => {
      beforeEach(() => {
        payload = { returns: dueReturn.returnLogId }
        sessionData = {}

        session = SessionModelStub(sessionData)

        vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
      })

      it('saves the selected returns', async () => {
        await SubmitPaperReturnService(session.id, payload, yarStub)

        expect(session.selectedReturns).toEqual([dueReturn.returnLogId])
      })
    })

    describe('from the check page', () => {
      describe('and the returns have been updated', () => {
        beforeEach(() => {
          sessionData = { checkPageVisited: true, selectedReturns: [generateUUID()] }

          session = SessionModelStub(sessionData)

          vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
        })

        it('sets a flash message', async () => {
          await SubmitPaperReturnService(session.id, payload, yarStub)

          // Check we add the flash message
          const [flashType, bannerMessage] = yarStub.flash.mock.calls[0]

          expect(flashType).toEqual('notification')
          expect(bannerMessage).toEqual({
            text: 'Returns updated',
            titleText: 'Updated'
          })
        })
      })

      describe('and the returns have not been updated', () => {
        beforeEach(() => {
          sessionData = { checkPageVisited: true, selectedReturns: [dueReturn.returnLogId] }

          session = SessionModelStub(sessionData)

          vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
        })

        it('does not set a flash message', async () => {
          await SubmitPaperReturnService(session.id, payload, yarStub)

          expect(yarStub.flash.mock.calls[0]).toBeUndefined()
        })
      })
    })
  })

  describe('when validation fails', () => {
    beforeEach(() => {
      payload = {}

      sessionData = { licenceRef, dueReturns: [dueReturn] }

      session = SessionModelStub(sessionData)

      vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
    })

    it('returns page data for the view, with errors', async () => {
      const result = await SubmitPaperReturnService(session.id, payload, yarStub)

      expect(result).toEqual({
        activeNavBar: 'notices',
        backLink: {
          href: `/system/notices/setup/${session.id}/licence`,
          text: 'Back'
        },
        error: {
          errorList: [
            {
              href: '#returns',
              text: 'Select the returns for the paper return'
            }
          ],
          returns: {
            text: 'Select the returns for the paper return'
          }
        },
        pageTitle: 'Select the returns for the paper return',
        returns: [
          {
            checked: false,
            hint: {
              text: '1 April 2002 to 31 March 2003'
            },
            text: `${dueReturn.returnReference} Potable Water Supply - Direct`,
            value: dueReturn.returnLogId
          }
        ]
      })
    })

    describe('and there are already "selectedReturns"', () => {
      beforeEach(() => {
        sessionData = { licenceRef, dueReturns: [dueReturn], selectedReturns: [dueReturn.returnLogId] }

        session = SessionModelStub(sessionData)

        vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
      })

      it('returns page data for the view, with errors, and no options selected', async () => {
        const result = await SubmitPaperReturnService(session.id, payload, yarStub)

        expect(result).toEqual({
          activeNavBar: 'notices',
          backLink: {
            href: `/system/notices/setup/${session.id}/licence`,
            text: 'Back'
          },
          error: {
            errorList: [
              {
                href: '#returns',
                text: 'Select the returns for the paper return'
              }
            ],
            returns: {
              text: 'Select the returns for the paper return'
            }
          },
          pageTitle: 'Select the returns for the paper return',
          returns: [
            {
              checked: false,
              hint: {
                text: '1 April 2002 to 31 March 2003'
              },
              text: `${dueReturn.returnReference} Potable Water Supply - Direct`,
              value: dueReturn.returnLogId
            }
          ]
        })
      })
    })
  })
})
