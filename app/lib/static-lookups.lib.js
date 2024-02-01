'use strict'

const billRunTypes = [
  'annual',
  'supplementary',
  'two_part_tariff'
]

const companyTypes = [
  'person',
  'organisation'
]

const contactTypes = [
  'person',
  'department'
]

const organisationTypes = [
  'individual',
  'limitedCompany',
  'limitedLiabilityPartnership',
  'publicLimitedCompany'
]

const sources = [
  'nald',
  'wrls'
]

const reasonNewRequirementsFields = [
  'abstraction_below_100_cubic_metres_per_day',
  'returns_exception',
  'transfer_licence'
]

const selectReasonFields = [
  'change_to_special_agreement',
  'name_or_address_change',
  'transfer_and_now_chargeable',
  'extension_of_licence_validity',
  'major_change',
  'minor_change',
  'new_licence_in_part_succession_or_licence_apportionment',
  'new_licence',
  'new_special_agreement',
  'succession_or_transfer_of_licence',
  'succession_to_remainder_licence_or_licence_apportionment'

]

module.exports = {
  billRunTypes,
  companyTypes,
  contactTypes,
  organisationTypes,
  reasonNewRequirementsFields,
  selectReasonFields,
  sources
}
