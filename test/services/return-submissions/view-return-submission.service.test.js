'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const FetchReturnSubmissionService = require('../../../app/services/return-submissions/fetch-return-submission.service.js')

// Test helpers
const ReturnLogModel = require('../../../app/models/return-log.model.js')
const ReturnLogHelper = require('../../support/helpers/return-log.helper.js')
const ReturnSubmissionLineModel = require('../../../app/models/return-submission-line.model.js')
const ReturnSubmissionLineHelper = require('../../support/helpers/return-submission-line.helper.js')
const ReturnSubmissionModel = require('../../../app/models/return-submission.model.js')
const ReturnSubmissionHelper = require('../../support/helpers/return-submission.helper.js')

// Thing under test
const ViewReturnSubmissionService = require('../../../app/services/return-submissions/view-return-submission.service.js')

describe('View Return Submission service', () => {
  beforeEach(() => {
    const mockReturnSubmission = createInstance(ReturnSubmissionModel, ReturnSubmissionHelper)

    mockReturnSubmission.returnLog = createInstance(ReturnLogModel, ReturnLogHelper)

    mockReturnSubmission.returnSubmissionLines = [
      createInstance(ReturnSubmissionLineModel, ReturnSubmissionLineHelper, {
        returnSubmissionId: mockReturnSubmission.id,
        startDate: new Date(2025, 0, 1),
        endDate: new Date(2025, 0, 1),
        timePeriod: 'day',
        quantity: 1000
      })
    ]

    Sinon.stub(FetchReturnSubmissionService, 'go').resolves(mockReturnSubmission)
  })

  afterEach(() => {
    Sinon.restore()
  })

  it('correctly fetches return log and transforms it via the presenter', async () => {
    const result = await ViewReturnSubmissionService.go('RETURN_SUBMISSION_ID', '2025-0')

    // We only check a few items here -- the key thing is that the mock return log was fetched and successfully
    // passed to the presenter
    expect(result).to.include({
      activeNavBar: 'search',
      pageTitle: 'Water abstracted January 2025'
    })
    expect(result.tableData).to.include({ unitTotal: '1,000' })
  })
})

// Create an instance of a given model using the defaults of the given helper, without creating it in the db. This
// allows us to pass in the expected models without having to touch the db at all.
function createInstance(model, helper, data = {}) {
  return model.fromJson({
    createdAt: new Date(),
    updatedAt: new Date(),
    ...helper.defaults(),
    ...data
  })
}
