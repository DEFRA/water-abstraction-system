// Test helpers
import * as ReturnLogHelper from '../../support/helpers/return-log.helper.js'
import ReturnLogModel from '../../../app/models/return-log.model.js'

// Thing under test
import SubmitDetailsService from '../../../app/services/return-logs/submit-details.service.js'

describe('Return Logs - Submit Details Service', () => {
  let payload
  let patchStub
  let mockReturnLog

  beforeEach(() => {
    mockReturnLog = ReturnLogModel.fromJson({ ...ReturnLogHelper.defaults() })

    patchStub = vi.fn().mockReturnThis()
    vi.spyOn(ReturnLogModel, 'query').mockReturnValue({
      patch: patchStub,
      findById: vi.fn().mockResolvedValue()
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    describe('and the user is marking the return log as under query', () => {
      beforeEach(() => {
        payload = { 'mark-query': 'mark' }
      })

      it('updates the "underQuery" flag on the return log to true', async () => {
        await SubmitDetailsService(payload, mockReturnLog.id)

        // Check we save the status change
        const [patchObject] = patchStub.mock.calls[0]

        expect(patchObject).toMatchObject({ underQuery: true })
      })
    })

    describe('and the user is marking the return log query as resolved', () => {
      beforeEach(() => {
        payload = { 'mark-query': 'resolve' }
      })

      it('updates the "underQuery" flag on the return log to false', async () => {
        await SubmitDetailsService(payload, mockReturnLog.id)

        // Check we save the status change
        const [patchObject] = patchStub.mock.calls[0]

        expect(patchObject).toMatchObject({ underQuery: false })
      })
    })
  })
})
