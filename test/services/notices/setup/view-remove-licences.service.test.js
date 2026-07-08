'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const SessionModelStub = require('../../../support/stubs/session.stub.js')
const { generateNoticeReferenceCode } = require('../../../../app/lib/general.lib.js')

// Things we need to stub
const FetchSessionDal = require('../../../../app/dal/fetch-session.dal.js')

// Thing under test
const ViewRemoveLicencesService = require('../../../../app/services/notices/setup/view-remove-licences.service.js')

describe('Notices - Setup - View Remove Licences service', () => {
  const licences = []

  let referenceCode
  let session
  let sessionData

  beforeEach(() => {
    referenceCode = generateNoticeReferenceCode()

    sessionData = { licences, referenceCode }

    session = SessionModelStub.build(Sinon, sessionData)

    Sinon.stub(FetchSessionDal, 'go').resolves(session)
  })

  afterEach(() => {
    Sinon.restore()
  })

  it('correctly presents the data', async () => {
    const result = await ViewRemoveLicencesService(session.id)

    expect(result).toEqual({
      activeNavBar: 'notices',
      backLink: {
        href: `/system/notices/setup/${session.id}/check`,
        text: 'Back'
      },
      hint: 'Separate the licences numbers with a comma or new line.',
      pageTitle: 'Enter the licence numbers to remove from the mailing list',
      pageTitleCaption: `Notice ${referenceCode}`,
      removeLicences: []
    })
  })
})
