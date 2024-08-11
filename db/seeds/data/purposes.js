'use strict'

const data = [
  {
    id: '64b8e40e-0d13-401e-90e1-0e498cda9fcb',
    legacyId: '10',
    description: 'Animal Watering & General Use In Non Farming Situations',
    lossFactor: 'medium',
    twoPartTariff: false
  },
  {
    id: '59492ab7-a1a2-4cb3-b483-0dd6f9e45aec',
    legacyId: '20',
    description: 'Boiler Feed',
    lossFactor: 'medium',
    twoPartTariff: false
  },
  {
    id: '464c1270-aa9a-48d9-9e96-2744d374f56c',
    legacyId: '30',
    description: 'Conveying Materials',
    lossFactor: 'medium',
    twoPartTariff: false
  },
  {
    id: '7fb06487-8abc-4642-9ce5-80116b98ae12',
    legacyId: '40',
    description: 'Drinking, Cooking, Sanitary, Washing, (Small Garden) - Commercial/Industrial/Public Services',
    lossFactor: 'medium',
    twoPartTariff: false
  },
  {
    id: 'dc0a1059-f6a9-4432-8408-fa32df710196',
    legacyId: '50',
    description: 'Drinking, Cooking, Sanitary, Washing, (Small Garden) - Household',
    lossFactor: 'medium',
    twoPartTariff: false
  },
  {
    id: '8b17770a-ced1-475e-b0e2-ba4f3ebe262e',
    legacyId: '60',
    description: 'Dust Suppression',
    lossFactor: 'high',
    twoPartTariff: false
  },
  {
    id: '0b65dc1a-8a40-453e-9a20-9a18acd19dc3',
    legacyId: '70',
    description: 'Effluent/Slurry Dilution',
    lossFactor: 'very low',
    twoPartTariff: false
  },
  {
    id: '4e6d0ad8-7203-46f2-8d77-12110c85c3f8',
    legacyId: '80',
    description: 'Evaporative Cooling',
    lossFactor: 'high',
    twoPartTariff: false
  },
  {
    id: 'a6dcf24c-7751-4f88-b772-af8c485b7f27',
    legacyId: '90',
    description: 'Fish Farm/Cress Pond Throughflow',
    lossFactor: 'very low',
    twoPartTariff: false
  },
  {
    id: '92b555f8-ae9e-4257-bda2-87776a81c207',
    legacyId: '100',
    description: 'Fish Pass/Canoe Pass',
    lossFactor: 'very low',
    twoPartTariff: false
  },
  {
    id: '9d9d9528-a992-424f-bdf4-f867d5639ea0',
    legacyId: '110',
    description: 'Gas Suppression/Scrubbing',
    lossFactor: 'medium',
    twoPartTariff: false
  },
  {
    id: '06615efb-b13b-4d16-957c-6ab6cb779417',
    legacyId: '120',
    description: 'General Cooling (Existing Licences Only) (High Loss)',
    lossFactor: 'high',
    twoPartTariff: false
  },
  {
    id: '6506f380-ca07-4fe0-aa10-bf17252cb065',
    legacyId: '130',
    description: 'General Cooling (Existing Licences Only) (Low Loss)',
    lossFactor: 'low',
    twoPartTariff: false
  },
  {
    id: '289d1644-5215-4a20-af9e-5664fa9a18c7',
    legacyId: '140',
    description: 'General Farming & Domestic',
    lossFactor: 'medium',
    twoPartTariff: false
  },
  {
    id: '019f30ab-ea80-48cf-a5fc-0b0642cef4d5',
    legacyId: '150',
    description: 'General Use Relating To Secondary Category (High Loss)',
    lossFactor: 'high',
    twoPartTariff: false
  },
  {
    id: 'f48f5c29-8231-4552-bb98-3f04234ca6cb',
    legacyId: '160',
    description: 'General Use Relating To Secondary Category (Medium Loss)',
    lossFactor: 'medium',
    twoPartTariff: false
  },
  {
    id: '8eff7b9a-7f62-40bc-8a86-91d38ed61b9a',
    legacyId: '170',
    description: 'General Use Relating To Secondary Category (Low Loss)',
    lossFactor: 'low',
    twoPartTariff: false
  },
  {
    id: '73e8a003-279b-49a2-839b-adf9daae5e9a',
    legacyId: '180',
    description: 'General Use Relating To Secondary Category (Very Low Loss)',
    lossFactor: 'very low',
    twoPartTariff: false
  },
  {
    id: 'e08d935b-2870-42ad-84c0-68103671d617',
    legacyId: '190',
    description: 'General Washing/Process Washing',
    lossFactor: 'medium',
    twoPartTariff: false
  },
  {
    id: 'b18e9132-0efd-43e4-a318-b2e060f8bfb3',
    legacyId: '200',
    description: 'Heat Pump',
    lossFactor: 'very low',
    twoPartTariff: false
  },
  {
    id: '3cd7606f-ffd1-4ae6-82a1-d76ea5261321',
    legacyId: '210',
    description: 'Horticultural Watering',
    lossFactor: 'medium',
    twoPartTariff: false
  },
  {
    id: '60ab5147-577a-4722-b77f-0c6558b16817',
    legacyId: '220',
    description: 'Hydraulic Rams',
    lossFactor: 'very low',
    twoPartTariff: false
  },
  {
    id: '7fa8eadc-ccfe-4a9d-b91f-0fecd8209140',
    legacyId: '230',
    description: 'Hydraulic Testing',
    lossFactor: 'very low',
    twoPartTariff: false
  },
  {
    id: '54fc8048-733a-4f50-bd12-cc9f66da2c9b',
    legacyId: '240',
    description: 'Hydroelectric Power Generation',
    lossFactor: 'very low',
    twoPartTariff: false
  },
  {
    id: '8a9f62ab-781f-4003-846a-b47f1b189fe7',
    legacyId: '250',
    description: 'Lake & Pond Throughflow',
    lossFactor: 'very low',
    twoPartTariff: false
  },
  {
    id: '8780c9d2-cb49-4ffa-b846-09380adf278e',
    legacyId: '260',
    description: 'Large Garden Watering',
    lossFactor: 'medium',
    twoPartTariff: false
  },
  {
    id: 'aa510d6e-f145-494b-918f-13b8b5500788',
    legacyId: '270',
    description: 'Laundry Use',
    lossFactor: 'medium',
    twoPartTariff: false
  },
  {
    id: '681795bb-cf19-4b02-9fb0-e86b69b721e9',
    legacyId: '280',
    description: 'Make-Up Or Top Up Water',
    lossFactor: 'high',
    twoPartTariff: false
  },
  {
    id: 'c0392edc-31aa-4f02-817d-4bde8c8d22a2',
    legacyId: '290',
    description: 'Milling & Water Power Other Than Electricity Generation',
    lossFactor: 'very low',
    twoPartTariff: false
  },
  {
    id: 'ccb4cf71-028d-4567-80ec-e860cab7cd47',
    legacyId: '300',
    description: 'Mineral Washing',
    lossFactor: 'low',
    twoPartTariff: false
  },
  {
    id: '09af974e-5162-41fd-b963-b97eb30fd084',
    legacyId: '310',
    description: 'Non-Evaporative Cooling',
    lossFactor: 'low',
    twoPartTariff: false
  },
  {
    id: 'bd6d01a8-0d3a-4cc8-a56e-150a524e2956',
    legacyId: '320',
    description: 'Pollution Remediation',
    lossFactor: 'very low',
    twoPartTariff: false
  },
  {
    id: '772136d1-9184-417b-90cd-91053287d1df',
    legacyId: '330',
    description: 'Potable Water Supply - Direct',
    lossFactor: 'medium',
    twoPartTariff: false
  },
  {
    id: 'd45eb987-5f6d-48a7-9130-c2f0de0573c0',
    legacyId: '340',
    description: 'Potable Water Supply - Storage',
    lossFactor: 'medium',
    twoPartTariff: false
  },
  {
    id: '2688807a-ee41-4f17-bcf2-816f3afa72dd',
    legacyId: '350',
    description: 'Process Water',
    lossFactor: 'medium',
    twoPartTariff: false
  },
  {
    id: '286c222c-cf21-4103-9135-a22c1cf0cead',
    legacyId: '360',
    description: 'Raw Water Supply',
    lossFactor: 'medium',
    twoPartTariff: false
  },
  {
    id: '7c4681d6-61e8-478f-97e0-90e0b22c0edd',
    legacyId: '370',
    description: 'River Recirculation',
    lossFactor: 'very low',
    twoPartTariff: false
  },
  {
    id: 'a52dc94a-964a-47ac-b55a-2ef07aca7087',
    legacyId: '380',
    description: 'Spray Irrigation - Anti Frost',
    lossFactor: 'medium',
    twoPartTariff: true
  },
  {
    id: '23f1626c-0afa-4a1d-86ae-3bc985049e03',
    legacyId: '390',
    description: 'Spray Irrigation - Anti Frost Storage',
    lossFactor: 'medium',
    twoPartTariff: true
  },
  {
    id: '4ad11971-be6a-4da5-af04-563c76205b0e',
    legacyId: '400',
    description: 'Spray Irrigation - Direct',
    lossFactor: 'high',
    twoPartTariff: true
  },
  {
    id: 'a3424107-ef96-47ac-be76-a8b86de3271a',
    legacyId: '410',
    description: 'Spray Irrigation - Spray Irrigation Definition Order',
    lossFactor: 'high',
    twoPartTariff: true
  },
  {
    id: 'da576426-70bc-4f76-b05b-849bba48a8e8',
    legacyId: '420',
    description: 'Spray Irrigation - Storage',
    lossFactor: 'high',
    twoPartTariff: true
  },
  {
    id: '68952835-592a-48e8-a6ea-b5ab0c71716d',
    legacyId: '430',
    description: 'Supply To A Canal For Throughflow',
    lossFactor: 'very low',
    twoPartTariff: false
  },
  {
    id: 'bba3436e-3af9-40e4-9a56-aad81ae046ef',
    legacyId: '440',
    description: 'Supply To A Leat For Throughflow',
    lossFactor: 'very low',
    twoPartTariff: false
  },
  {
    id: 'cb5273f5-1962-477c-9c23-bec96e1409ef',
    legacyId: '450',
    description: 'Transfer Between Sources (Pre Water Act 2003)',
    lossFactor: 'very low',
    twoPartTariff: false
  },
  {
    id: '96218b0a-07cf-4a4c-85e7-204ccbe5a7e6',
    legacyId: '460',
    description: 'Vegetable Washing',
    lossFactor: 'low',
    twoPartTariff: false
  },
  {
    id: '722b0f7b-4258-4b39-999c-8942a77371b4',
    legacyId: '470',
    description: 'Water Bottling',
    lossFactor: 'medium',
    twoPartTariff: false
  },
  {
    id: 'e1d58b9b-cd4a-43a9-950e-c9244ab9ab0e',
    legacyId: '480',
    description: 'Water Wheels Not Used For Power',
    lossFactor: 'very low',
    twoPartTariff: false
  },
  {
    id: 'a7bb7cbc-d417-4eaa-961b-4d8a75a5e1f9',
    legacyId: '490',
    description: 'Impounding (for any purpose excluding impounding for HEP)',
    lossFactor: 'non-chargeable',
    twoPartTariff: false
  },
  {
    id: 'e4cabe35-e4f6-4d7d-855d-6d126f77b4fd',
    legacyId: '600',
    description: 'Trickle Irrigation - Direct',
    lossFactor: 'high',
    twoPartTariff: true
  },
  {
    id: 'b6e13514-81da-4cfe-b6de-6a13a22e010e',
    legacyId: '610',
    description: 'Trickle Irrigation - Under Cover/Containers',
    lossFactor: 'high',
    twoPartTariff: false
  },
  {
    id: '80c45e3e-8487-40e3-b661-834efedb3d15',
    legacyId: '620',
    description: 'Trickle Irrigation - Storage',
    lossFactor: 'high',
    twoPartTariff: true
  },
  {
    id: '443e7f1a-6d1d-4193-989d-2c94fb4c9656',
    legacyId: '630',
    description: 'Flood Irrigation, Including Water Meadows, Warping And Pest Control',
    lossFactor: 'very low',
    twoPartTariff: false
  },
  {
    id: 'ddcf9fe3-26b7-4ef2-8bf1-1226f11652be',
    legacyId: '640',
    description: 'Wet Fencing And Nature Conservation',
    lossFactor: 'very low',
    twoPartTariff: false
  },
  {
    id: '96655751-b02c-42d8-a305-1859f9a17287',
    legacyId: '650',
    description: 'Transfer Between Sources (Post Water Act 2003)',
    lossFactor: 'very low',
    twoPartTariff: false
  },
  {
    id: 'a7eb6005-fca6-416d-878a-52ac0ead9b6f',
    legacyId: '660',
    description: 'Dewatering',
    lossFactor: 'very low',
    twoPartTariff: false
  },
  {
    id: '10e3bd38-15dc-41d7-a77b-153d6e3c7d1b',
    legacyId: '670',
    description: 'Hydraulic Fracturing (Fracking)',
    lossFactor: 'high',
    twoPartTariff: false
  },
  {
    id: '6e4807d8-7d9d-4ff6-bdb2-b3b121077873',
    legacyId: '645',
    description: 'Wet Fencing and Agriculture',
    lossFactor: 'very low',
    twoPartTariff: false
  }
]

module.exports = {
  data
}
