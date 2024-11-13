'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const DetermineLicenceIssuesService = require('../../../../app/services/bill-runs/match/determine-licence-issues.service.js')

describe('Determine Licence Issues Service', () => {
  describe('when given a licence', () => {
    let licence

    describe('that has multiple "ready" issues', () => {
      beforeEach(() => {
        licence = _generateMultipleReadyIssuesLicenceData()
      })

      describe('on the licence', () => {
        it('sets "issues" to a comma separated unique list in alphabetical order of the issues found', () => {
          DetermineLicenceIssuesService.go(licence)

          expect(licence.issues).to.equal([
            'Abstraction outside period',
            'Multiple issues',
            'No returns received',
            'Over abstraction',
            'Returns received late',
            'Some returns not received'
          ])
        })

        it('sets the status of the licence to "ready"', () => {
          DetermineLicenceIssuesService.go(licence)

          expect(licence.status).to.equal('ready')
        })
      })
    })

    describe('that has multiple "review" issues', () => {
      beforeEach(() => {
        licence = _generateMultipleReviewIssuesLicenceData()
      })

      describe('on the licence', () => {
        it('sets "issues" to a comma separated unique list in alphabetical order of the issues found', () => {
          DetermineLicenceIssuesService.go(licence)

          expect(licence.issues).to.equal([
            'Aggregate',
            'Checking query',
            'Multiple issues',
            'Overlap of charge dates',
            'Return split over charge references',
            'Returns received but not processed',
            'Unable to match return'
          ])
        })

        it('sets the status of the licence to "review"', () => {
          DetermineLicenceIssuesService.go(licence)

          expect(licence.status).to.equal('review')
        })
      })
    })

    describe('that has multiple "ready" and "review" issues', () => {
      beforeEach(() => {
        licence = _generateMultipleIssuesLicenceData()
      })

      describe('on the licence', () => {
        it('sets "issues" to a comma separated unique list in alphabetical order of the issues found', () => {
          DetermineLicenceIssuesService.go(licence)

          expect(licence.issues).to.equal([
            'Abstraction outside period',
            'Aggregate',
            'Checking query',
            'Multiple issues',
            'No returns received',
            'Over abstraction',
            'Overlap of charge dates',
            'Return split over charge references',
            'Returns received but not processed',
            'Returns received late',
            'Some returns not received',
            'Unable to match return'
          ])
        })

        it('sets the status of the licence to "review"', () => {
          DetermineLicenceIssuesService.go(licence)

          expect(licence.status).to.equal('review')
        })
      })

      describe('on the returns', () => {
        it('sets all the issues on the returns object', () => {
          DetermineLicenceIssuesService.go(licence)

          expect(licence.returnLogs[0].issues).to.equal(['Abstraction outside period', 'Checking query', 'Over abstraction', 'Returns received late', 'Return split over charge references'])
          expect(licence.returnLogs[1].issues).to.equal(['No returns received'])
          expect(licence.returnLogs[2].issues).to.equal(['Returns received but not processed'])
        })
      })

      describe('on the charge elements', () => {
        it('sets all the issues on the element object', () => {
          DetermineLicenceIssuesService.go(licence)

          expect(licence.chargeVersions[0].chargeReferences[0].chargeElements[0].issues).to.equal(['Aggregate', 'Overlap of charge dates', 'Some returns not received'])
          expect(licence.chargeVersions[0].chargeReferences[0].chargeElements[1].issues).to.equal(['Aggregate', 'Unable to match return'])
        })

        it('sets the status of the charge element to "review"', () => {
          DetermineLicenceIssuesService.go(licence)

          expect(licence.chargeVersions[0].chargeReferences[0].chargeElements[0].status).to.equal('review')
        })
      })
    })

    describe('with a charge element', () => {
      beforeEach(() => {
        licence = _generateNoIssuesLicenceData()
        licence.returnLogs[0].status = 'due'
      })

      describe('that has one matching return', () => {
        describe('and the return status is "due"', () => {
          it('sets the issue "No returns received" on the charge element', () => {
            DetermineLicenceIssuesService.go(licence)

            expect(licence.chargeVersions[0].chargeReferences[0].chargeElements[0].issues).to.equal(['No returns received'])
          })
        })
      })

      describe('that has two matching returns', () => {
        beforeEach(() => {
          licence.chargeVersions[0].chargeReferences[0].chargeElements[0].returnLogs[1] = { returnId: '2345' }
          licence.returnLogs[1] = {
            id: '2345',
            abstractionOutsidePeriod: false,
            underQuery: false,
            status: 'completed',
            quantity: 1,
            allocatedQuantity: 1,
            receivedDate: new Date('2024 01 01'),
            dueDate: new Date('2024 01 01')
          }
        })

        describe('one with a return status of "due"', () => {
          beforeEach(() => {
            licence.returnLogs[1].status = 'completed'
          })

          it('sets the issue "Some returns not received" on the charge element', () => {
            DetermineLicenceIssuesService.go(licence)

            expect(licence.chargeVersions[0].chargeReferences[0].chargeElements[0].issues).to.equal(['Some returns not received'])
          })
        })

        describe('both with a return status of "due"', () => {
          beforeEach(() => {
            licence.returnLogs[1].status = 'due'
          })

          it('sets the issue "No returns received" on the charge element', () => {
            DetermineLicenceIssuesService.go(licence)

            expect(licence.chargeVersions[0].chargeReferences[0].chargeElements[0].issues).to.equal(['No returns received'])
          })
        })
      })
    })

    describe('that has 1 issue on the returns', () => {
      describe('and the issues is a "review" status', () => {
        // Note: a licence can't have 1 issue on a charge element as the only issue on the element that is not a
        // 'Review' status is `Some returns not received`. This is when a return has a status of `due`, and if this
        // issue is present then the return will have an issue of `No returns received`, making the total issues on the
        // licence 2 and not 1
        beforeEach(() => {
          licence = _generateOneIssueLicenceData('review')
        })

        it('sets the status on the licence to "review"', () => {
          DetermineLicenceIssuesService.go(licence)

          expect(licence.status).to.equal('review')
        })

        it('sets the status on the element to "ready"', () => {
          DetermineLicenceIssuesService.go(licence)

          expect(licence.chargeVersions[0].chargeReferences[0].chargeElements[0].status).to.equal('ready')
        })
      })

      describe('and the issues is a "ready" status', () => {
        beforeEach(() => {
          licence = _generateOneIssueLicenceData('ready')
        })

        it('sets the status on the licence to "ready"', () => {
          DetermineLicenceIssuesService.go(licence)

          expect(licence.status).to.equal('ready')
        })

        it('sets the status on the element to "ready"', () => {
          DetermineLicenceIssuesService.go(licence)

          expect(licence.chargeVersions[0].chargeReferences[0].chargeElements[0].status).to.equal('ready')
        })
      })
    })

    describe('that has no issues', () => {
      beforeEach(() => {
        licence = _generateNoIssuesLicenceData()
      })

      it('sets the licence status as "ready"', () => {
        DetermineLicenceIssuesService.go(licence)

        expect(licence.status).to.equal('ready')
      })

      it('sets the element status as "ready"', () => {
        DetermineLicenceIssuesService.go(licence)

        expect(licence.chargeVersions[0].chargeReferences[0].chargeElements[0].status).to.equal('ready')
      })
    })
  })
})

