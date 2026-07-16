// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import GenerateHelper from '../../../support/helpers/generate.helper.js'
import SessionModelStub from '../../../support/stubs/session.stub.js'
import { generateNoticeReferenceCode } from '../../../../app/lib/general.lib.js'

// Things we need to stub
import * as FetchLicenceRefsWithDueReturnsService from '../../../../app/services/notices/setup/fetch-licence-refs-with-due-returns.service.js'
import * as FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'

// Thing under test
import SubmitRemoveLicencesService from '../../../../app/services/notices/setup/submit-remove-licences.service.js'

describe('Notices - Setup - Submit Remove Licences service', () => {
  let licenceRefWithDueReturns
  let payload
  let referenceCode
  let session
  let sessionData

  beforeEach(() => {
    referenceCode = generateNoticeReferenceCode('RINV-')

    sessionData = {
      returnsPeriod: 'allYear',
      referenceCode,
      determinedReturnsPeriod: {
        name: 'allYear',
        dueDate: '2024-04-28',
        endDate: '2024-03-31',
        summer: false,
        startDate: '2023-04-01'
      }
    }

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)

    licenceRefWithDueReturns = GenerateHelper.generateLicenceRef()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when submitting licences to remove ', () => {
    describe('is successful', () => {
      beforeEach(() => {
        payload = { removeLicences: licenceRefWithDueReturns }

        vi.spyOn(FetchLicenceRefsWithDueReturnsService, 'default').mockResolvedValue([licenceRefWithDueReturns])
      })

      it('saves the submitted value', async () => {
        await SubmitRemoveLicencesService(session.id, payload)

        expect(session.removeLicences).toEqual(licenceRefWithDueReturns)
        expect(session.$update).toHaveBeenCalled()
      })

      it('returns the redirect route', async () => {
        const result = await SubmitRemoveLicencesService(session.id, payload)

        expect(result).toEqual({
          redirect: `${session.id}/check`
        })
      })
    })

    describe('fails validation', () => {
      beforeEach(() => {
        payload = { removeLicences: '789' }

        licenceRefWithDueReturns = []

        vi.spyOn(FetchLicenceRefsWithDueReturnsService, 'default').mockResolvedValue([licenceRefWithDueReturns])
      })

      it('correctly presents the data with the error', async () => {
        const result = await SubmitRemoveLicencesService(session.id, payload)

        expect(result).toEqual({
          activeNavBar: 'notices',
          backLink: {
            href: `/system/notices/setup/${session.id}/check`,
            text: 'Back'
          },
          error: {
            errorList: [
              {
                href: '#removeLicences',
                text: 'There are no returns due for licence 789'
              }
            ],
            removeLicences: {
              text: 'There are no returns due for licence 789'
            }
          },
          hint: 'Separate the licences numbers with a comma or new line.',
          removeLicences: '789',
          pageTitleCaption: `Notice ${referenceCode}`,
          pageTitle: 'Enter the licence numbers to remove from the mailing list'
        })
      })
    })
  })
})
