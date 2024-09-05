'use strict'

const data = [
  {
    id: '4e8ee7ee-ea1f-4966-a01c-372d8451ee44',
    description: 'Major change',
    triggersMinimumCharge: false,
    type: 'new_chargeable_charge_version',
    enabledForNewChargeVersions: true
  },
  {
    id: '5decf55d-4206-497c-bb33-afa5e2c5e78c',
    description: 'Minor change',
    triggersMinimumCharge: false,
    type: 'new_chargeable_charge_version',
    enabledForNewChargeVersions: true
  },
  {
    id: 'e327eb32-6680-445e-a4eb-ef5bf8c62c82',
    description: 'New special agreement',
    triggersMinimumCharge: false,
    type: 'new_chargeable_charge_version',
    enabledForNewChargeVersions: true
  },
  {
    id: '2cd3c47a-3284-47aa-94e6-61432d0c8ef7',
    description: 'Change to a special agreement',
    triggersMinimumCharge: false,
    type: 'new_chargeable_charge_version',
    enabledForNewChargeVersions: true
  },
  {
    id: 'e76e3c36-5e26-4af8-b258-fbc0993a656a',
    description: 'Licence holder name or address change',
    triggersMinimumCharge: false,
    type: 'new_chargeable_charge_version',
    enabledForNewChargeVersions: true
  },
  {
    id: 'c88af35e-7afd-4150-8eba-967c086b540a',
    description: 'Billing contact change',
    triggersMinimumCharge: false,
    type: 'new_chargeable_charge_version',
    enabledForNewChargeVersions: true
  },
  {
    id: '9fadddb6-e272-41e8-8f3c-757677f22c28',
    description: 'Limited extension of licence validity (LEV)',
    triggersMinimumCharge: false,
    type: 'new_chargeable_charge_version',
    enabledForNewChargeVersions: true
  },
  {
    id: 'a0d73154-23ce-40c4-ad8b-aa08ba49095f',
    description: 'Charge information cancelled before licence expiry date',
    triggersMinimumCharge: false,
    type: 'new_chargeable_charge_version',
    enabledForNewChargeVersions: true
  },
  {
    id: '65330ae7-80b0-4f1f-8898-87a92bcb3301',
    description: 'Succession or transfer of licence',
    triggersMinimumCharge: true,
    type: 'new_chargeable_charge_version',
    enabledForNewChargeVersions: true
  },
  {
    id: 'd6bd26d5-af97-4256-b483-09b150f47795',
    description: 'Succession to a remainder licence or licence apportionment',
    triggersMinimumCharge: true,
    type: 'new_chargeable_charge_version',
    enabledForNewChargeVersions: true
  },
  {
    id: 'f54e7435-b547-43d8-b984-af24ad5b3a62',
    description: 'New licence in part succession or licence apportionment',
    triggersMinimumCharge: true,
    type: 'new_chargeable_charge_version',
    enabledForNewChargeVersions: true
  },
  {
    id: 'd37dbced-348a-4e69-9018-8c52d7943632',
    description: 'New licence',
    triggersMinimumCharge: true,
    type: 'new_chargeable_charge_version',
    enabledForNewChargeVersions: true
  },
  {
    id: '5c1aad75-d40d-4492-9fa7-3ec7719f3d0d',
    description: 'Licence transferred and now chargeable',
    triggersMinimumCharge: true,
    type: 'new_chargeable_charge_version',
    enabledForNewChargeVersions: true
  },
  {
    id: '0cb79169-098b-4031-87c3-ebe8eab21e35',
    description: 'Held by Environment Agency',
    triggersMinimumCharge: false,
    type: 'new_non_chargeable_charge_version',
    enabledForNewChargeVersions: true
  },
  {
    id: '5f908870-813a-4c78-b69d-cc3244418d78',
    description: 'Aggregate licence',
    triggersMinimumCharge: false,
    type: 'new_non_chargeable_charge_version',
    enabledForNewChargeVersions: true
  },
  {
    id: '1055d6ad-bf1c-4cae-a966-847b67fecd01',
    description: 'Chloride content more than 8000 milligrams per litre',
    triggersMinimumCharge: false,
    type: 'new_non_chargeable_charge_version',
    enabledForNewChargeVersions: true
  },
  {
    id: '3098b9fb-f1d6-479e-adf7-6cf24f50222f',
    description: 'Abatement (S126)',
    triggersMinimumCharge: false,
    type: 'new_non_chargeable_charge_version',
    enabledForNewChargeVersions: true
  },
  {
    id: '2ec83d68-453a-4b1c-9370-87410b59a14b',
    description: 'Power generation less than 5 megawatts (S125)',
    triggersMinimumCharge: false,
    type: 'new_non_chargeable_charge_version',
    enabledForNewChargeVersions: true
  },
  {
    id: '362809bf-96c3-457d-90a3-19b5cf5e88b9',
    description: 'Temporary trade',
    triggersMinimumCharge: false,
    type: 'new_non_chargeable_charge_version',
    enabledForNewChargeVersions: true
  },
  {
    id: '74d96ebd-018d-4f64-a4e2-65c97825821e',
    description: 'Temporary type licence',
    triggersMinimumCharge: false,
    type: 'new_non_chargeable_charge_version',
    enabledForNewChargeVersions: true
  },
  {
    id: '7557c1e8-e342-4a62-bf3c-aa87a2865814',
    description: 'Transfer type licence',
    triggersMinimumCharge: false,
    type: 'new_non_chargeable_charge_version',
    enabledForNewChargeVersions: true
  },
  {
    id: 'ca51e7a2-340f-48d4-8ecb-f5d470e2a4d0',
    description: 'Shell licence ',
    triggersMinimumCharge: false,
    type: 'new_non_chargeable_charge_version',
    enabledForNewChargeVersions: true
  },
  {
    id: '9770b866-f32a-4b26-ad83-7f89c1e47d31',
    description: 'NALD gap',
    triggersMinimumCharge: false,
    type: 'new_non_chargeable_charge_version',
    enabledForNewChargeVersions: false
  },
  {
    id: 'f002cfd2-2ea5-483a-93e5-865a6aed9873',
    description: 'Licence revoked within a month of annual billing',
    triggersMinimumCharge: false,
    type: 'new_non_chargeable_charge_version',
    enabledForNewChargeVersions: true
  },
  {
    id: '620c85f1-14da-4549-b0d3-94293e657587',
    description: 'Strategic review of charges (SRoC)',
    triggersMinimumCharge: false,
    type: 'new_chargeable_charge_version',
    enabledForNewChargeVersions: true
  }
]

module.exports = {
  data
}
