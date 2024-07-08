'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const ViewPresenter = require('../../../app/presenters/return-requirements/view.presenter.js')

describe('Return Requirements - View presenter', () => {
  let requirement
  let requirementsForReturns
  let points
  let purposes

  beforeEach(() => {
    points = [
      {
        description: 'Midway River',
        ngr1: 'TQ 69212 50394',
        ngr2: null,
        ngr3: null,
        ngr4: null
      }
    ]

    purposes = [
      {
        id: '3675988f-076a-42af-8bcd-a7d53e78461c',
        purposeDetails: {
          description: 'Transfer Between Sources (Pre Water Act 2003)'
        }
      }
    ]

    requirement = {
      abstractionPeriodEndDay: 31,
      abstractionPeriodEndMonth: 3,
      abstractionPeriodStartDay: 1,
      abstractionPeriodStartMonth: 4,
      collectionFrequency: 'day',
      fiftySixException: false,
      gravityFill: true,
      id: '49a0aff3-268d-4b1d-870d-67acf3e3b0b5',
      legacyId: 12345,
      points,
      purposes,
      reabstraction: false,
      reportingFrequency: 'day',
      siteDescription: 'A place in the sun',
      summer: false,
      twoPartTariff: false
    }

    requirementsForReturns = {
      createdAt: new Date('2020-12-01'),
      id: '0d6f0f07-7d5c-48bf-90f0-d441680c3653',
      licence: {
        $licenceHolder: () => { return 'Martha Stuart' },
        id: 'c32ab7c6-e342-47b2-9c2e-d178ca89c5e5',
        licenceDocument: {
          id: '4391032d-7165-49ab-98cd-245ae8b8e10d',
          licenceDocumentRoles: []
        },
        licenceRef: '02/01'
      },
      multipleUpload: false,
      notes: 'A special note',
      reason: 'major-change',
      returnRequirements: [{ ...requirement }],
      startDate: new Date('2023-04-21'),
      status: 'current'
    }
  })

  describe('when provided with requirements for returns', () => {
    it('correctly presents the data', () => {
      const result = ViewPresenter.go(requirementsForReturns)

      expect(result).to.equal({
        additionalSubmissionOptions: {
          multipleUpload: 'No'
        },
        createdBy: 'Migrated from NALD',
        createdDate: '1 December 2020',
        licenceId: 'c32ab7c6-e342-47b2-9c2e-d178ca89c5e5',
        licenceRef: '02/01',
        notes: 'A special note',
        pageTitle: 'Check the requirements for returns for Martha Stuart',
        reason: 'Major change',
        requirements: [
          {
            abstractionPeriod: 'From 1 April to 31 March',
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
            returnsCycle: 'Winter and all year',
            siteDescription: 'A place in the sun',
            title: 'A place in the sun'
          }
        ],
        startDate: '21 April 2023',
        status: 'approved'
      })
    })

    describe('the "createdBy" property', () => {
      describe('and there is no user linked to the return', () => {
        it('returns "Migrated from NALD" ', () => {
          const result = ViewPresenter.go(requirementsForReturns)

          expect(result.createdBy).to.equal('Migrated from NALD')
        })
      })

      describe('and there is a user linked to the return', () => {
        beforeEach(() => {
          requirementsForReturns.user = { username: 'iron@man.net' }
        })

        it('returns the users username', () => {
          const result = ViewPresenter.go(requirementsForReturns)

          expect(result.createdBy).to.equal('iron@man.net')
        })
      })
    })

    describe('the "createdDate" property', () => {
      it('returns created date', () => {
        const result = ViewPresenter.go(requirementsForReturns)

        expect(result.createdDate).to.equal('1 December 2020')
      })
    })

    describe('the "notes" property', () => {
      it('returns notes', () => {
        const result = ViewPresenter.go(requirementsForReturns)

        expect(result.notes).to.equal('A special note')
      })
    })

    describe('the "reason" property', () => {
      describe('and a reason', () => {
        it('returns the formatted reason', () => {
          const result = ViewPresenter.go(requirementsForReturns)

          expect(result.reason).to.equal('Major change')
        })
      })

      describe('and no reason', () => {
        beforeEach(() => {
          requirementsForReturns.reason = null
        })

        it('correctly defaults reason to an empty string', () => {
          const result = ViewPresenter.go(requirementsForReturns)

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
          const result = ViewPresenter.go(requirementsForReturns)

          expect(result.additionalSubmissionOptions.multipleUpload).to.equal('Yes')
        })
      })

      describe('when multipleUpload is false', () => {
        it('returns "No"', () => {
          const result = ViewPresenter.go(requirementsForReturns)

          expect(result.additionalSubmissionOptions.multipleUpload).to.equal('No')
        })
      })
    })

    describe('the "requirements" property', () => {
      it('correctly returns the requirement', () => {
        const result = ViewPresenter.go(requirementsForReturns)

        expect(result.requirements).to.equal([{
          abstractionPeriod: 'From 1 April to 31 March',
          agreementsExceptions: 'Gravity fill',
          frequencyCollected: 'daily',
          frequencyReported: 'daily',
          points: [
            'At National Grid Reference TQ 69212 50394 (Midway River)'
          ],
          purposes: [
            'Transfer Between Sources (Pre Water Act 2003)'
          ],
          returnsCycle: 'Winter and all year',
          returnReference: 12345,
          siteDescription: 'A place in the sun',
          title: 'A place in the sun'
        }])
      })

      it('returns the purposes descriptions', () => {
        const result = ViewPresenter.go(requirementsForReturns)

        expect(result.requirements[0].purposes).to.equal(['Transfer Between Sources (Pre Water Act 2003)'])
      })

      it('maps the selected points to the abstraction point details format', () => {
        const result = ViewPresenter.go(requirementsForReturns)

        expect(result.requirements[0].points).to.equal(['At National Grid Reference TQ 69212 50394 (Midway River)'])
      })

      describe('and the return cycle is', () => {
        describe('Summer', () => {
          beforeEach(() => {
            requirementsForReturns.returnRequirements = [{ ...requirement, summer: true }]
          })

          it('should return the text for a summer return cycle', () => {
            const result = ViewPresenter.go(requirementsForReturns)

            expect(result.requirements[0].returnsCycle).to.equal('Summer')
          })
        })

        describe('Winter and all year', () => {
          it('should return the text for a Winter and all year return cycle', () => {
            const result = ViewPresenter.go(requirementsForReturns)

            expect(result.requirements[0].returnsCycle).to.equal('Winter and all year')
          })
        })
      })

      describe('and the agreement exceptions', () => {
        describe('is "none"', () => {
          beforeEach(() => {
            requirementsForReturns.returnRequirements = [{
              ...requirement,
              fiftySixException: false,
              gravityFill: false,
              reabstraction: false,
              twoPartTariff: false
            }]
          })

          it('should return "None"', () => {
            const result = ViewPresenter.go(requirementsForReturns)

            expect(result.requirements[0].agreementsExceptions).to.equal('None')
          })
        })

        describe('has one exception', () => {
          it('should return the exception as "Gravity fill"', () => {
            const result = ViewPresenter.go(requirementsForReturns)

            expect(result.requirements[0].agreementsExceptions).to.equal('Gravity fill')
          })
        })

        describe('has two exceptions', () => {
          beforeEach(() => {
            requirementsForReturns.returnRequirements = [{
              ...requirement,
              fiftySixException: false,
              gravityFill: true,
              reabstraction: true,
              twoPartTariff: false
            }]
          })

          it('should return the exceptions as "Gravity fill and Transfer re-abstraction scheme"', () => {
            const result = ViewPresenter.go(requirementsForReturns)

            expect(result.requirements[0].agreementsExceptions).to.equal('Gravity fill and Transfer re-abstraction scheme')
          })
        })

        describe('has more than two exceptions', () => {
          beforeEach(() => {
            requirementsForReturns.returnRequirements = [
              {
                ...requirement,
                fiftySixException: true,
                gravityFill: true,
                reabstraction: true,
                twoPartTariff: true
              }]
          })

          it('should return the exceptions as "Gravity fill, Transfer re-abstraction scheme, Two-part tariff, and 56 returns exception"', () => {
            const result = ViewPresenter.go(requirementsForReturns)

            expect(result.requirements[0].agreementsExceptions).to.equal('Gravity fill, Transfer re-abstraction scheme, Two-part tariff, and 56 returns exception')
          })
        })
      })

      describe('the "pageTitle" property', () => {
        it('correctly formats the licence holder name in the title', () => {
          const result = ViewPresenter.go(requirementsForReturns)

          expect(result.pageTitle).to.equal('Check the requirements for returns for Martha Stuart')
        })
      })

      describe('and there are no return requirements', () => {
        beforeEach(() => {
          requirementsForReturns.returnRequirements = []
        })

        it('should return an empty array', () => {
          const result = ViewPresenter.go(requirementsForReturns)

          expect(result.requirements).to.equal([])
        })
      })
    })
  })
})
