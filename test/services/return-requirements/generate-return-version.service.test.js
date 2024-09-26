'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { generateUUID } = require('../../../app/lib/general.lib.js')
const ReturnVersionHelper = require('../../support/helpers/return-version.helper.js')

// Things we need to stub
const GenerateReturnVersionRequirementsService = require('../../../app/services/return-requirements/generate-return-version-requirements.service.js')
const ProcessExistingReturnVersionsService = require('../../../app/services/return-requirements/process-existing-return-versions.service.js')

// Thing under test
const GenerateReturnVersionService = require('../../../app/services/return-requirements/generate-return-version.service.js')

describe('Generate Return Version service', () => {
  const userId = 12345

  let licenceId
  let sessionData

  beforeEach(async () => {
    Sinon.stub(GenerateReturnVersionRequirementsService, 'go').resolves('return requirements data')
    Sinon.stub(ProcessExistingReturnVersionsService, 'go').resolves('2024-04-01T00:00:00.000Z')
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called with the minimum possible session data and previous return versions exist', () => {
    beforeEach(async () => {
      licenceId = generateUUID()
      sessionData = {
        setup: 'use-existing-requirements',
        reason: 'minor-change',
        journey: 'returns-required',
        licence: {
          id: licenceId,
          endDate: null,
          startDate: '1967-12-08T00:00:00.000Z',
          licenceRef: '99/99/9999',
          licenceHolder: 'A licence holder',
          returnVersions: [
            {
              id: '1b67ad84-1511-4944-834d-00814899564f',
              reason: null,
              startDate: '2023-02-13T00:00:00.000Z'
            },
            {
              id: '745886bd-b73a-41e8-819c-dfd89d44ca91',
              reason: null,
              startDate: '2008-04-01T00:00:00.000Z'
            }
          ],
          currentVersionStartDate: '2023-02-13T00:00:00.000Z'
        },
        requirements: ['return requirements data'],
        checkPageVisited: true,
        startDateOptions: 'licenceStartDate'
      }

      await ReturnVersionHelper.add({ licenceId, version: 100 })
      await ReturnVersionHelper.add({ licenceId, version: 102 })
    })

    it('generates the data required to populate a record in the "return_version" table', async () => {
      const result = await GenerateReturnVersionService.go(sessionData, userId)

      expect(result.returnRequirements).to.equal('return requirements data')
      expect(result.returnVersion.createdBy).to.equal(userId)
      expect(result.returnVersion.endDate).to.equal('2024-04-01T00:00:00.000Z')
      expect(result.returnVersion.licenceId).to.equal(licenceId)
      expect(result.returnVersion.multipleUpload).to.be.false()
      expect(result.returnVersion.notes).to.be.undefined()
      expect(result.returnVersion.reason).to.equal(sessionData.reason)
      expect(result.returnVersion.startDate).to.equal(new Date(sessionData.licence.currentVersionStartDate))
      expect(result.returnVersion.status).to.equal('current')
      // Version number is 103 because this is the next version number after the previous version
      expect(result.returnVersion.version).to.equal(103)
      expect(ProcessExistingReturnVersionsService.go.called).to.be.true()
    })

    it('processes the existing return versions', async () => {
      await GenerateReturnVersionService.go(sessionData, userId)

      expect(ProcessExistingReturnVersionsService.go.called).to.be.true()
    })
  })

  describe('when called with the maximum possible session data and no previous return versions exist', () => {
    beforeEach(async () => {
      licenceId = generateUUID()
      sessionData = {
        note: {
          content: 'This is a test note',
          userEmail: 'admin-internal@wrls.gov.uk'
        },
        setup: 'set-up-manually',
        reason: 'change-to-special-agreement',
        journey: 'returns-required',
        licence: {
          id: licenceId,
          endDate: null,
          startDate: '1967-09-01T00:00:00.000Z',
          licenceRef: '88/88/8888',
          licenceHolder: 'Another licence holder',
          returnVersions: []
        },
        requirements: ['return requirements data'],
        startDateDay: '1',
        startDateYear: '2024',
        startDateMonth: '4',
        checkPageVisited: true,
        startDateOptions: 'anotherStartDate',
        additionalSubmissionOptions: [
          'multiple-upload'
        ]
      }
    })

    it('generates the data required to populate a record in the "return_version" table', async () => {
      const result = await GenerateReturnVersionService.go(sessionData, userId)

      expect(result.returnRequirements).to.equal('return requirements data')
      expect(result.returnVersion.createdBy).to.equal(userId)
      expect(result.returnVersion.endDate).to.be.null()
      expect(result.returnVersion.licenceId).to.equal(licenceId)
      expect(result.returnVersion.multipleUpload).to.be.true()
      expect(result.returnVersion.notes).to.equal(sessionData.note.content)
      expect(result.returnVersion.reason).to.equal(sessionData.reason)
      expect(result.returnVersion.startDate).to.equal(
        new Date(sessionData.startDateYear, sessionData.startDateMonth - 1, sessionData.startDateDay)
      )
      expect(result.returnVersion.status).to.equal('current')
      // Version number is 1 because no previous return versions exist
      expect(result.returnVersion.version).to.equal(1)
    })

    it('does not process any existing return versions', async () => {
      await GenerateReturnVersionService.go(sessionData, userId)

      expect(ProcessExistingReturnVersionsService.go.called).to.be.false()
    })
  })

  describe('when called with session data from the "no-returns-required" journey', () => {
    beforeEach(async () => {
      licenceId = generateUUID()
      sessionData = {
        reason: 'returns-exception',
        journey: 'no-returns-required',
        licence: {
          id: licenceId,
          endDate: null,
          startDate: '2023-02-13T00:00:00.000Z',
          licenceRef: '99/99/9999',
          licenceHolder: 'A licence holder',
          returnVersions: [],
          currentVersionStartDate: '2023-02-13T00:00:00.000Z'
        },
        requirements: [{}],
        checkPageVisited: true,
        startDateOptions: 'licenceStartDate'
      }
    })

    it('generates the data required to populate a record in the "return_version" table', async () => {
      const result = await GenerateReturnVersionService.go(sessionData, userId)

      expect(result.returnRequirements).to.equal([])
      expect(result.returnVersion.createdBy).to.equal(userId)
      expect(result.returnVersion.endDate).to.be.null()
      expect(result.returnVersion.licenceId).to.equal(licenceId)
      expect(result.returnVersion.multipleUpload).to.be.false()
      expect(result.returnVersion.notes).to.be.undefined()
      expect(result.returnVersion.reason).to.equal(sessionData.reason)
      expect(result.returnVersion.startDate).to.equal(new Date(sessionData.licence.currentVersionStartDate))
      expect(result.returnVersion.status).to.equal('current')
      expect(result.returnVersion.version).to.equal(1)
    })
  })
})
