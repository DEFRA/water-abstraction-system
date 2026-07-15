// Test helpers
import SessionModelStub from '../../../support/stubs/session.stub.js'

// Things we need to stub
import * as FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'

// Thing under test
import SubmitSingleVolumeService from '../../../../app/services/return-logs/setup/submit-single-volume.service.js'

describe('Return Logs Setup - Submit Single Volume service', () => {
  let payload
  let session
  let sessionData

  beforeEach(() => {
    sessionData = {
      returnReference: '12345',
      units: 'litres'
    }

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      beforeEach(() => {
        payload = { singleVolume: 'yes', singleVolumeQuantity: '1000' }
      })

      it('saves the submitted option', async () => {
        await SubmitSingleVolumeService(session.id, payload)

        expect(session.singleVolume).toEqual('yes')
        expect(session.singleVolumeQuantity).toEqual(1000)

        expect(session.$update).toHaveBeenCalled()
      })

      describe('and the user has previously selected "yes" to a single volume being provided', () => {
        it('returns the correct details the controller needs to redirect the journey', async () => {
          const result = await SubmitSingleVolumeService(session.id, payload)

          expect(result).toEqual({ singleVolume: 'yes' })
        })
      })

      describe('and the user has previously selected "no" to a single volume being provided', () => {
        beforeEach(() => {
          payload = { singleVolume: 'no' }
        })

        it('returns the correct details the controller needs to redirect the journey', async () => {
          const result = await SubmitSingleVolumeService(session.id, payload)

          expect(result).toEqual({ singleVolume: 'no' })
        })
      })
    })

    describe('with an invalid payload', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns the page data for the view', async () => {
        const result = await SubmitSingleVolumeService(session.id, payload)

        expect(result).toMatchObject({
          backLink: { href: `/system/return-logs/setup/${session.id}/meter-provided`, text: 'Back' },
          pageTitle: 'Is it a single volume?',
          pageTitleCaption: 'Return reference 12345',
          singleVolume: null,
          singleVolumeQuantity: null,
          units: 'litres'
        })
      })

      describe('because the user has not selected anything', () => {
        it('includes an error for the radio form element', async () => {
          const result = await SubmitSingleVolumeService(session.id, payload)

          expect(result.error).toEqual({
            errorList: [{ href: '#singleVolume', text: "Select if it's a single volume" }],
            singleVolume: { text: "Select if it's a single volume" }
          })
        })
      })

      describe('because the user entered an invalid volume', () => {
        beforeEach(() => {
          payload.singleVolume = 'yes'
          payload.singleVolumeQuantity = '-1'
        })

        it('includes an error for the input form element', async () => {
          const result = await SubmitSingleVolumeService(session.id, payload)

          expect(result.error).toEqual({
            errorList: [{ href: '#singleVolumeQuantity', text: 'Enter a total amount greater than zero' }],
            singleVolumeQuantity: { text: 'Enter a total amount greater than zero' }
          })
        })
      })
    })
  })
})
