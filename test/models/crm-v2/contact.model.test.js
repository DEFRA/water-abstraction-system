'use strict'

// Test helpers
const ContactHelper = require('../../support/helpers/crm-v2/contact.helper.js')
const InvoiceAccountAddressHelper = require('../../support/helpers/crm-v2/invoice-account-address.helper.js')
const InvoiceAccountAddressModel = require('../../../app/models/crm-v2/invoice-account-address.model.js')

// Thing under test
const ContactModel = require('../../../app/models/crm-v2/contact.model.js')

describe('Contact model', () => {
  let testInvoiceAccountAddresses
  let testRecord

  beforeEach(async () => {
    testRecord = await ContactHelper.add()
    testInvoiceAccountAddresses = []

    const { contactId } = testRecord

    for (let i = 0; i < 2; i++) {
      // NOTE: A constraint in the invoice_account_addresses table means you cannot have 2 records with the same
      // invoiceAccountId and start date
      const startDate = i === 0 ? new Date(2023, 8, 4) : new Date(2023, 8, 3)
      const invoiceAccountAddress = await InvoiceAccountAddressHelper.add({ startDate, contactId })
      testInvoiceAccountAddresses.push(invoiceAccountAddress)
    }
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await ContactModel.query().findById(testRecord.contactId)

      expect(result).toBeInstanceOf(ContactModel)
      expect(result.contactId).toBe(testRecord.contactId)
    })
  })

  describe('Relationships', () => {
    describe('when linking to invoice account addresses', () => {
      it('can successfully run a related query', async () => {
        const query = await ContactModel.query()
          .innerJoinRelated('invoiceAccountAddresses')

        expect(query).toBeTruthy()
      })

      it('can eager load the invoice account addresses', async () => {
        const result = await ContactModel.query()
          .findById(testRecord.contactId)
          .withGraphFetched('invoiceAccountAddresses')

        expect(result).toBeInstanceOf(ContactModel)
        expect(result.contactId).toBe(testRecord.contactId)

        expect(result.invoiceAccountAddresses).toBeInstanceOf(Array)
        expect(result.invoiceAccountAddresses[0]).toBeInstanceOf(InvoiceAccountAddressModel)
        expect(result.invoiceAccountAddresses).toContainEqual(testInvoiceAccountAddresses[0])
        expect(result.invoiceAccountAddresses).toContainEqual(testInvoiceAccountAddresses[1])
      })
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

          expect(testRecord.$name()).toBe('Villar')
        })

        describe("and the salutation 'Mrs'", () => {
          beforeEach(() => {
            contactRecord.salutation = 'Mrs'
          })

          it("returns 'Mrs Villar'", () => {
            testRecord = ContactModel.fromJson(contactRecord)

            expect(testRecord.$name()).toBe('Mrs Villar')
          })

          describe("and the initial 'J'", () => {
            beforeEach(() => {
              contactRecord.initials = 'J'
            })

            it("returns 'Mrs J Villar'", () => {
              testRecord = ContactModel.fromJson(contactRecord)

              expect(testRecord.$name()).toBe('Mrs J Villar')
            })
          })
        })

        describe("and a first name of 'Margherita'", () => {
          beforeEach(() => {
            contactRecord.firstName = 'Margherita'
          })

          it("returns 'Margherita Villar'", () => {
            testRecord = ContactModel.fromJson(contactRecord)

            expect(testRecord.$name()).toBe('Margherita Villar')
          })

          describe("and the salutation 'Mrs'", () => {
            beforeEach(() => {
              contactRecord.salutation = 'Mrs'
            })

            it("returns 'Mrs Margherita Villar'", () => {
              testRecord = ContactModel.fromJson(contactRecord)

              expect(testRecord.$name()).toBe('Mrs Margherita Villar')
            })

            describe("and the initial 'J'", () => {
              beforeEach(() => {
                contactRecord.initials = 'J'
              })

              it("returns 'Mrs J Villar'", () => {
                testRecord = ContactModel.fromJson(contactRecord)

                expect(testRecord.$name()).toBe('Mrs J Villar')
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

          expect(testRecord.$name()).toBe('Humanoid Risk Assessment')
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

            expect(testRecord.$name()).toBe('Vincent Anderson')
          })
        })

        describe("and the salutation 'Mr'", () => {
          beforeEach(() => {
            contactRecord.salutation = 'Mr'
          })

          it("returns 'Mr Vincent Anderson'", () => {
            testRecord = ContactModel.fromJson(contactRecord)

            expect(testRecord.$name()).toBe('Mr Vincent Anderson')
          })

          describe("and the middle initial 'P'", () => {
            beforeEach(() => {
              contactRecord.middleInitials = 'P'
            })

            it("returns 'Mr V P Anderson'", () => {
              testRecord = ContactModel.fromJson(contactRecord)

              expect(testRecord.$name()).toBe('Mr V P Anderson')
            })

            describe("and the suffix 'MBE'", () => {
              beforeEach(() => {
                contactRecord.suffix = 'MBE'
              })

              it("returns 'Mr V P Anderson MBE'", () => {
                testRecord = ContactModel.fromJson(contactRecord)

                expect(testRecord.$name()).toBe('Mr V P Anderson MBE')
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

            expect(testRecord.$name()).toBe('V P Anderson')
          })

          describe("and the suffix 'MBE'", () => {
            beforeEach(() => {
              contactRecord.suffix = 'MBE'
            })

            it("returns 'V P Anderson MBE'", () => {
              testRecord = ContactModel.fromJson(contactRecord)

              expect(testRecord.$name()).toBe('V P Anderson MBE')
            })
          })
        })
      })
    })
  })
})
