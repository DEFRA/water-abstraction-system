'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const MethodPresenter = require('../../../../app/presenters/return-versions/setup/method.presenter.js')

describe('Return Versions - Setup - Method presenter', () => {
  let session

  beforeEach(() => {
    session = {
      id: '61e07498-f309-4829-96a9-72084a54996d',
      checkPageVisited: false,
      licence: {
        id: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
        currentVersionStartDate: '2023-01-01T00:00:00.000Z',
        endDate: null,
        licenceRef: '01/ABC',
        licenceHolder: 'Turbo Kid',
        returnVersions: [
          {
            id: '60b5d10d-1372-4fb2-b222-bfac81da69ab',
            startDate: '2023-01-01T00:00:00.000Z',
            reason: null,
            modLogs: []
          }
        ],
        startDate: '2022-04-01T00:00:00.000Z',
        waterUndertaker: false
      },
      multipleUpload: false,
      journey: 'returns-required',
      requirements: [{}],
      startDateOptions: 'licenceStartDate',
      returnVersionStartDate: '2023-01-01T00:00:00.000Z',
      licenceVersion: {
        id: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
        endDate: null,
        startDate: '2022-04-01T00:00:00.000Z',
        copyableReturnVersions: [
          {
            id: '60b5d10d-1372-4fb2-b222-bfac81da69ab',
            startDate: '2023-01-01T00:00:00.000Z',
            reason: null,
            modLogs: []
          }
        ]
      },
      reason: 'major-change'
    }
  })

  describe('when provided with a session', () => {
    it('correctly presents the data', () => {
      const result = MethodPresenter.go(session)

      expect(result).to.equal({
        backLink: '/system/return-versions/setup/61e07498-f309-4829-96a9-72084a54996d/reason',
        displayCopyExisting: true,
        licenceRef: '01/ABC',
        pageTitle: 'How do you want to set up the requirements for returns?',
        sessionId: '61e07498-f309-4829-96a9-72084a54996d',
        method: null
      })
    })
  })

  describe('the "backLink" property', () => {
    it('returns a link back to the "start-date" page', () => {
      const result = MethodPresenter.go(session)

      expect(result.backLink).to.equal('/system/return-versions/setup/61e07498-f309-4829-96a9-72084a54996d/reason')
    })
  })

  describe('the "displayCopyExisting" property', () => {
    describe('when the licence version has copyable return versions (something to copy from)', () => {
      it('returns true', () => {
        const result = MethodPresenter.go(session)

        expect(result.displayCopyExisting).to.be.true()
      })
    })

    describe('when the licence version does not have copyable return versions (nothing to copy from)', () => {
      beforeEach(() => {
        session.licenceVersion.copyableReturnVersions = []
      })

      it('returns false', () => {
        const result = MethodPresenter.go(session)

        expect(result.displayCopyExisting).to.be.false()
      })
    })
  })

  describe('the "method" property', () => {
    describe('when the user has previously submitted a setup method', () => {
      beforeEach(() => {
        session.method = 'set-up-manually'
      })

      it('returns a populated method', () => {
        const result = MethodPresenter.go(session)

        expect(result.method).to.equal('set-up-manually')
      })
    })

    describe('when the user has not previously submitted a setup method', () => {
      it('returns an empty method', () => {
        const result = MethodPresenter.go(session)

        expect(result.method).to.be.null()
      })
    })
  })
})
