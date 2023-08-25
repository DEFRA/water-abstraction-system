'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const ContactHelper = require('../../support/helpers/crm-v2/contact.helper.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')

// Thing under test
const ContactModel = require('../../../app/models/crm-v2/contact.model.js')

describe('Contact model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseHelper.clean()

    testRecord = await ContactHelper.add()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await ContactModel.query().findById(testRecord.contactId)

      expect(result).to.be.an.instanceOf(ContactModel)
      expect(result.contactId).to.equal(testRecord.contactId)
    })
  })

  // NOTE: The test data we generate in these tests is in accordance with how a contact record could be populated. For
  // example, if the data source is 'wrls' and the contact type is 'person', then first name and last name is always
  // populated. We don't test what would happen if last name wasn't because analysis of the data confirms this would
  // never happen. See the method's documentation for more details.
  describe('$name', () => {
    let contactRecord

    beforeEach(() => {
      contactRecord = {
        contactType: null,
        dataSource: null,
        department: null,
        firstName: null,
        initials: null,
        lastName: null,
        middleInitials: null,
        salutation: null,
        suffix: null
      }
    })

    describe('when the contact was imported in NALD', () => {
      beforeEach(() => {
        contactRecord.dataSource = 'nald'
      })

      describe("and has a last name of 'Villar'", () => {
        beforeEach(() => {
          contactRecord.lastName = 'Villar'
        })

        it("returns 'Villar'", () => {
          testRecord = ContactModel.fromJson(contactRecord)

          expect(testRecord.$name()).to.equal('Villar')
        })

        describe("and the salutation 'Mrs'", () => {
          beforeEach(() => {
            contactRecord.salutation = 'Mrs'
          })

          it("returns 'Mrs Villar'", () => {
            testRecord = ContactModel.fromJson(contactRecord)

            expect(testRecord.$name()).to.equal('Mrs Villar')
          })

          describe("and the initial 'J'", () => {
            beforeEach(() => {
              contactRecord.initials = 'J'
            })

            it("returns 'Mrs J Villar'", () => {
              testRecord = ContactModel.fromJson(contactRecord)

              expect(testRecord.$name()).to.equal('Mrs J Villar')
            })
          })
        })

        describe("and a first name of 'Margherita'", () => {
          beforeEach(() => {
            contactRecord.firstName = 'Margherita'
          })

          it("returns 'Margherita Villar'", () => {
            testRecord = ContactModel.fromJson(contactRecord)

            expect(testRecord.$name()).to.equal('Margherita Villar')
          })

          describe("and the salutation 'Mrs'", () => {
            beforeEach(() => {
              contactRecord.salutation = 'Mrs'
            })

            it("returns 'Mrs Margherita Villar'", () => {
              testRecord = ContactModel.fromJson(contactRecord)

              expect(testRecord.$name()).to.equal('Mrs Margherita Villar')
            })

            describe("and the initial 'J'", () => {
              beforeEach(() => {
                contactRecord.initials = 'J'
              })

              it("returns 'Mrs J Villar'", () => {
                testRecord = ContactModel.fromJson(contactRecord)

                expect(testRecord.$name()).to.equal('Mrs J Villar')
              })
            })
          })
        })
      })
    })

    describe('when the contact was entered into WRLS', () => {
      beforeEach(() => {
        contactRecord.dataSource = 'wrls'
      })

      describe("and it is a department named 'Humanoid Risk Assessment'", () => {
        beforeEach(() => {
          contactRecord.contactType = 'department'
          contactRecord.department = 'Humanoid Risk Assessment'
        })

        it("returns 'Humanoid Risk Assessment'", () => {
          testRecord = ContactModel.fromJson(contactRecord)

          expect(testRecord.$name()).to.equal('Humanoid Risk Assessment')
        })
      })

      describe("and it is a 'person'", () => {
        beforeEach(() => {
          contactRecord.contactType = 'person'
          contactRecord.firstName = 'Vincent'
          contactRecord.lastName = 'Anderson'
        })

        describe("with the name 'Vincent Anderson'", () => {
          it("returns 'Vincent Anderson'", () => {
            testRecord = ContactModel.fromJson(contactRecord)

            expect(testRecord.$name()).to.equal('Vincent Anderson')
          })
        })

        describe("and the salutation 'Mr'", () => {
          beforeEach(() => {
            contactRecord.salutation = 'Mr'
          })

          it("returns 'Mr Vincent Anderson'", () => {
            testRecord = ContactModel.fromJson(contactRecord)

            expect(testRecord.$name()).to.equal('Mr Vincent Anderson')
          })

          describe("and the middle initial 'P'", () => {
            beforeEach(() => {
              contactRecord.middleInitials = 'P'
            })

            it("returns 'Mr V P Anderson'", () => {
              testRecord = ContactModel.fromJson(contactRecord)

              expect(testRecord.$name()).to.equal('Mr V P Anderson')
            })

            describe("and the suffix 'MBE'", () => {
              beforeEach(() => {
                contactRecord.suffix = 'MBE'
              })

              it("returns 'Mr V P Anderson MBE'", () => {
                testRecord = ContactModel.fromJson(contactRecord)

                expect(testRecord.$name()).to.equal('Mr V P Anderson MBE')
              })
            })
          })
        })

        describe("and the middle initial 'P'", () => {
          beforeEach(() => {
            contactRecord.middleInitials = 'P'
          })

          it("returns 'V P Anderson'", () => {
            testRecord = ContactModel.fromJson(contactRecord)

            expect(testRecord.$name()).to.equal('V P Anderson')
          })

          describe("and the suffix 'MBE'", () => {
            beforeEach(() => {
              contactRecord.suffix = 'MBE'
            })

            it("returns 'V P Anderson MBE'", () => {
              testRecord = ContactModel.fromJson(contactRecord)

              expect(testRecord.$name()).to.equal('V P Anderson MBE')
            })
          })
        })
      })
    })
  })
})
