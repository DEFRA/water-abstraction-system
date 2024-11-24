'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const ViewLicenceReturnsPresenter = require('../../../app/presenters/licences/view-licence-returns.presenter.js')

describe('View Licence returns presenter', () => {
  let auth
  let returnLogs
  let hasRequirements

  beforeEach(() => {
    auth = {
      isValid: true,
      credentials: {
        user: { id: 123 },
        roles: ['returns'],
        groups: [],
        scope: ['returns'],
        permissions: { abstractionReform: false, billRuns: true, manage: true }
      }
    }

    hasRequirements = true
    returnLogs = _returnLogs()
  })

  describe('when provided with returns data', () => {
    it('correctly presents the data', () => {
      const result = ViewLicenceReturnsPresenter.go(returnLogs, hasRequirements, auth)

      expect(result).to.equal({
        noReturnsMessage: null,
        returns: [
          {
            dates: '2 January 2020 to 1 February 2020',
            description: 'empty description',
            dueDate: '28 November 2012',
            link: '/returns/return?id=v1:1:01/123:10046821:2020-01-02:2020-02-01',
            purpose: 'SPRAY IRRIGATION',
            reference: '10046821',
            returnLogId: 'v1:1:01/123:10046821:2020-01-02:2020-02-01',
            status: 'complete'
          },
          {
            dates: '2 January 2020 to 1 February 2020',
            description: 'empty description',
            dueDate: '28 November 2012',
            link: '/return/internal?returnId=v1:1:01/123:10046820:2020-01-02:2020-02-01',
            purpose: 'SPRAY IRRIGATION',
            reference: '10046820',
            returnLogId: 'v1:1:01/123:10046820:2020-01-02:2020-02-01',
            status: 'overdue'
          }
        ]
      })
    })

    describe('the "dates" property', () => {
      it('returns the start and end date in long format (2 January 2020 to 1 February 2020)', () => {
        const result = ViewLicenceReturnsPresenter.go(returnLogs, hasRequirements, auth)

        expect(result.returns[0].dates).to.equal('2 January 2020 to 1 February 2020')
      })
    })

    describe('the "description" property', () => {
      describe('when description in the metadata is set', () => {
        it('returns an empty string', () => {
          const result = ViewLicenceReturnsPresenter.go(returnLogs, hasRequirements, auth)

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
          const result = ViewLicenceReturnsPresenter.go(returnLogs, hasRequirements, auth)

          expect(result.returns[0].description).to.equal('')
        })
      })
    })

    describe('the "link" property', () => {
      describe('when the return log has a status of "completed"', () => {
        it('returns a link to the view return log page', () => {
          const result = ViewLicenceReturnsPresenter.go(returnLogs, hasRequirements, auth)

          expect(result.returns[0].link).to.equal('/returns/return?id=v1:1:01/123:10046821:2020-01-02:2020-02-01')
        })
      })

      describe('when the return log has a status of "due"', () => {
        describe('and the user is permitted to submit and edit returns', () => {
          it('returns a link to the edit return log page', () => {
            const result = ViewLicenceReturnsPresenter.go(returnLogs, hasRequirements, auth)

            expect(result.returns[1].link).to.equal(
              '/return/internal?returnId=v1:1:01/123:10046820:2020-01-02:2020-02-01'
            )
          })
        })

        describe('and the user is not permitted to submit and edit returns', () => {
          beforeEach(() => {
            auth.credentials.scope = []
          })

          it('returns null', () => {
            const result = ViewLicenceReturnsPresenter.go(returnLogs, hasRequirements, auth)

            expect(result.returns[1].link).to.be.null()
          })
        })
      })

      describe('when the return log has a status of "received"', () => {
        beforeEach(() => {
          returnLogs[1].status = 'received'
        })

        describe('and the user is permitted to submit and edit returns', () => {
          it('returns a link to the edit return log page', () => {
            const result = ViewLicenceReturnsPresenter.go(returnLogs, hasRequirements, auth)

            expect(result.returns[1].link).to.equal(
              '/return/internal?returnId=v1:1:01/123:10046820:2020-01-02:2020-02-01'
            )
          })
        })

        describe('and the user is not permitted to submit and edit returns', () => {
          beforeEach(() => {
            auth.credentials.scope = []
          })

          it('returns null', () => {
            const result = ViewLicenceReturnsPresenter.go(returnLogs, hasRequirements, auth)

            expect(result.returns[1].link).to.be.null()
          })
        })
      })

      describe('when the return log has a status of "void"', () => {
        beforeEach(() => {
          returnLogs[1].status = 'void'
        })

        it('returns a link to the view return log page', () => {
          const result = ViewLicenceReturnsPresenter.go(returnLogs, hasRequirements, auth)

          expect(result.returns[1].link).to.equal('/returns/return?id=v1:1:01/123:10046820:2020-01-02:2020-02-01')
        })
      })
    })

    describe('the "purpose" property', () => {
      describe("when the first purpose in the return log's metadata does not have an alias", () => {
        it("returns the purpose's tertiary description", () => {
          const result = ViewLicenceReturnsPresenter.go(returnLogs, hasRequirements, auth)

          expect(result.returns[1].purpose).to.equal('SPRAY IRRIGATION')
        })
      })

      describe("when the first purpose in the return log's metadata is has an alias", () => {
        beforeEach(() => {
          returnLogs[1].metadata.purposes[0].alias = 'Spray irrigation - top field only'
        })

        it("returns the purpose's alias", () => {
          const result = ViewLicenceReturnsPresenter.go(returnLogs, hasRequirements, auth)

          expect(result.returns[1].purpose).to.equal('Spray irrigation - top field only')
        })
      })
    })

    describe('the "status" property', () => {
      describe('when the return log has a status of "completed"', () => {
        it('returns "complete"', () => {
          const result = ViewLicenceReturnsPresenter.go(returnLogs, hasRequirements, auth)

          expect(result.returns[0].status).to.equal('complete')
        })
      })

      describe('when the return log has a status of "due"', () => {
        describe('and the due date is less than today', () => {
          it('returns "overdue"', () => {
            const result = ViewLicenceReturnsPresenter.go(returnLogs, hasRequirements, auth)

            expect(result.returns[1].status).to.equal('overdue')
          })
        })

        describe('and the due date is equal to or greater than today', () => {
          beforeEach(() => {
            returnLogs[1].dueDate = new Date()
            returnLogs[1].dueDate.setHours(0, 0, 0, 0)
          })

          it('returns "due"', () => {
            const result = ViewLicenceReturnsPresenter.go(returnLogs, hasRequirements, auth)

            expect(result.returns[1].status).to.equal('due')
          })
        })
      })

      describe('when the return log has a status of "received"', () => {
        beforeEach(() => {
          returnLogs[1].status = 'received'
        })

        it('returns "received"', () => {
          const result = ViewLicenceReturnsPresenter.go(returnLogs, hasRequirements, auth)

          expect(result.returns[1].status).to.equal('received')
        })
      })

      describe('when the return log has a status of "void"', () => {
        beforeEach(() => {
          returnLogs[1].status = 'void'
        })

        it('returns "void"', () => {
          const result = ViewLicenceReturnsPresenter.go(returnLogs, hasRequirements, auth)

          expect(result.returns[1].status).to.equal('void')
        })
      })
    })
  })

  describe('the "noReturnsMessage" property', () => {
    describe('when a licence has returns and requirements', () => {
      it('returns null', () => {
        const result = ViewLicenceReturnsPresenter.go(returnLogs, hasRequirements, auth)

        expect(result.noReturnsMessage).to.be.null()
      })
    })

    describe('when a licence has NO requirements and NO returns', () => {
      beforeEach(() => {
        returnLogs = []
        hasRequirements = false
      })

      it('returns the message "No requirements for returns have been set up for this licence."', () => {
        const result = ViewLicenceReturnsPresenter.go(returnLogs, hasRequirements, auth)

        expect(result.noReturnsMessage).to.equal('No requirements for returns have been set up for this licence.')
      })
    })

    describe('when a licence has requirements but NO returns', () => {
      beforeEach(() => {
        returnLogs = []
      })

      it('returns the message "No returns for this licence."', () => {
        const result = ViewLicenceReturnsPresenter.go(returnLogs, hasRequirements, auth)

        expect(result.noReturnsMessage).to.equal('No returns for this licence.')
      })
    })
  })
})

function _returnLogs() {
  const returnLog = {
    id: 'v1:1:01/123:10046821:2020-01-02:2020-02-01',
    dueDate: new Date('2012-11-28'),
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
    returnReference: '10046821'
  }

  return [
    { ...returnLog },
    {
      ...returnLog,
      id: 'v1:1:01/123:10046820:2020-01-02:2020-02-01',
      status: 'due',
      returnReference: '10046820'
    }
  ]
}