function _generateNoIssuesLicenceData () {
  return {
    chargeVersions: [
      {
        chargeReferences: [
          {
            aggregate: 1,
            chargeElements: [
              {
                chargeDatesOverlap: false,
                returnLogs: [
                  {
                    returnId: '1234'
                  }
                ]
              }
            ]
          }
        ]
      }
    ],
    returnLogs: [
      {
        id: '1234',
        abstractionOutsidePeriod: false,
        underQuery: false,
        status: 'completed',
        quantity: 1,
        allocatedQuantity: 1,
        receivedDate: new Date('2024 01 01'),
        dueDate: new Date('2024 01 01')
      }
    ]
  }
}

function _generateOneIssueLicenceData (status) {
  if (status === 'review') {
    return {
      chargeVersions: [
        {
          chargeReferences: [
            {
              aggregate: 1,
              chargeElements: [
                {
                  chargeDatesOverlap: false,
                  returnLogs: [
                    {
                      returnId: '1234'
                    }
                  ]
                }
              ]
            }
          ]
        }
      ],
      returnLogs: [
        {
          id: '1234',
          abstractionOutsidePeriod: false,
          underQuery: true,
          status: 'completed',
          quantity: 1,
          allocatedQuantity: 1,
          receivedDate: new Date('2024 01 01'),
          dueDate: new Date('2024 01 01')
        }
      ]
    }
  } else {
    return {
      chargeVersions: [
        {
          chargeReferences: [
            {
              aggregate: 1,
              chargeElements: [
                {
                  chargeDatesOverlap: false,
                  returnLogs: [
                    {
                      returnId: '1234'
                    }
                  ]
                }
              ]
            }
          ]
        }
      ],
      returnLogs: [
        {
          id: '1234',
          abstractionOutsidePeriod: false,
          underQuery: false,
          status: 'completed',
          quantity: 1,
          allocatedQuantity: 0,
          receivedDate: new Date('2024 01 01'),
          dueDate: new Date('2024 01 01')
        }
      ]
    }
  }
}

