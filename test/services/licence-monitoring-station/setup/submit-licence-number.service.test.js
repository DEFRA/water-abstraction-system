// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import GenerateHelper from '../../../support/helpers/generate.helper.js'
import LicenceModel from '../../../../app/models/licence.model.js'
import SessionModelStub from '../../../support/stubs/session.stub.js'
import { generateUUID } from '../../../../app/lib/general.lib.js'

// Things we need to stub
import * as FetchLicenceDal from '../../../../app/dal/licence-monitoring-station/fetch-licence.dal.js'
import * as FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'

// Thing under test
import SubmitLicenceNumberService from '../../../../app/services/licence-monitoring-station/setup/submit-licence-number.service.js'

describe('Licence Monitoring Station Setup - Licence Number Service', () => {
  let licence
  let payload
  let session
  let sessionData

  beforeEach(() => {
    payload = {}

    licence = LicenceModel.fromJson({
      expiredDate: null,
      id: generateUUID(),
      lapsedDate: null,
      licenceRef: GenerateHelper.generateLicenceRef(),
      revokedDate: null
    })

    sessionData = {
      label: 'LABEL'
    }

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)

    vi.spyOn(FetchLicenceDal, 'default').mockResolvedValue(licence)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    describe('and the licence exists', () => {
      beforeEach(async () => {
        payload = { licenceRef: licence.licenceRef }
      })

      describe("and the submitted licence isn't already stored in the session", () => {
        it('saves the submitted value', async () => {
          await SubmitLicenceNumberService(session.id, payload)

          expect(session.licenceRef).toEqual(payload.licenceRef)
          expect(session.$update).toHaveBeenCalled()
        })

        it('saves the licence id', async () => {
          await SubmitLicenceNumberService(session.id, payload)

          expect(session.licenceId).toEqual(licence.id)
        })

        describe('and the check page has not been visited', () => {
          it('returns a false value so the controller can redirect to the next page', async () => {
            const result = await SubmitLicenceNumberService(session.id, payload)

            expect(result).toEqual({
              checkPageVisited: false
            })
          })
        })

        describe('and the check page has been visited', () => {
          beforeEach(() => {
            sessionData = { ...sessionData, checkPageVisited: true }

            session = SessionModelStub(sessionData)

            vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
          })

          it('still returns a false value so the controller can redirect to the check page', async () => {
            const result = await SubmitLicenceNumberService(session.id, payload)

            expect(result).toEqual({
              checkPageVisited: false
            })
          })
        })
      })

      describe('and the submitted licence is already stored in the session', () => {
        describe('and the check page has been not been visited', () => {
          beforeEach(() => {
            sessionData = { ...sessionData, licenceRef: licence.licenceRef }

            session = SessionModelStub(sessionData)

            vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
          })

          it('returns a falsy value so the controller can redirect to the next page', async () => {
            const result = await SubmitLicenceNumberService(session.id, payload)

            expect(result).toEqual({
              checkPageVisited: undefined
            })
          })
        })

        describe('and the check page has been visited', () => {
          beforeEach(() => {
            sessionData = { ...sessionData, licenceRef: licence.licenceRef, checkPageVisited: true }

            session = SessionModelStub(sessionData)

            vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
          })

          it('leaves the checkPageVisited flag in the session as true', async () => {
            await SubmitLicenceNumberService(session.id, payload)

            expect(session.checkPageVisited).toBe(true)
          })

          it('returns a true value so the controller can redirect to the next page', async () => {
            const result = await SubmitLicenceNumberService(session.id, payload)

            expect(result).toEqual({
              checkPageVisited: true
            })
          })
        })
      })
    })
  })

  describe('and the licence does not exist', () => {
    beforeEach(() => {
      payload = { licenceRef: '1234567890' }

      vi.spyOn(FetchLicenceDal, 'default').mockResolvedValue(null)
    })

    it('returns page data for the view, with errors', async () => {
      const result = await SubmitLicenceNumberService(session.id, payload)

      expect(result).toEqual({
        error: { text: 'Licence could not be found' },
        backLink: `/system/licence-monitoring-station/setup/${session.id}/stop-or-reduce`,
        licenceRef: '1234567890',
        monitoringStationLabel: 'LABEL',
        pageTitle: 'Enter the licence number this threshold applies to'
      })
    })
  })

  describe('and no licence reference was submitted', () => {
    beforeEach(() => {
      payload = {}
    })

    it('returns page data for the view, with errors', async () => {
      const result = await SubmitLicenceNumberService(session.id, payload)

      expect(result).toEqual({
        error: { text: 'Enter a licence number' },
        backLink: `/system/licence-monitoring-station/setup/${session.id}/stop-or-reduce`,
        licenceRef: null,
        monitoringStationLabel: 'LABEL',
        pageTitle: 'Enter the licence number this threshold applies to'
      })
    })
  })
})
