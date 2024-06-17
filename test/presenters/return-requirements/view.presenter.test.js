'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const ViewPresenter = require('../../../app/presenters/return-requirements/view.presenter.js')

describe('Return Requirements - View presenter', () => {
  let points
  let requirement
  let requirementsForReturns

  beforeEach(() => {
    requirement = {
      abstractionPeriod: {
        'end-abstraction-period-day': '01',
        'end-abstraction-period-month': '03',
        'start-abstraction-period-day': '01',
        'start-abstraction-period-month': '06'
      },
      agreementsExceptions: [
        'gravity-fill'
      ],
      frequencyCollected: 'daily',
      frequencyReported: 'daily',
      legacyId: 12345,
      points: [
        '286'
      ],
      purposes: [
        'Transfer Between Sources (Pre Water Act 2003)'
      ],
      returnsCycle: 'summer',
      siteDescription: 'A place in the sun'
    }

    requirementsForReturns = {
      id: '0d6f0f07-7d5c-48bf-90f0-d441680c3653',
      licence: {
        id: 'c32ab7c6-e342-47b2-9c2e-d178ca89c5e5',
        licenceRef: '02/01',
        $licenceHolder: () => { return 'Martha Stuart' },
        licenceDocument: {
          id: '4391032d-7165-49ab-98cd-245ae8b8e10d',
          licenceDocumentRoles: []
        }
      },
      multipleUpload: false,
      reason: 'major-change',
      returnRequirements: [{ ...requirement }],
      startDate: new Date('2023-04-21'),
      status: 'current'
    }

    points = [
      {
        ID: '286',
        LOCAL_NAME: 'Midway River',
        NGR1_EAST: '69212',
        NGR1_NORTH: '50394',
        NGR1_SHEET: 'TQ'
      }
    ]
  })

  describe('when provided with requirements for returns', () => {
    it('correctly presents the data', () => {
      const result = ViewPresenter.go(requirementsForReturns, points)

      expect(result).to.equal({
        additionalSubmissionOptions: {
          multipleUpload: 'No'
        },
        licenceId: 'c32ab7c6-e342-47b2-9c2e-d178ca89c5e5',
        licenceRef: '02/01',
        pageTitle: 'Check the requirements for returns for Martha Stuart',
        reason: 'Major change',
        requirements: [
          {
            abstractionPeriod: 'From 1 June to 1 March',
            agreementsExceptions: 'Gravity fill',
            frequencyCollected: 'daily',
            frequencyReported: 'daily',
            points: [
              'At National Grid Reference TQ 69212 50394 (Midway River)'
            ],
            purposes: [
              'Transfer Between Sources (Pre Water Act 2003)'
            ],
            returnReference: 12345,
            returnsCycle: 'Summer',
            siteDescription: 'A place in the sun',
            title: 'Transfer Between Sources (Pre Water Act 2003), A place in the sun'
          }
        ],
        startDate: '21 April 2023',
        status: 'approved'
      })
    })

    describe('the "reason" property', () => {
      describe('and a reason', () => {
        it('returns the formatted reason', () => {
          const result = ViewPresenter.go(requirementsForReturns, points)

          expect(result.reason).to.equal('Major change')
        })
      })

      describe('and no reason', () => {
        beforeEach(() => {
          requirementsForReturns.reason = null
        })

        it('correctly defaults reason to an empty string', () => {
          const result = ViewPresenter.go(requirementsForReturns, points)

          expect(result.reason).to.equal('')
        })
      })
    })

    describe('the "additionalSubmissionOptions" property', () => {
      describe('when multipleUpload is true', () => {
        beforeEach(() => {
          requirementsForReturns.multipleUpload = true
        })

        it('returns "Yes"', () => {
          const result = ViewPresenter.go(requirementsForReturns, points)

          expect(result.additionalSubmissionOptions.multipleUpload).to.equal('Yes')
        })
      })

      describe('when multipleUpload is false', () => {
        it('returns "No"', () => {
          const result = ViewPresenter.go(requirementsForReturns, points)

          expect(result.additionalSubmissionOptions.multipleUpload).to.equal('No')
        })
      })
    })

    describe("the 'requirements' property", () => {
      it('correctly returns the requirement', () => {
        const result = ViewPresenter.go(requirementsForReturns, points)

        expect(result.requirements).to.equal([{
          abstractionPeriod: 'From 1 June to 1 March',
          agreementsExceptions: 'Gravity fill',
          frequencyCollected: 'daily',
          frequencyReported: 'daily',
          points: [
            'At National Grid Reference TQ 69212 50394 (Midway River)'
          ],
          purposes: [
            'Transfer Between Sources (Pre Water Act 2003)'
          ],
          returnsCycle: 'Summer',
          returnReference: 12345,
          siteDescription: 'A place in the sun',
          title: 'Transfer Between Sources (Pre Water Act 2003), A place in the sun'
        }
        ])
      })

      it('returns the purpose descriptions', () => {
        const result = ViewPresenter.go(requirementsForReturns, points)

        expect(result.requirements[0].purposes).to.equal(['Transfer Between Sources (Pre Water Act 2003)'])
      })

      it('maps the selected points to the abstraction point details format', () => {
        const result = ViewPresenter.go(requirementsForReturns, points)

        expect(result.requirements[0].points).to.equal(['At National Grid Reference TQ 69212 50394 (Midway River)'])
      })

      describe('and the return cycle is', () => {
        describe('Summer', () => {
          it('should return the text for a summer return cycle', () => {
            const result = ViewPresenter.go(requirementsForReturns, points)

            expect(result.requirements[0].returnsCycle).to.equal('Summer')
          })
        })

        describe('Winter and all year', () => {
          beforeEach(() => {
            requirementsForReturns.returnRequirements = [{ ...requirement, returnsCycle: 'winter-and-all-year' }]
          })

          it('should return the text for a Winter and all year return cycle', () => {
            const result = ViewPresenter.go(requirementsForReturns, points)

            expect(result.requirements[0].returnsCycle).to.equal('Winter and all year')
          })
        })
      })

      describe('and the agreement exceptions', () => {
        describe('is "none"', () => {
          beforeEach(() => {
            requirementsForReturns.returnRequirements = [{ ...requirement, agreementsExceptions: ['none'] }]
          })

          it('should return "None"', () => {
            const result = ViewPresenter.go(requirementsForReturns, points)

            expect(result.requirements[0].agreementsExceptions).to.equal('None')
          })
        })

        describe('has one exception', () => {
          it('should return the exception as "Gravity fill"', () => {
            const result = ViewPresenter.go(requirementsForReturns, points)

            expect(result.requirements[0].agreementsExceptions).to.equal('Gravity fill')
          })
        })

        describe('has two exceptions', () => {
          beforeEach(() => {
            requirementsForReturns.returnRequirements = [{ ...requirement, agreementsExceptions: ['gravity-fill', 'transfer-re-abstraction-scheme'] }]
          })

          it('should return the exceptions as "Gravity fill and Transfer re-abstraction scheme"', () => {
            const result = ViewPresenter.go(requirementsForReturns, points)

            expect(result.requirements[0].agreementsExceptions).to.equal('Gravity fill and Transfer re-abstraction scheme')
          })
        })

        describe('has more than two exceptions', () => {
          beforeEach(() => {
            requirementsForReturns.returnRequirements = [
              {
                ...requirement,
                agreementsExceptions:
                    ['gravity-fill', 'transfer-re-abstraction-scheme', 'two-part-tariff', '56-returns-exception']
              }]
          })

          it('should return the exceptions as "Gravity fill, Transfer re-abstraction scheme, Two-part tariff, and 56 returns exception"', () => {
            const result = ViewPresenter.go(requirementsForReturns, points)

            expect(result.requirements[0].agreementsExceptions).to.equal('Gravity fill, Transfer re-abstraction scheme, Two-part tariff, and 56 returns exception')
          })
        })
      })

      describe('the "pageTitle" property', () => {
        it('correctly formats the licence holder name in the title', () => {
          const result = ViewPresenter.go(requirementsForReturns, points)

          expect(result.pageTitle).to.equal('Check the requirements for returns for Martha Stuart')
        })
      })
    })
  })
})