function _generateMultipleIssuesLicenceData () {
  return {
    chargeVersions: [
      {
        chargeReferences: [
          {
            aggregate: 1.25,
            chargeElements: [
              {
                chargeDatesOverlap: true,
                returnLogs: [
                  {
                    returnId: '1234'
                  },
                  {
                    returnId: '5678'
                  }
                ]
              },
              {
                chargeDatesOverlap: false,
                returnLogs: []
              }
            ]
          },
          {
            aggregate: 1.25,
            chargeElements: [
              {
                chargeDatesOverlap: false,
                returnLogs: [
                  {
                    returnId: '1234'
                  }
                ]
              }
            ]
          }
        ]
      }
    ],
    returnLogs: [
      {
        id: '1234',
        abstractionOutsidePeriod: true,
        underQuery: true,
        status: 'completed',
        quantity: 1,
        allocatedQuantity: 0,
        receivedDate: new Date('2024 02 01'),
        dueDate: new Date('2024 01 01')
      },
      {
        id: '5678',
        abstractionOutsidePeriod: false,
        underQuery: false,
        status: 'due',
        quantity: 0,
        allocatedQuantity: 0,
        receivedDate: null,
        dueDate: new Date('2024 01 01')
      },
      {
        id: '91011',
        abstractionOutsidePeriod: false,
        underQuery: false,
        status: 'received',
        quantity: 0,
        allocatedQuantity: 0,
        receivedDate: new Date('2024 01 01'),
        dueDate: new Date('2024 01 01')
      }
    ]
  }
}

function _generateMultipleReadyIssuesLicenceData () {
  return {
    chargeVersions: [
      {
        chargeReferences: [
          {
            aggregate: 1,
            chargeElements: [
              {
                chargeDatesOverlap: false,
                returnLogs: [
                  {
                    returnId: '1234'
                  },
                  {
                    returnId: '5678'
                  }
                ]
              }
            ]
          }
        ]
      }
    ],
    returnLogs: [
      {
        id: '1234',
        abstractionOutsidePeriod: true,
        underQuery: false,
        status: 'completed',
        quantity: 1,
        allocatedQuantity: 0,
        receivedDate: new Date('2024 02 01'),
        dueDate: new Date('2024 01 01')
      },
      {
        id: '5678',
        abstractionOutsidePeriod: false,
        underQuery: false,
        status: 'due',
        quantity: 0,
        allocatedQuantity: 0,
        receivedDate: null,
        dueDate: new Date('2024 01 01')
      }
    ]
  }
}

function _generateMultipleReviewIssuesLicenceData () {
  return {
    chargeVersions: [
      {
        chargeReferences: [
          {
            aggregate: 1.25,
            chargeElements: [
              {
                chargeDatesOverlap: true,
                returnLogs: [
                  {
                    returnId: '1234'
                  }
                ]
              },
              {
                chargeDatesOverlap: false,
                returnLogs: []
              }
            ]
          },
          {
            aggregate: 1.25,
            chargeElements: [
              {
                chargeDatesOverlap: false,
                returnLogs: [
                  {
                    returnId: '1234'
                  }
                ]
              }
            ]
          }
        ]
      }
    ],
    returnLogs: [
      {
        id: '1234',
        abstractionOutsidePeriod: false,
        underQuery: true,
        status: 'completed',
        quantity: 0,
        allocatedQuantity: 0,
        receivedDate: new Date('2024 01 01'),
        dueDate: new Date('2024 01 01')
      },
      {
        id: '91011',
        abstractionOutsidePeriod: false,
        underQuery: false,
        status: 'received',
        quantity: 0,
        allocatedQuantity: 0,
        receivedDate: new Date('2024 01 01'),
        dueDate: new Date('2024 01 01')
      }
    ]
  }
}
