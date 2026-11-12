// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Thing under test
import ExistingPresenter from '../../../../src/presenters/return-versions/setup/existing.presenter.js'

describe('Return Versions - Setup - Existing presenter', () => {
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
        startDate: '2022-04-01T00:00:00.000Z'
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
      reason: 'major-change',
      requirements: [{}],
      returnVersionStartDate: '2023-01-01T00:00:00.000Z',
      startDateOptions: 'licenceStartDate'
    }
  })

  describe('when provided with a session', () => {
    it('correctly presents the data', () => {
      const result = ExistingPresenter(session)

      expect(result).toEqual({
        backLink: {
          href: '/system/return-versions/setup/61e07498-f309-4829-96a9-72084a54996d/method',
          text: 'Back'
        },
        existingOptions: [{ text: '1 January 2023', value: '60b5d10d-1372-4fb2-b222-bfac81da69ab' }],
        licenceRef: '01/ABC',
        pageTitle: 'Use previous requirements for returns',
        pageTitleCaption: 'Licence 01/ABC',
        sessionId: '61e07498-f309-4829-96a9-72084a54996d'
      })
    })
  })

  describe('the "backLink" property', () => {
    it('returns a link back to the "setup" page', () => {
      const result = ExistingPresenter(session)

      expect(result.backLink).toEqual({
        href: '/system/return-versions/setup/61e07498-f309-4829-96a9-72084a54996d/method',
        text: 'Back'
      })
    })
  })

  describe('the "existingOptions" property', () => {
    describe('when the return versions do not contain a "reason"', () => {
      describe('and do not contain any mod logs', () => {
        it('returns the version ID as the option value and just the start date as the option text', () => {
          const result = ExistingPresenter(session)

          expect(result.existingOptions).toEqual([
            { text: '1 January 2023', value: '60b5d10d-1372-4fb2-b222-bfac81da69ab' }
          ])
        })
      })

      describe('but do contain mod logs', () => {
        describe('but the first entry does not have a reason', () => {
          beforeEach(() => {
            session.licenceVersion.copyableReturnVersions[0].modLogs.push({ reasonDescription: null })
          })

          it('returns the version ID as the option value and just the start date as the option text', () => {
            const result = ExistingPresenter(session)

            expect(result.existingOptions).toEqual([
              { text: '1 January 2023', value: '60b5d10d-1372-4fb2-b222-bfac81da69ab' }
            ])
          })
        })

        describe('and the first entry does have a reason', () => {
          beforeEach(() => {
            session.licenceVersion.copyableReturnVersions[0].modLogs.push({
              reasonDescription: 'Record Loaded During Migration'
            })
          })

          it('returns the version ID as the option value and the start date and reason as the option text', () => {
            const result = ExistingPresenter(session)

            expect(result.existingOptions).toEqual([
              { text: '1 January 2023 - Record Loaded During Migration', value: '60b5d10d-1372-4fb2-b222-bfac81da69ab' }
            ])
          })
        })
      })
    })

    describe('when the return versions contain a "reason"', () => {
      beforeEach(() => {
        session.licenceVersion.copyableReturnVersions.unshift({
          id: '22ecef19-3a13-44a0-a55e-8f4d34dd59a5',
          reason: 'major-change',
          startDate: '2024-05-07T00:00:00.000Z'
        })
      })

      it('returns the version ID as the option value and the start date and reason as the option text', () => {
        const result = ExistingPresenter(session)

        expect(result.existingOptions).toEqual([
          { text: '7 May 2024 - Major change', value: '22ecef19-3a13-44a0-a55e-8f4d34dd59a5' },
          { text: '1 January 2023', value: '60b5d10d-1372-4fb2-b222-bfac81da69ab' }
        ])
      })
    })
  })
})
