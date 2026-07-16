// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Thing under test
import StartDatePresenter from '../../../../app/presenters/return-versions/setup/start-date.presenter.js'

describe('Return Versions Setup - Start Date presenter', () => {
  let session

  beforeEach(async () => {
    session = {
      id: '61e07498-f309-4829-96a9-72084a54996d',
      checkPageVisited: false,
      licence: {
        id: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
        currentVersionStartDate: '2023-01-01T00:00:00.000Z',
        endDate: null,
        licenceRef: '01/ABC',
        licenceHolder: 'Turbo Kid',
        startDate: '2022-04-01T00:00:00.000Z'
      },
      journey: 'returns-required',
      requirements: [{}]
    }
  })

  describe('when provided with a session', () => {
    it('correctly presents the data', () => {
      const result = StartDatePresenter(session)

      expect(result).toEqual({
        startDateDay: null,
        startDateMonth: null,
        startDateYear: null,
        backLink: {
          href: '/system/licences/8b7f78ba-f3ad-4cb6-a058-78abc4d1383d/set-up',
          text: 'Back'
        },
        licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
        licenceRef: '01/ABC',
        licenceVersionStartDate: '1 January 2023',
        pageTitle: 'Select the start date for the requirements for returns',
        pageTitleCaption: 'Licence 01/ABC',
        sessionId: '61e07498-f309-4829-96a9-72084a54996d',
        startDateOption: null
      })
    })
  })

  describe('the "backLink" property', () => {
    describe('when the user has come from the "check" page', () => {
      beforeEach(() => {
        session.checkPageVisited = true
      })

      it('returns a link back to the "check" page', () => {
        const result = StartDatePresenter(session)

        expect(result.backLink).toEqual({
          href: '/system/return-versions/setup/61e07498-f309-4829-96a9-72084a54996d/check',
          text: 'Back'
        })
      })
    })

    describe('when the user has come from somewhere else', () => {
      it("returns a link back to the licence page's charge tab", () => {
        const result = StartDatePresenter(session)

        expect(result.backLink).toEqual({
          href: '/system/licences/8b7f78ba-f3ad-4cb6-a058-78abc4d1383d/set-up',
          text: 'Back'
        })
      })
    })
  })

  describe('the "licenceVersionStartDate" property', () => {
    it('returns the licence start date in long date format', () => {
      const result = StartDatePresenter(session)

      expect(result.licenceVersionStartDate).toEqual('1 January 2023')
    })
  })

  describe('the "startDate" properties', () => {
    describe('when the user has previously selected the licence start date as the start date', () => {
      beforeEach(() => {
        session.startDateOptions = 'licenceStartDate'
      })

      it('returns the "startDateOption" property populated to re-select the option', () => {
        const result = StartDatePresenter(session)

        const { startDateDay, startDateMonth, startDateYear, startDateOption } = result

        expect(startDateDay).toBeNull()
        expect(startDateMonth).toBeNull()
        expect(startDateYear).toBeNull()
        expect(startDateOption).toEqual('licenceStartDate')
      })
    })

    describe('when the user has previously selected another date as the start date', () => {
      beforeEach(() => {
        session.startDateDay = '26'
        session.startDateMonth = '11'
        session.startDateYear = '2023'
        session.startDateOptions = 'anotherStartDate'
      })

      it('returns the properties needed to re-populate the fields', () => {
        const result = StartDatePresenter(session)

        const { startDateDay, startDateMonth, startDateYear, startDateOption } = result

        expect(startDateDay).toEqual('26')
        expect(startDateMonth).toEqual('11')
        expect(startDateYear).toEqual('2023')
        expect(startDateOption).toEqual('anotherStartDate')
      })
    })
  })
})
