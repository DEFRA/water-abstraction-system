'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const CheckPresenter = require('../../../app/presenters/return-requirements/check.presenter.js')

describe('Return Requirements - Check presenter', () => {
  let session
  let requirement

  beforeEach(() => {
    requirement = {
      points: [
        '286'
      ],
      purposes: [
        '772136d1-9184-417b-90cd-91053287d1df'
      ],
      returnsCycle: 'summer',
      siteDescription: 'A place in the sun',
      abstractionPeriod: {
        'end-abstraction-period-day': '01',
        'end-abstraction-period-month': '03',
        'start-abstraction-period-day': '01',
        'start-abstraction-period-month': '06'
      },
      frequencyReported: 'daily',
      frequencyCollected: 'daily',
      agreementsExceptions: [
        'gravity-fill'
      ]
    }

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
      requirements: [{ ...requirement }],
      startDateOptions: 'licenceStartDate',
      reason: 'major-change'
    }
  })

  describe('when provided with a session', () => {
    it('correctly presents the data', () => {
      const result = CheckPresenter.go(session)

      expect(result).to.equal({
        additionalSubmissionOptions: [],
        journey: 'returns-required',
        licenceRef: '01/ABC',
        note: null,
        pageTitle: 'Check the return requirements for Turbo Kid',
        reason: 'Major change',
        reasonLink: '/system/return-requirements/61e07498-f309-4829-96a9-72084a54996d/reason',
        requirements: [{
          abstractionPeriod: 'From 1 June to 1 March',
          frequencyCollected: 'daily',
          frequencyReported: 'daily',
          index: 0,
          purposes: 'purpose',
          siteDescription: 'A place in the sun'
        }],
        sessionId: '61e07498-f309-4829-96a9-72084a54996d',
        startDate: '1 January 2023',
        userEmail: 'No notes added'
      })
    })
  })

  describe("the 'additionalSubmissionOptions' property", () => {
    describe('when the user has checked additionalSubmissionOptions', () => {
      beforeEach(() => {
        session.additionalSubmissionOptions = ['multiple-upload']
      })

      it('returns a checked option', () => {
        const result = CheckPresenter.go(session)

        expect(result.additionalSubmissionOptions).to.include('multiple-upload')
      })
    })

    describe('when the user has not checked an option', () => {
      it('returns no options', () => {
        const result = CheckPresenter.go(session)

        expect(result.additionalSubmissionOptions).to.be.empty()
      })
    })
  })

  describe("the 'note' property", () => {
    describe('when the user has added a note', () => {
      beforeEach(() => {
        session.note = {
          content: 'Note attached to requirement',
          userEmail: 'carol.shaw@atari.com'
        }
      })

      it('returns a populated note', () => {
        const result = CheckPresenter.go(session)

        expect(result.note).to.equal('Note attached to requirement')
      })
    })

    describe('when the user has not added a note', () => {
      it('returns an empty note', () => {
        const result = CheckPresenter.go(session)

        expect(result.note).to.be.null()
      })
    })
  })

  describe("the 'pageTitle' property", () => {
    it('returns the page title combined with the licence holder name', () => {
      const result = CheckPresenter.go(session)

      expect(result.pageTitle).to.equal('Check the return requirements for Turbo Kid')
    })
  })

  describe("the 'reason' property", () => {
    it('returns the display version for the reason', () => {
      const result = CheckPresenter.go(session)

      expect(result.reason).to.equal('Major change')
    })
  })

  describe("the 'reasonLink' property", () => {
    describe('when the journey is for returns required', () => {
      it("returns a link to the 'reason' page", () => {
        const result = CheckPresenter.go(session)

        expect(result.reasonLink).to.equal('/system/return-requirements/61e07498-f309-4829-96a9-72084a54996d/reason')
      })
    })

    describe('when the journey is for no returns required', () => {
      beforeEach(() => {
        session.journey = 'no-returns-required'
      })

      it("returns a link to the 'no-returns-required' page", () => {
        const result = CheckPresenter.go(session)

        expect(result.reasonLink).to.equal('/system/return-requirements/61e07498-f309-4829-96a9-72084a54996d/no-returns-required')
      })
    })
  })

  describe("the 'startDate' property", () => {
    describe('when the user has previously selected the licence start date as the start date', () => {
      it('returns the licence version start date formatted as a long date', () => {
        const result = CheckPresenter.go(session)

        expect(result.startDate).to.equal('1 January 2023')
      })
    })

    describe('when the user has previously selected another date as the start date', () => {
      beforeEach(() => {
        session.startDateDay = '26'
        session.startDateMonth = '11'
        session.startDateYear = '2023'
        session.startDateOptions = 'anotherStartDate'
      })

      it('returns the start date parts formatted as a long date', () => {
        const result = CheckPresenter.go(session)

        expect(result.startDate).to.equal('26 November 2023')
      })
    })
  })

  describe("the 'userEmail' property", () => {
    describe('when the user has added a note', () => {
      beforeEach(() => {
        session.note = {
          content: 'Note attached to requirement',
          status: 'Added',
          userEmail: 'carol.shaw@atari.com'
        }
      })

      it("returns a the user's email address", () => {
        const result = CheckPresenter.go(session)

        expect(result.userEmail).to.equal('carol.shaw@atari.com')
      })
    })

    describe('when the user has not added a note', () => {
      it("returns the message 'no notes added'", () => {
        const result = CheckPresenter.go(session)

        expect(result.userEmail).to.equal('No notes added')
      })
    })
  })

  describe("the 'requirements' property", () => {
    describe('when the requirement has agreements exceptions', () => {
      it('correctly returns and requirement with agreements exceptions', () => {
        const result = CheckPresenter.go(session)

        expect(result.requirements).to.equal([{
          abstractionPeriod: 'From 1 June to 1 March',
          frequencyCollected: 'daily',
          frequencyReported: 'daily',
          index: 0,
          purposes: 'purpose',
          siteDescription: 'A place in the sun'
        }
        ])
      })
    })
    describe('when the requirement does not have any agreements exceptions', () => {
      beforeEach(() => {
        delete session.requirements[0].agreementsExceptions
      })

      it('correctly does not return the requirement', () => {
        const result = CheckPresenter.go(session)

        expect(result.requirements).to.equal([])
      })
    })
  })
})
