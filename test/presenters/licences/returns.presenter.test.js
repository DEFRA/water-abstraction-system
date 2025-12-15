'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateLicenceRef } = require('../../support/helpers/licence.helper.js')

// Thing under test
const ReturnsPresenter = require('../../../app/presenters/licences/returns.presenter.js')

describe('Licences - Returns presenter', () => {
  let returnLogs
  let hasRequirements
  let licence
  let paginationTotal

  beforeEach(() => {
    paginationTotal = 1
    hasRequirements = true
    returnLogs = _returnLogs()

    licence = {
      licenceRef: generateLicenceRef()
    }
  })

  describe('when provided with returns data', () => {
    it('correctly presents the data', () => {
      const result = ReturnsPresenter.go(returnLogs, hasRequirements, licence, paginationTotal)

      expect(result).to.equal({
        backLink: {
          text: 'Go back to search',
          href: '/licences'
        },
        noReturnsMessage: null,
        pageTitle: 'Returns',
        pageTitleCaption: `Licence ${licence.licenceRef}`,
        returns: [
          {
            dates: '2 January 2020 to 1 February 2020',
            description: 'empty description',
            dueDate: '28 November 2020',
            link: '/system/return-logs/c4458436-4766-4271-b978-6af7a0e4fd95',
            purpose: ['Spray Irrigation - Direct (SPRAY IRRIGATION)'],
            reference: '10046821',
            status: 'complete'
          },
          {
            dates: '2 January 2020 to 1 February 2020',
            description: 'empty description',
            dueDate: '28 November 2020',
            link: '/system/return-logs/2e35c9c6-5017-46ea-8fa8-8960dc1a8ae7',
            purpose: ['Spray Irrigation - Direct (SPRAY IRRIGATION)'],
            reference: '10046820',
            status: 'overdue'
          }
        ],
        tableCaption: 'Showing all 1 returns'
      })
    })

    describe('the "dates" property', () => {
      it('returns the start and end date in long format (2 January 2020 to 1 February 2020)', () => {
        const result = ReturnsPresenter.go(returnLogs, hasRequirements, licence, paginationTotal)

        expect(result.returns[0].dates).to.equal('2 January 2020 to 1 February 2020')
      })
    })

    describe('the "description" property', () => {
      describe('when description in the metadata is set', () => {
        it('returns an empty string', () => {
          const result = ReturnsPresenter.go(returnLogs, hasRequirements, licence, paginationTotal)

          expect(result.returns[0].description).to.equal('empty description')
        })
      })

      describe('when description in the metadata is "null"', () => {
        beforeEach(() => {
          // NOTE: water-abstraction-import sets the value to 'null' rather than null when it imports the return log
          // from NALD
          returnLogs[0].metadata.description = 'null'
        })

        it('returns an empty string', () => {
          const result = ReturnsPresenter.go(returnLogs, hasRequirements, licence, paginationTotal)

          expect(result.returns[0].description).to.equal('')
        })
      })
    })

    describe('the "dueDate" property', () => {
      describe('when the due date is set', () => {
        it('returns the formatted due date', () => {
          const result = ReturnsPresenter.go(returnLogs, hasRequirements, licence, paginationTotal)

          expect(result.returns[0].dueDate).to.equal('28 November 2020')
        })
      })

      describe('when the due date is "null"', () => {
        beforeEach(() => {
          returnLogs[0].dueDate = null
        })

        it('returns an empty string', () => {
          const result = ReturnsPresenter.go(returnLogs, hasRequirements, licence, paginationTotal)

          expect(result.returns[0].dueDate).to.equal('')
        })
      })
    })

    describe('the "tableCaption" property', () => {
      describe('when the total returns is not over the "defaultPageSize"', () => {
        it('returns the table caption', () => {
          const result = ReturnsPresenter.go(returnLogs, hasRequirements, licence, paginationTotal)

          expect(result.tableCaption).to.equal('Showing all 1 returns')
        })
      })

      describe('when the total returns is over the "defaultPageSize"', () => {
        beforeEach(() => {
          paginationTotal = 30
        })

        it('returns the table caption', () => {
          const result = ReturnsPresenter.go(returnLogs, hasRequirements, licence, paginationTotal)

          expect(result.tableCaption).to.equal('Showing 2 of 30 returns')
        })
      })
    })
  })

  describe('the "noReturnsMessage" property', () => {
    describe('when a licence has returns and requirements', () => {
      it('returns null', () => {
        const result = ReturnsPresenter.go(returnLogs, hasRequirements, licence, paginationTotal)

        expect(result.noReturnsMessage).to.be.null()
      })
    })

    describe('when a licence has NO requirements and NO returns', () => {
      beforeEach(() => {
        returnLogs = []
        hasRequirements = false
      })

      it('returns the message "No requirements for returns have been set up for this licence."', () => {
        const result = ReturnsPresenter.go(returnLogs, hasRequirements, licence, paginationTotal)

        expect(result.noReturnsMessage).to.equal('No requirements for returns have been set up for this licence.')
      })
    })

    describe('when a licence has requirements but NO returns', () => {
      beforeEach(() => {
        returnLogs = []
      })

      it('returns the message "No returns for this licence."', () => {
        const result = ReturnsPresenter.go(returnLogs, hasRequirements, licence, paginationTotal)

        expect(result.noReturnsMessage).to.equal('No returns for this licence.')
      })
    })
  })
})

function _returnLogs() {
  const returnLog = {
    id: 'v1:1:01/123:10046821:2020-01-02:2020-02-01',
    dueDate: new Date('2020-11-28'),
    status: 'completed',
    startDate: new Date('2020/01/02'),
    endDate: new Date('2020/02/01'),
    metadata: {
      purposes: [
        {
          alias: 'SPRAY IRRIGATION',
          primary: {
            code: 'A',
            description: 'Agriculture'
          },
          tertiary: {
            code: '400',
            description: 'Spray Irrigation - Direct'
          },
          secondary: {
            code: 'AGR',
            description: 'General Agriculture'
          }
        }
      ],
      description: 'empty description'
    },
    returnId: 'c4458436-4766-4271-b978-6af7a0e4fd95',
    returnReference: '10046821'
  }

  return [
    { ...returnLog },
    {
      ...returnLog,
      id: 'v1:1:01/123:10046820:2020-01-02:2020-02-01',
      status: 'due',
      returnId: '2e35c9c6-5017-46ea-8fa8-8960dc1a8ae7',
      returnReference: '10046820'
    }
  ]
}
