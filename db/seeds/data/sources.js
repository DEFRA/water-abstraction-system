'use strict'

const data = [
  {
    id: 'dd2d2c0f-e71b-478b-b512-e1ae3c0d723b',
    description: 'GROUND WATER SOURCE OF SUPPLY',
    sourceType: 'Groundwater',
    ngr: 'TL 15000 95000',
    externalId: '1:GWSOS',
    legacyId: 'GWSOS'
  },
  {
    id: 'a8957527-3e07-4993-9434-01ffcbdcec15',
    description: 'SURFACE WATER SOURCE OF SUPPLY',
    sourceType: 'Surfacewater',
    ngr: 'TL 15000 95000',
    externalId: '1:SWSOS',
    legacyId: 'SWSOS'
  },
  {
    id: '26e1f5b9-6798-4353-b0c6-0c69ca901150',
    description: 'TIDAL WATER SOURCE OF SUPPLY',
    sourceType: 'Tidalwater',
    ngr: 'TF 60000 40000',
    externalId: '1:TWSOS',
    legacyId: 'TWSOS'
  },
  {
    id: '2a90508a-55f2-410f-9e48-757241066afc',
    description: 'Surface Water Midlands Region',
    sourceType: 'Surfacewater',
    ngr: 'SK 9999 9999',
    externalId: '2:SWMID',
    legacyId: 'SWMID'
  },
  {
    id: 'd5fdb3ca-3f03-43ef-96ca-5c3e97e7f112',
    description: 'Tidal Water Midlands Region',
    sourceType: 'Tidalwater',
    ngr: 'SK 9999 9999',
    externalId: '2:TWMID',
    legacyId: 'TWMID'
  },
  {
    id: 'd67965cc-57b0-4fb6-a141-05b2eb828aa3',
    description: 'Groundwater Midlands Region',
    sourceType: 'Groundwater',
    ngr: 'SK 9999 9999',
    externalId: '2:GWMID',
    legacyId: 'GWMID'
  },
  {
    id: '584296b0-1eda-4663-be41-3a54e862757d',
    description: 'SURFACE WATER',
    sourceType: 'Surfacewater',
    ngr: 'SE 0000 0000',
    externalId: '3:S',
    legacyId: 'S'
  },
  {
    id: '580159b3-d241-403c-94d4-723fe26e1df1',
    description: 'TIDAL WATERS',
    sourceType: 'Tidalwater',
    ngr: 'SE 0000 0000',
    externalId: '3:T',
    legacyId: 'T'
  },
  {
    id: '39573383-edb3-4962-9f00-9760d84ddae3',
    description: 'GROUNDWATERS',
    sourceType: 'Groundwater',
    ngr: 'SE 0000 0000',
    externalId: '3:G',
    legacyId: 'G'
  },
  {
    id: '0bdddff6-0f2c-43fc-9353-4bed744b851f',
    description: 'Ground Water - North West Region',
    sourceType: 'Groundwater',
    ngr: 'SD 60000 60000',
    externalId: '4:GWNW',
    legacyId: 'GWNW'
  },
  {
    id: '513d5d3b-cb17-4964-b155-7e1b898ae071',
    description: 'Surface, Non-Tidal - North West Region',
    sourceType: 'Surfacewater',
    ngr: 'SD 60000 60000',
    externalId: '4:SNNW',
    legacyId: 'SNNW'
  },
  {
    id: '0d0dd797-f2fc-4c76-b64a-da368745ba05',
    description: 'Surface, Tidal - North West Region',
    sourceType: 'Tidalwater',
    ngr: 'SD 30000 70000',
    externalId: '4:STNW',
    legacyId: 'STNW'
  },
  {
    id: '148eab15-feb0-40d6-a3c9-d7ef8ba5ffca',
    description: 'South West Region All Surface Waters - Fresh',
    sourceType: 'Surfacewater',
    ngr: 'SX 966 917',
    externalId: '5:SWF',
    legacyId: 'SWF'
  },
  {
    id: '25e3e21d-ece2-4426-85ec-f2e902b6363b',
    description: 'South West Region All Surface Waters - Saline',
    sourceType: 'Surfacewater',
    ngr: 'SX 966 917',
    externalId: '5:SWS',
    legacyId: 'SWS'
  },
  {
    id: 'e69673b9-5a8d-4013-8278-d3f83cfb1bd5',
    description: 'South West Region All Ground Waters - Fresh',
    sourceType: 'Groundwater',
    ngr: 'SX 966 917',
    externalId: '5:GWF',
    legacyId: 'GWF'
  },
  {
    id: 'ac0cd23a-314b-41ae-8380-5e8c318877ce',
    description: 'South West Region All Ground Waters - Saline',
    sourceType: 'Groundwater',
    ngr: 'SX 966 917',
    externalId: '5:GWS',
    legacyId: 'GWS'
  },
  {
    id: '6a428470-e30b-4f81-935e-2110f217aab7',
    description: 'South West Region All Tidal Waters- Fresh',
    sourceType: 'Tidalwater',
    ngr: 'SX 966 917',
    externalId: '5:TWF',
    legacyId: 'TWF'
  },
  {
    id: '99653c57-b34f-4f40-83c9-4080c4a38804',
    description: 'South West Region All Tidal Waters - Saline',
    sourceType: 'Tidalwater',
    ngr: 'SX 966 917',
    externalId: '5:TWS',
    legacyId: 'TWS'
  },
  {
    id: 'c833727a-aa6f-407a-a42b-58eda61ea3bf',
    description: 'Southern Region Surface Waters',
    sourceType: 'Surfacewater',
    ngr: 'TQ 700 530',
    externalId: '6:SSW',
    legacyId: 'SSW'
  },
  {
    id: '00bd2ecd-bd64-4792-898c-f6bcc896c85c',
    description: 'Southern Region Groundwater',
    sourceType: 'Groundwater',
    ngr: 'TR 3668 4421',
    externalId: '6:SGW',
    legacyId: 'SGW'
  },
  {
    id: '229159cb-24f3-4abc-8820-a2132885a8e3',
    description: 'Southern Region Tidal Waters',
    sourceType: 'Tidalwater',
    ngr: 'TQ 700 530',
    externalId: '6:STW',
    legacyId: 'STW'
  },
  {
    id: '69336a95-9259-4a6f-bbed-e864bd11044a',
    description: 'THAMES SURFACE WATER - NON TIDAL',
    sourceType: 'Surfacewater',
    ngr: 'SU 80000 90000',
    externalId: '7:SOSSW',
    legacyId: 'SOSSW'
  },
  {
    id: '87688ae5-e638-4a61-9060-b5c4fc7581ec',
    description: 'THAMES SURFACE WATER - TIDAL',
    sourceType: 'Tidalwater',
    ngr: 'TQ 30000 80000',
    externalId: '7:SOSTW',
    legacyId: 'SOSTW'
  },
  {
    id: 'c4503f41-7fa5-45d8-bb82-30aeb34a4e1f',
    description: 'THAMES GROUNDWATER',
    sourceType: 'Groundwater',
    ngr: 'SU 80000 90000',
    externalId: '7:SOSGW',
    legacyId: 'SOSGW'
  },
  {
    id: '14ab4ecb-839c-4c48-9b26-a0a1b4fb9700',
    description: 'EAW Groundwater',
    sourceType: 'Groundwater',
    ngr: 'SN 75 19',
    externalId: '8:EAW GW',
    legacyId: 'EAW GW'
  },
  {
    id: '91305b09-6199-428d-a2cd-5923ae16d1b3',
    description: 'EAW Surface Water',
    sourceType: 'Surfacewater',
    ngr: 'SN 46 16',
    externalId: '8:EAW SW',
    legacyId: 'EAW SW'
  }
]

module.exports = {
  data
}
