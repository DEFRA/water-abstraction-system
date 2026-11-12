// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Thing under test
import MethodPresenter from '../../../../src/presenters/return-versions/setup/method.presenter.js'

describe('Return Versions - Setup - Method presenter', () => {
  let session

  beforeEach(() => {
    session = {
      checkPageVisited: false,
      id: '61e07498-f309-4829-96a9-72084a54996d',
      journey: 'returns-required',
      licence: {
        currentVersionStartDate: '2023-01-01T00:00:00.000Z',
        endDate: null,
        id: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
        licenceHolder: 'Turbo Kid',
        licenceRef: '01/ABC',
        returnVersions: [
          {
            id: '60b5d10d-1372-4fb2-b222-bfac81da69ab',
            modLogs: [],
            reason: null,
            startDate: '2023-01-01T00:00:00.000Z'
          }
        ],
        startDate: '2022-04-01T00:00:00.000Z',
        waterUndertaker: false
      },
      licenceVersion: {
        copyableReturnVersions: [
          {
            id: '60b5d10d-1372-4fb2-b222-bfac81da69ab',
            modLogs: [],
            reason: null,
            startDate: '2023-01-01T00:00:00.000Z'
          }
        ],
        endDate: null,
        id: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
        startDate: '2022-04-01T00:00:00.000Z'
      },
      multipleUpload: false,
      reason: 'major-change',
      requirements: [{}],
      returnVersionStartDate: '2023-01-01T00:00:00.000Z',
      startDateOptions: 'licenceStartDate'
    }
  })

  describe('when provided with a session', () => {
    it('correctly presents the data', () => {
      const result = MethodPresenter(session)

      expect(result).toEqual({
        backLink: {
          href: '/system/return-versions/setup/61e07498-f309-4829-96a9-72084a54996d/reason',
          text: 'Back'
        },
        displayCopyExisting: true,
        licenceRef: '01/ABC',
        method: null,
        pageTitle: 'How do you want to set up the requirements for returns?',
        pageTitleCaption: 'Licence 01/ABC',
        sessionId: '61e07498-f309-4829-96a9-72084a54996d'
      })
    })
  })

  describe('the "backLink" property', () => {
    it('returns a link back to the "start-date" page', () => {
      const result = MethodPresenter(session)

      expect(result.backLink).toEqual({
        href: '/system/return-versions/setup/61e07498-f309-4829-96a9-72084a54996d/reason',
        text: 'Back'
      })
    })
  })

  describe('the "displayCopyExisting" property', () => {
    describe('when the licence version has copyable return versions (something to copy from)', () => {
      it('returns true', () => {
        const result = MethodPresenter(session)

        expect(result.displayCopyExisting).toBe(true)
      })
    })

    describe('when the licence version does not have copyable return versions (nothing to copy from)', () => {
      beforeEach(() => {
        session.licenceVersion.copyableReturnVersions = []
      })

      it('returns false', () => {
        const result = MethodPresenter(session)

        expect(result.displayCopyExisting).toBe(false)
      })
    })
  })

  describe('the "method" property', () => {
    describe('when the user has previously submitted a setup method', () => {
      beforeEach(() => {
        session.method = 'set-up-manually'
      })

      it('returns a populated method', () => {
        const result = MethodPresenter(session)

        expect(result.method).toEqual('set-up-manually')
      })
    })

    describe('when the user has not previously submitted a setup method', () => {
      it('returns an empty method', () => {
        const result = MethodPresenter(session)

        expect(result.method).toBeNull()
      })
    })
  })
})
