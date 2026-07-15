// Things we need to stub
import * as FetchReturnSubmissionService from '../../../app/services/return-submissions/fetch-return-submission.service.js'

// Test helpers
import ReturnLogModel from '../../../app/models/return-log.model.js'
import ReturnLogHelper from '../../support/helpers/return-log.helper.js'
import ReturnSubmissionLineModel from '../../../app/models/return-submission-line.model.js'
import ReturnSubmissionLineHelper from '../../support/helpers/return-submission-line.helper.js'
import ReturnSubmissionModel from '../../../app/models/return-submission.model.js'
import ReturnSubmissionHelper from '../../support/helpers/return-submission.helper.js'

// Thing under test
import ViewReturnSubmissionService from '../../../app/services/return-submissions/view-return-submission.service.js'

describe('View Return Submission service', () => {
  beforeEach(() => {
    const mockReturnSubmission = _createInstance(ReturnSubmissionModel, ReturnSubmissionHelper)

    mockReturnSubmission.returnLog = _createInstance(ReturnLogModel, ReturnLogHelper)

    mockReturnSubmission.returnSubmissionLines = [
      _createInstance(ReturnSubmissionLineModel, ReturnSubmissionLineHelper, {
        returnSubmissionId: mockReturnSubmission.id,
        startDate: new Date(2025, 0, 1),
        endDate: new Date(2025, 0, 1),
        timePeriod: 'day',
        quantity: 1000
      })
    ]

    vi.spyOn(FetchReturnSubmissionService, 'default').mockResolvedValue(mockReturnSubmission)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('correctly fetches return log and transforms it via the presenter', async () => {
    const result = await ViewReturnSubmissionService('RETURN_SUBMISSION_ID', '2025-0')

    // We only check a few items here -- the key thing is that the mock return log was fetched and successfully
    // passed to the presenter
    expect(result).toMatchObject({
      pageTitle: 'Water abstracted January 2025'
    })
    expect(result.tableData).toMatchObject({ unitTotal: '1,000' })
  })
})

// Create an instance of a given model using the defaults of the given helper, without creating it in the db. This
// allows us to pass in the expected models without having to touch the db at all.
function _createInstance(model, helper, data = {}) {
  return model.fromJson({
    createdAt: new Date(),
    updatedAt: new Date(),
    ...helper.defaults(),
    ...data
  })
}
