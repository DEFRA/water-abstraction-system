'use strict'

const data = [
  {
    id: 'b13a469a-aa38-48c8-b899-da7536b44e37',
    reference: '4.1.1',
    subsistenceCharge: 9700,
    description:
      'Low loss tidal abstraction of water up to and including 25,002 megalitres a year where no model applies',
    shortDescription: 'Low loss, tidal, up to and including 25,002 ML/yr',
    tidal: true,
    lossFactor: 'low',
    modelTier: 'no model',
    restrictedSource: false,
    minVolume: 0,
    maxVolume: 25002
  },
  {
    id: 'fd6c2eb6-921b-4f22-a076-5f96d793c57c',
    reference: '4.1.2',
    subsistenceCharge: 10200,
    description:
      'Low loss tidal abstraction of water up to and including 25,002 megalitres a year where a Tier 1 model applies',
    shortDescription: 'Low loss, tidal, up to and including 25,002 ML/yr, Tier 1 model',
    tidal: true,
    lossFactor: 'low',
    modelTier: 'tier 1',
    restrictedSource: false,
    minVolume: 0,
    maxVolume: 25002
  },
  {
    id: '61aed61d-0dda-4402-ae43-74e344ba8ba1',
    reference: '4.1.4',
    subsistenceCharge: 51300,
    description:
      'Low loss tidal abstraction of water greater than 25,002 up to and including 83,333 megalitres a year where no model applies',
    shortDescription: 'Low loss, tidal, greater than 25,002 up to and including 83,333 ML/yr',
    tidal: true,
    lossFactor: 'low',
    modelTier: 'no model',
    restrictedSource: false,
    minVolume: 25002,
    maxVolume: 83333
  },
  {
    id: 'b0f8d374-eff0-4a9c-ba0d-ea81f312263e',
    reference: '4.1.5',
    subsistenceCharge: 53800,
    description:
      'Low loss tidal abstraction of water greater than 25,002 up to and including 83,333 megalitres a year where a Tier 1 model applies',
    shortDescription: 'Low loss, tidal, greater than 25,002 up to and including 83,333 ML/yr, Tier 1 model',
    tidal: true,
    lossFactor: 'low',
    modelTier: 'tier 1',
    restrictedSource: false,
    minVolume: 25002,
    maxVolume: 83333
  },
  {
    id: '0fdb82aa-7880-4c39-afc1-3381e173a06d',
    reference: '4.1.6',
    subsistenceCharge: 58800,
    description:
      'Low loss tidal abstraction of water greater than 25,002 up to and including 83,333 megalitres a year where a Tier 2 model applies',
    shortDescription: 'Low loss, tidal, greater than 25,002 up to and including 83,333 ML/yr, Tier 2 model',
    tidal: true,
    lossFactor: 'low',
    modelTier: 'tier 2',
    restrictedSource: false,
    minVolume: 25002,
    maxVolume: 83333
  },
  {
    id: '500d1e03-4755-4748-9ad2-931d8fb6f305',
    reference: '4.1.7',
    subsistenceCharge: 116200,
    description:
      'Low loss tidal abstraction of water greater than 83,333 up to and including 141,667 megalitres a year where no model applies',
    shortDescription: 'Low loss, tidal, greater than 83,333 up to and including 141,667 ML/yr',
    tidal: true,
    lossFactor: 'low',
    modelTier: 'no model',
    restrictedSource: false,
    minVolume: 83333,
    maxVolume: 141667
  },
  {
    id: '81c4eb26-fe91-4f95-8980-5a9ee954099c',
    reference: '4.1.8',
    subsistenceCharge: 122000,
    description:
      'Low loss tidal abstraction of water greater than 83,333 up to and including 141,667 megalitres a year where a Tier 1 model applies',
    shortDescription: 'Low loss, tidal, greater than 83,333 up to and including 141,667 ML/yr, Tier 1 model',
    tidal: true,
    lossFactor: 'low',
    modelTier: 'tier 1',
    restrictedSource: false,
    minVolume: 83333,
    maxVolume: 141667
  },
  {
    id: '4fc96c86-a0b9-41ce-b86d-5a63587a1220',
    reference: '4.1.9',
    subsistenceCharge: 132100,
    description:
      'Low loss tidal abstraction of water greater than 83,333 up to and including 141,667 megalitres a year where a Tier 2 model applies',
    shortDescription: 'Low loss, tidal, greater than 83,333 up to and including 141,667 ML/yr, Tier 2 model',
    tidal: true,
    lossFactor: 'low',
    modelTier: 'tier 2',
    restrictedSource: false,
    minVolume: 83333,
    maxVolume: 141667
  },
  {
    id: 'd27cd57e-4646-4367-945b-54eaad828299',
    reference: '4.1.10',
    subsistenceCharge: 178300,
    description:
      'Low loss tidal abstraction of water greater than 141,667 up to and including 200,000 megalitres a year where no model applies',
    shortDescription: 'Low loss, tidal, greater than 141,667 up to and including 200,000 ML/yr',
    tidal: true,
    lossFactor: 'low',
    modelTier: 'no model',
    restrictedSource: false,
    minVolume: 141667,
    maxVolume: 200000
  },
  {
    id: '40d84b41-b73f-4ba9-b3d9-8e0f346e6a13',
    reference: '4.1.11',
    subsistenceCharge: 187100,
    description:
      'Low loss tidal abstraction of water greater than 141,667 up to and including 200,000 megalitres a year where a Tier 1 model applies',
    shortDescription: 'Low loss, tidal, greater than 141,667 up to and including 200,000 ML/yr, Tier 1 model',
    tidal: true,
    lossFactor: 'low',
    modelTier: 'tier 1',
    restrictedSource: false,
    minVolume: 141667,
    maxVolume: 200000
  },
  {
    id: 'dfb8d0b3-c619-48c8-abf4-4a648e3acb18',
    reference: '4.1.12',
    subsistenceCharge: 202700,
    description:
      'Low loss tidal abstraction of water greater than 141,667 up to and including 200,000 megalitres a year where a Tier 2 model applies',
    shortDescription: 'Low loss, tidal, greater than 141,667 up to and including 200,000 ML/yr, Tier 2 model',
    tidal: true,
    lossFactor: 'low',
    modelTier: 'tier 2',
    restrictedSource: false,
    minVolume: 141667,
    maxVolume: 200000
  },
  {
    id: 'e6011dda-1c72-4721-85e6-c04b8ac92b1b',
    reference: '4.6.56',
    subsistenceCharge: 6869700,
    description:
      'High loss non-tidal abstraction of water greater than 2,200 up to and including 6,500 megalitres a year where a Tier 1 model applies.',
    shortDescription: 'High loss, non-tidal, greater than 2,200 up to and including 6,500 ML/yr, Tier 1 model',
    tidal: false,
    lossFactor: 'high',
    modelTier: 'tier 1',
    restrictedSource: false,
    minVolume: 2200,
    maxVolume: 6500
  },
  {
    id: 'ad9f9924-50b2-48b4-923d-45c5cd505737',
    reference: '4.6.57',
    subsistenceCharge: 7439000,
    description:
      'High loss non-tidal abstraction of water greater than 2,200 up to and including 6,500 megalitres a year where a Tier 2 model applies.',
    shortDescription: 'High loss, non-tidal, greater than 2,200 up to and including 6,500 ML/yr, Tier 2 model',
    tidal: false,
    lossFactor: 'high',
    modelTier: 'tier 2',
    restrictedSource: false,
    minVolume: 2200,
    maxVolume: 6500
  },
  {
    id: 'a5feda57-b44c-45cc-b3de-0391fe80ad4a',
    reference: '4.6.58',
    subsistenceCharge: 7772300,
    description:
      'High loss non-tidal abstraction of restricted water greater than 2,200 up to and including 6,500 megalitres a year, where no model applies.',
    shortDescription: 'High loss, non-tidal, restricted water, greater than 2,200 up to and including 6,500 ML/yr',
    tidal: false,
    lossFactor: 'high',
    modelTier: 'no model',
    restrictedSource: true,
    minVolume: 2200,
    maxVolume: 6500
  },
  {
    id: 'dc245af6-23ac-454b-a7ec-fb74813e4866',
    reference: '4.6.59',
    subsistenceCharge: 8096900,
    description:
      'High loss non-tidal abstraction of restricted water greater than 2,200 up to and including 6,500 megalitres a year, where a Tier 1 model applies.',
    shortDescription:
      'High loss, non-tidal, restricted water, greater than 2,200 up to and including 6,500 ML/yr, Tier 1 model',
    tidal: false,
    lossFactor: 'high',
    modelTier: 'tier 1',
    restrictedSource: true,
    minVolume: 2200,
    maxVolume: 6500
  },
  {
    id: 'f1b09908-bb30-42ab-94c0-b82683d2db33',
    reference: '4.6.60',
    subsistenceCharge: 8666200,
    description:
      'High loss non-tidal abstraction of restricted water greater than 2,200 up to and including 6,500 megalitres a year, where a Tier 2 model applies.',
    shortDescription:
      'High loss, non-tidal, restricted water, greater than 2,200 up to and including 6,500 ML/yr, Tier 2 model',
    tidal: false,
    lossFactor: 'high',
    modelTier: 'tier 2',
    restrictedSource: true,
    minVolume: 2200,
    maxVolume: 6500
  },
  {
    id: 'f1f53eab-c3fe-4a4b-96d7-704ebc4001b4',
    reference: '4.6.61',
    subsistenceCharge: 13958000,
    description:
      'High loss non-tidal abstraction of water greater than 6,500 up to and including 9,000 megalitres a year where no model applies.',
    shortDescription: 'High loss, non-tidal, greater than 6,500 up to and including 9,000 ML/yr',
    tidal: false,
    lossFactor: 'high',
    modelTier: 'no model',
    restrictedSource: false,
    minVolume: 6500,
    maxVolume: 9000
  },
  {
    id: '03b25c10-7fe8-4c09-bd62-48bba54dadcd',
    reference: '4.6.62',
    subsistenceCharge: 14650300,
    description:
      'High loss non-tidal abstraction of water greater than 6,500 up to and including 9,000 megalitres a year where a Tier 1 model applies.',
    shortDescription: 'High loss, non-tidal, greater than 6,500 up to and including 9,000 ML/yr, Tier 1 model',
    tidal: false,
    lossFactor: 'high',
    modelTier: 'tier 1',
    restrictedSource: false,
    minVolume: 6500,
    maxVolume: 9000
  },
  {
    id: '1e8262f2-0abc-4d37-bd02-512dc99fd4ff',
    reference: '4.6.63',
    subsistenceCharge: 15861800,
    description:
      'High loss non-tidal abstraction of water greater than 6,500 up to and including 9,000 megalitres a year where a Tier 2 model applies.',
    shortDescription: 'High loss, non-tidal, greater than 6,500 up to and including 9,000 ML/yr, Tier 2 model',
    tidal: false,
    lossFactor: 'high',
    modelTier: 'tier 2',
    restrictedSource: false,
    minVolume: 6500,
    maxVolume: 9000
  },
  {
    id: 'ea87d509-91d9-4690-ab8c-249e5c0d389a',
    reference: '4.6.64',
    subsistenceCharge: 16575100,
    description:
      'High loss non-tidal abstraction of restricted water greater than 6,500 up to and including 9,000 megalitres a year, where no model applies.',
    shortDescription: 'High loss, non-tidal, restricted water, greater than 6,500 up to and including 9,000 ML/yr',
    tidal: false,
    lossFactor: 'high',
    modelTier: 'no model',
    restrictedSource: true,
    minVolume: 6500,
    maxVolume: 9000
  },
  {
    id: '33062e2e-e1c7-4b3a-9d5a-059bf9fdb385',
    reference: '4.6.65',
    subsistenceCharge: 17267400,
    description:
      'High loss non-tidal abstraction of restricted water greater than 6,500 up to and including 9,000 megalitres a year, where a Tier 1 model applies.',
    shortDescription:
      'High loss, non-tidal, restricted water, greater than 6,500 up to and including 9,000 ML/yr, Tier 1 model',
    tidal: false,
    lossFactor: 'high',
    modelTier: 'tier 1',
    restrictedSource: true,
    minVolume: 6500,
    maxVolume: 9000
  },
  {
    id: '4bf5c78c-0640-44d1-886b-93139940473a',
    reference: '4.6.66',
    subsistenceCharge: 18478900,
    description:
      'High loss non-tidal abstraction of restricted water greater than 6,500 up to and including 9,000 megalitres a year, where a Tier 2 model applies.',
    shortDescription:
      'High loss, non-tidal, restricted water, greater than 6,500 up to and including 9,000 ML/yr, Tier 2 model',
    tidal: false,
    lossFactor: 'high',
    modelTier: 'tier 2',
    restrictedSource: true,
    minVolume: 6500,
    maxVolume: 9000
  },
  {
    id: '983a70e8-6a76-49cd-8f10-6afbd944a19a',
    reference: '4.6.67',
    subsistenceCharge: 25748600,
    description:
      'High loss non-tidal abstraction of water greater than 9,000 up to and including 21,500 megalitres a year where no model applies.',
    shortDescription: 'High loss, non-tidal, greater than 9,000 up to and including 21,500 ML/yr',
    tidal: false,
    lossFactor: 'high',
    modelTier: 'no model',
    restrictedSource: false,
    minVolume: 9000,
    maxVolume: 21500
  },
  {
    id: '614dd339-2098-43e1-93b2-71c3b513bf2d',
    reference: '4.6.68',
    subsistenceCharge: 27025700,
    description:
      'High loss non-tidal abstraction of water greater than 9,000 up to and including 21,500 megalitres a year where a Tier 1 model applies.',
    shortDescription: 'High loss, non-tidal, greater than 9,000 up to and including 21,500 ML/yr, Tier 1 model',
    tidal: false,
    lossFactor: 'high',
    modelTier: 'tier 1',
    restrictedSource: false,
    minVolume: 9000,
    maxVolume: 21500
  },
  {
    id: '3192c6b7-185f-4cad-9762-cafe4bf637be',
    reference: '4.6.69',
    subsistenceCharge: 29265100,
    description:
      'High loss non-tidal abstraction of water greater than 9,000 up to and including 21,500 megalitres a year where a Tier 2 model applies.',
    shortDescription: 'High loss, non-tidal, greater than 9,000 up to and including 21,500 ML/yr, Tier 2 model',
    tidal: false,
    lossFactor: 'high',
    modelTier: 'tier 2',
    restrictedSource: false,
    minVolume: 9000,
    maxVolume: 21500
  },
  {
    id: '823120c0-c376-435d-a359-6171aa00a0bc',
    reference: '4.6.70',
    subsistenceCharge: 30576500,
    description:
      'High loss non-tidal abstraction of restricted water greater than 9,000 up to and including 21,500 megalitres a year, where no model applies.',
    shortDescription: 'High loss, non-tidal, restricted water, greater than 9,000 up to and including 21,500 ML/yr',
    tidal: false,
    lossFactor: 'high',
    modelTier: 'no model',
    restrictedSource: true,
    minVolume: 9000,
    maxVolume: 21500
  },
  {
    id: 'fc700a81-616e-42ec-967b-6f754e54d10e',
    reference: '4.6.71',
    subsistenceCharge: 31853600,
    description:
      'High loss non-tidal abstraction of restricted water greater than 9,000 up to and including 21,500 megalitres a year, where a Tier 1 model applies.',
    shortDescription:
      'High loss, non-tidal, restricted water, greater than 9,000 up to and including 21,500 ML/yr, Tier 1 model',
    tidal: false,
    lossFactor: 'high',
    modelTier: 'tier 1',
    restrictedSource: true,
    minVolume: 9000,
    maxVolume: 21500
  },
  {
    id: '6ef4c20c-5b33-4808-acf5-729e669b362f',
    reference: '4.6.72',
    subsistenceCharge: 34093000,
    description:
      'High loss non-tidal abstraction of restricted water greater than 9,000 up to and including 21,500 megalitres a year, where a Tier 2 model applies.',
    shortDescription:
      'High loss, non-tidal, restricted water, greater than 9,000 up to and including 21,500 ML/yr, Tier 2 model',
    tidal: false,
    lossFactor: 'high',
    modelTier: 'tier 2',
    restrictedSource: true,
    minVolume: 9000,
    maxVolume: 21500
  },
  {
    id: '93e7612e-ee64-4e46-8c5f-5eb325034e2b',
    reference: '4.6.73',
    subsistenceCharge: 65723300,
    description:
      'High loss non-tidal abstraction of water greater than 21,500 up to and including 100,000 megalitres a year where no model applies.',
    shortDescription: 'High loss, non-tidal, greater than 21,500 up to and including 100,000 ML/yr',
    tidal: false,
    lossFactor: 'high',
    modelTier: 'no model',
    restrictedSource: false,
    minVolume: 21500,
    maxVolume: 100000
  },
  {
    id: '95b0109c-4ece-4f52-9be4-8326e90a4b55',
    reference: '4.6.74',
    subsistenceCharge: 68983000,
    description:
      'High loss non-tidal abstraction of water greater than 21,500 up to and including 100,000 megalitres a year where a Tier 1 model applies.',
    shortDescription: 'High loss, non-tidal, greater than 21,500 up to and including 100,000 ML/yr, Tier 1 model',
    tidal: false,
    lossFactor: 'high',
    modelTier: 'tier 1',
    restrictedSource: false,
    minVolume: 21500,
    maxVolume: 100000
  },
  {
    id: '15f6a1d4-987c-4c4a-8dfc-b6713b674c9d',
    reference: '4.6.75',
    subsistenceCharge: 74699200,
    description:
      'High loss non-tidal abstraction of water greater than 21,500 up to and including 100,000 megalitres a year where a Tier 2 model applies.',
    shortDescription: 'High loss, non-tidal, greater than 21,500 up to and including 100,000 ML/yr, Tier 2 model',
    tidal: false,
    lossFactor: 'high',
    modelTier: 'tier 2',
    restrictedSource: false,
    minVolume: 21500,
    maxVolume: 100000
  },
  {
    id: '52ab740f-784e-45a7-9204-7a776936cc74',
    reference: '4.6.76',
    subsistenceCharge: 78046500,
    description:
      'High loss non-tidal abstraction of restricted water greater than 21,500 up to and including 100,000 megalitres a year, where no model applies.',
    shortDescription: 'High loss, non-tidal, restricted water, greater than 21,500 up to and including 100,000 ML/yr',
    tidal: false,
    lossFactor: 'high',
    modelTier: 'no model',
    restrictedSource: true,
    minVolume: 21500,
    maxVolume: 100000
  },
  {
    id: '0e61a8e6-dda1-4fbc-a70a-649874395a6b',
    reference: '4.6.77',
    subsistenceCharge: 81306200,
    description:
      'High loss non-tidal abstraction of restricted water greater than 21,500 up to and including 100,000 megalitres a year, where a Tier 1 model applies.',
    shortDescription:
      'High loss, non-tidal, restricted water, greater than 21,500 up to and including 100,000 ML/yr, Tier 1 model',
    tidal: false,
    lossFactor: 'high',
    modelTier: 'tier 1',
    restrictedSource: true,
    minVolume: 21500,
    maxVolume: 100000
  },
  {
    id: 'e0a11a98-0382-4ed0-947b-3c17a0e0a60d',
    reference: '4.1.3',
    subsistenceCharge: 11000,
    description:
      'Low loss tidal abstraction of water up to and including 25,002 megalitres a year where a Tier 2 model applies',
    shortDescription: 'Low loss, tidal, up to and including 25,002 ML/yr, Tier 2 model',
    tidal: true,
    lossFactor: 'low',
    modelTier: 'tier 2',
    restrictedSource: false,
    minVolume: 0,
    maxVolume: 25002
  },
  {
    id: '56ff0dfe-c513-4415-8f98-97b6979a821d',
    reference: '4.2.13',
    subsistenceCharge: 288900,
    description:
      'Medium loss tidal abstraction of water greater than 1,000 up to and including 1,833 megalitres a year where no model applies',
    shortDescription: 'Medium loss, tidal, greater than 1,000 up to and including 1,833 ML/yr',
    tidal: true,
    lossFactor: 'medium',
    modelTier: 'no model',
    restrictedSource: false,
    minVolume: 1000,
    maxVolume: 1833
  },
  {
    id: '28afd190-0939-4e00-87f7-aa179873c953',
    reference: '4.6.78',
    subsistenceCharge: 87022400,
    description:
      'High loss non-tidal abstraction of restricted water greater than 21,500 up to and including 100,000 megalitres a year, where a Tier 2 model applies.',
    shortDescription:
      'High loss, non-tidal, restricted water, greater than 21,500 up to and including 100,000 ML/yr, Tier 2 model',
    tidal: false,
    lossFactor: 'high',
    modelTier: 'tier 2',
    restrictedSource: true,
    minVolume: 21500,
    maxVolume: 100000
  },
  {
    id: '5190936a-4b70-461e-95e2-270501eff66b',
    reference: '4.6.80',
    subsistenceCharge: 353223900,
    description:
      'High loss non-tidal abstraction of water greater than 100,000 megalitres a year, where a Tier 1 model applies.',
    shortDescription: 'High loss, non-tidal, greater than 100,000 ML/yr, Tier 1 model',
    tidal: false,
    lossFactor: 'high',
    modelTier: 'tier 1',
    restrictedSource: false,
    minVolume: 100000,
    maxVolume: 1000000000000000
  },
  {
    id: '4e6420c6-665f-47ea-9706-fb316bb3b0fc',
    reference: '4.6.81',
    subsistenceCharge: 382483400,
    description:
      'High loss non-tidal abstraction of water greater than 100,000 megalitres a year, where a Tier 2 model applies.',
    shortDescription: 'High loss, non-tidal, greater than 100,000 ML/yr, Tier 2 model',
    tidal: false,
    lossFactor: 'high',
    modelTier: 'tier 2',
    restrictedSource: false,
    minVolume: 100000,
    maxVolume: 1000000000000000
  },
  {
    id: '328f8a13-2b3f-45a7-82e2-7fe6ca44b3c1',
    reference: '4.6.82',
    subsistenceCharge: 399633000,
    description:
      'High loss non-tidal abstraction of restricted water greater than 100,000 megalitres a year, where no model applies.',
    shortDescription: 'High loss, non-tidal, restricted water, greater than 100,000 ML/yr',
    tidal: false,
    lossFactor: 'high',
    modelTier: 'no model',
    restrictedSource: true,
    minVolume: 100000,
    maxVolume: 1000000000000000
  },
  {
    id: '9add27b2-76c9-49c3-b2e2-1d94c77c50da',
    reference: '4.1.16',
    subsistenceCharge: 525800,
    description:
      'Low loss tidal abstraction of water greater than 366,667 up to and including 666,667 megalitres a year where no model applies',
    shortDescription: 'Low loss, tidal, greater than 366,667 up to and including 666,667 ML/yr',
    tidal: true,
    lossFactor: 'low',
    modelTier: 'no model',
    restrictedSource: false,
    minVolume: 366667,
    maxVolume: 666667
  },
  {
    id: 'c2f49f48-2b97-4771-8d11-474bb2cd4105',
    reference: '4.1.17',
    subsistenceCharge: 551900,
    description:
      'Low loss tidal abstraction of water greater than 366,667 up to and including 666,667 megalitres a year where a Tier 1 model applies',
    shortDescription: 'Low loss, tidal, greater than 366,667 up to and including 666,667 ML/yr, Tier 1 model',
    tidal: true,
    lossFactor: 'low',
    modelTier: 'tier 1',
    restrictedSource: false,
    minVolume: 366667,
    maxVolume: 666667
  },
  {
    id: 'b4de5157-7edf-4399-a6a2-8824e6480f3d',
    reference: '4.1.18',
    subsistenceCharge: 597600,
    description:
      'Low loss tidal abstraction of water greater than 366,667 up to and including 666,667 megalitres a year where a Tier 2 model applies',
    shortDescription: 'Low loss, tidal, greater than 366,667 up to and including 666,667 ML/yr, Tier 2 model',
    tidal: true,
    lossFactor: 'low',
    modelTier: 'tier 2',
    restrictedSource: false,
    minVolume: 366667,
    maxVolume: 666667
  },
  {
    id: '5c247460-72d5-4998-a36d-af044a346c47',
    reference: '4.1.19',
    subsistenceCharge: 993800,
    description:
      'Low loss tidal abstraction of water greater than 666,667 up to and including 1,250,000 megalitres a year where no model applies',
    shortDescription: 'Low loss, tidal, greater than 666,667 up to and including 1,250,000 ML/yr',
    tidal: true,
    lossFactor: 'low',
    modelTier: 'no model',
    restrictedSource: false,
    minVolume: 666667,
    maxVolume: 1250000
  },
  {
    id: '3fc33402-b554-4418-bdd3-4538818ee40d',
    reference: '4.1.20',
    subsistenceCharge: 1043100,
    description:
      'Low loss tidal abstraction of water greater than 666,667 up to and including 1,250,000 megalitres a year where a Tier 1 model applies',
    shortDescription: 'Low loss, tidal, greater than 666,667 up to and including 1,250,000 ML/yr, Tier 1 model',
    tidal: true,
    lossFactor: 'low',
    modelTier: 'tier 1',
    restrictedSource: false,
    minVolume: 666667,
    maxVolume: 1250000
  },
  {
    id: 'aea17ec1-e378-459e-80c6-507b8bb09bac',
    reference: '4.1.21',
    subsistenceCharge: 1129500,
    description:
      'Low loss tidal abstraction of water greater than 666,667 up to and including 1,250,000 megalitres a year where a Tier 2 model applies',
    shortDescription: 'Low loss, tidal, greater than 666,667 up to and including 1,250,000 ML/yr, Tier 2 model',
    tidal: true,
    lossFactor: 'low',
    modelTier: 'tier 2',
    restrictedSource: false,
    minVolume: 666667,
    maxVolume: 1250000
  },
  {
    id: 'c37df4e6-57ae-49d6-8c6c-59d73978aa1b',
    reference: '4.1.22',
    subsistenceCharge: 1843700,
    description:
      'Low loss tidal abstraction of water greater than 1,250,000 up to and including 2,333,333 megalitres a year where no model applies',
    shortDescription: 'Low loss, tidal, greater than 1,250,000 up to and including 2,333,333 ML/yr',
    tidal: true,
    lossFactor: 'low',
    modelTier: 'no model',
    restrictedSource: false,
    minVolume: 1250000,
    maxVolume: 2333333
  },
  {
    id: '168faad1-ac7a-4e49-b397-dcfba6c098a9',
    reference: '4.1.23',
    subsistenceCharge: 1935100,
    description:
      'Low loss tidal abstraction of water greater than 1,250,000 up to and including 2,333,333 megalitres a year where a Tier 1 model applies',
    shortDescription: 'Low loss, tidal, greater than 1,250,000 up to and including 2,333,333 ML/yr, Tier 1 model',
    tidal: true,
    lossFactor: 'low',
    modelTier: 'tier 1',
    restrictedSource: false,
    minVolume: 1250000,
    maxVolume: 2333333
  },
  {
    id: 'e716ed19-cc93-49e5-b491-aa5e23c8d052',
    reference: '4.1.24',
    subsistenceCharge: 2095500,
    description:
      'Low loss tidal abstraction of water greater than 1,250,000 up to and including 2,333,333 megalitres a year where a Tier 2 model applies',
    shortDescription: 'Low loss, tidal, greater than 1,250,000 up to and including 2,333,333 ML/yr, Tier 2 model',
    tidal: true,
    lossFactor: 'low',
    modelTier: 'tier 2',
    restrictedSource: false,
    minVolume: 1250000,
    maxVolume: 2333333
  },
  {
    id: '11938675-c203-44bf-877a-ee4708e60480',
    reference: '4.1.25',
    subsistenceCharge: 3162100,
    description:
      'Low loss tidal abstraction of water greater than 2,333,333 up to and including 3,666,667 megalitres a year where no model applies',
    shortDescription: 'Low loss, tidal, greater than 2,333,333 up to and including 3,666,667 ML/yr',
    tidal: true,
    lossFactor: 'low',
    modelTier: 'no model',
    restrictedSource: false,
    minVolume: 2333333,
    maxVolume: 3666667
  },
  {
    id: 'c4058fca-63b3-4553-9c99-bca51d585012',
    reference: '4.1.13',
    subsistenceCharge: 288900,
    description:
      'Low loss tidal abstraction of water greater than 200,000 up to and including 366,667 megalitres a year where no model applies',
    shortDescription: 'Low loss, tidal, greater than 200,000 up to and including 366,667 ML/yr',
    tidal: true,
    lossFactor: 'low',
    modelTier: 'no model',
    restrictedSource: false,
    minVolume: 200000,
    maxVolume: 366667
  },
  {
    id: '76b6f703-fb75-4109-855f-1e811b13a858',
    reference: '4.1.14',
    subsistenceCharge: 303200,
    description:
      'Low loss tidal abstraction of water greater than 200,000 up to and including 366,667 megalitres a year where a Tier 1 model applies',
    shortDescription: 'Low loss, tidal, greater than 200,000 up to and including 366,667 ML/yr, Tier 1 model',
    tidal: true,
    lossFactor: 'low',
    modelTier: 'tier 1',
    restrictedSource: false,
    minVolume: 200000,
    maxVolume: 366667
  },
  {
    id: 'b64da4eb-19e9-4a9d-b091-401e6b20c471',
    reference: '4.1.15',
    subsistenceCharge: 328300,
    description:
      'Low loss tidal abstraction of water greater than 200,000 up to and including 366,667 megalitres a year where a Tier 2 model applies',
    shortDescription: 'Low loss, tidal, greater than 200,000 up to and including 366,667 ML/yr, Tier 2 model',
    tidal: true,
    lossFactor: 'low',
    modelTier: 'tier 2',
    restrictedSource: false,
    minVolume: 200000,
    maxVolume: 366667
  },
  {
    id: '5a164df9-9c9a-4d59-b248-b336f1de3c2a',
    reference: '4.1.26',
    subsistenceCharge: 3318900,
    description:
      'Low loss tidal abstraction of water greater than 2,333,333 up to and including 3,666,667 megalitres a year where a Tier 1 model applies',
    shortDescription: 'Low loss, tidal, greater than 2,333,333 up to and including 3,666,667 ML/yr, Tier 1 model',
    tidal: true,
    lossFactor: 'low',
    modelTier: 'tier 1',
    restrictedSource: false,
    minVolume: 2333333,
    maxVolume: 3666667
  },
  {
    id: '1afb00ac-5c3c-4d92-90f1-caee988f73e3',
    reference: '4.1.27',
    subsistenceCharge: 3594000,
    description:
      'Low loss tidal abstraction of water greater than 2,333,333 up to and including 3,666,667 megalitres a year where a Tier 2 model applies',
    shortDescription: 'Low loss, tidal, greater than 2,333,333 up to and including 3,666,667 ML/yr, Tier 2 model',
    tidal: true,
    lossFactor: 'low',
    modelTier: 'tier 2',
    restrictedSource: false,
    minVolume: 2333333,
    maxVolume: 3666667
  },
  {
    id: '023442c2-37f5-40a7-8267-f0c0e993924e',
    reference: '4.1.28',
    subsistenceCharge: 6545100,
    description:
      'Low loss tidal abstraction of water greater than 3,666,667 up to and including 10,833,333 megalitres a year where no model applies',
    shortDescription: 'Low loss, tidal, greater than 3,666,667 up to and including 10,833,333 ML/yr',
    tidal: true,
    lossFactor: 'low',
    modelTier: 'no model',
    restrictedSource: false,
    minVolume: 3666667,
    maxVolume: 10833333
  },
  {
    id: 'cce724ce-84a3-415b-89e5-f766a272916d',
    reference: '4.1.29',
    subsistenceCharge: 6869700,
    description:
      'Low loss tidal abstraction of water greater than 3,666,667 up to and including 10,833,333 megalitres a year where a Tier 1 model applies',
    shortDescription: 'Low loss, tidal, greater than 3,666,667 up to and including 10,833,333 ML/yr, Tier 1 model',
    tidal: true,
    lossFactor: 'low',
    modelTier: 'tier 1',
    restrictedSource: false,
    minVolume: 3666667,
    maxVolume: 10833333
  },
  {
    id: '6c0f534a-ee7c-43ba-9135-d0968d7bbb76',
    reference: '4.1.39',
    subsistenceCharge: 74699200,
    description:
      'Low loss tidal abstraction of water greater than 35,833,333 up to and including 166,666,667 megalitres a year where a Tier 2 model applies',
    shortDescription: 'Low loss, tidal, greater than 35,833,333 up to and including 166,666,667 ML/yr, Tier 2 model',
    tidal: true,
    lossFactor: 'low',
    modelTier: 'tier 2',
    restrictedSource: false,
    minVolume: 35833333,
    maxVolume: 166666667
  },
  {
    id: '0be1c802-69bf-43e5-b8b9-41e5796e8808',
    reference: '4.1.40',
    subsistenceCharge: 336532800,
    description:
      'Low loss tidal abstraction of water greater than 166,666,667 megalitres a year, where no model applies',
    shortDescription: 'Low loss, tidal, greater than 16,6666,667 ML/yr',
    tidal: true,
    lossFactor: 'low',
    modelTier: 'no model',
    restrictedSource: false,
    minVolume: 166666667,
    maxVolume: 1000000000000000
  },
  {
    id: 'e4d8a5f5-1d90-4da0-81d0-dca86b5376bf',
    reference: '4.1.41',
    subsistenceCharge: 353223900,
    description:
      'Low loss tidal abstraction of water greater than 166,666,667 megalitres a year, where a Tier 1 model applies',
    shortDescription: 'Low loss, tidal, greater than 166,666,667 ML/yr, Tier 1 model',
    tidal: true,
    lossFactor: 'low',
    modelTier: 'tier 1',
    restrictedSource: false,
    minVolume: 166666667,
    maxVolume: 1000000000000000
  },
  {
    id: '7a51cb20-9132-45d3-b5ca-f9f94a0ec599',
    reference: '4.1.42',
    subsistenceCharge: 382483400,
    description:
      'Low loss tidal abstraction of water greater than 166,666,667 megalitres a year, where a Tier 2 model applies',
    shortDescription: 'Low loss, tidal, greater than 166,666,667 ML/yr, Tier 2 model',
    tidal: true,
    lossFactor: 'low',
    modelTier: 'tier 2',
    restrictedSource: false,
    minVolume: 166666667,
    maxVolume: 1000000000000000
  },
  {
    id: '5da15dbe-7bf2-486b-84d5-3bce0890e692',
    reference: '4.2.1',
    subsistenceCharge: 9700,
    description:
      'Medium loss tidal abstraction of water up to and including 125 megalitres a year where no model applies',
    shortDescription: 'Medium loss, tidal, up to and including 125 ML/yr',
    tidal: true,
    lossFactor: 'medium',
    modelTier: 'no model',
    restrictedSource: false,
    minVolume: 0,
    maxVolume: 125
  },
  {
    id: 'f83aae21-fa78-4ad9-89d5-1e9023c075ce',
    reference: '4.2.2',
    subsistenceCharge: 10200,
    description:
      'Medium loss tidal abstraction of water up to and including 125 megalitres a year where a Tier 1 model applies',
    shortDescription: 'Medium loss, tidal, up to and including 125 ML/yr, Tier 1 model',
    tidal: true,
    lossFactor: 'medium',
    modelTier: 'tier 1',
    restrictedSource: false,
    minVolume: 0,
    maxVolume: 125
  },
  {
    id: '6a634f9c-49d9-4ff6-aa26-c08fae117bcb',
    reference: '4.1.30',
    subsistenceCharge: 7439000,
    description:
      'Low loss tidal abstraction of water greater than 3,666,667 up to and including 10,833,333 megalitres a year where a Tier 2 model applies',
    shortDescription: 'Low loss, tidal, greater than 3,666,667 up to and including 10,833,333 ML/yr, Tier 2 model',
    tidal: true,
    lossFactor: 'low',
    modelTier: 'tier 2',
    restrictedSource: false,
    minVolume: 3666667,
    maxVolume: 10833333
  },
  {
    id: '85bb467d-1985-42b5-afa7-48af44939879',
    reference: '4.1.31',
    subsistenceCharge: 13958000,
    description:
      'Low loss tidal abstraction of water greater than 10,833, 333 up to and including 15,000,000 megalitres a year where no model applies',
    shortDescription: 'Low loss, tidal, greater than 10,833,333 up to and including 15,000,000 ML/yr',
    tidal: true,
    lossFactor: 'low',
    modelTier: 'no model',
    restrictedSource: false,
    minVolume: 10833333,
    maxVolume: 15000000
  },
  {
    id: '0f593203-b5fa-409d-9271-f0e1ea806325',
    reference: '4.1.32',
    subsistenceCharge: 14650300,
    description:
      'Low loss tidal abstraction of water greater than 10,833, 333 up to and including 15,000,000 megalitres a year where a Tier 1 model applies',
    shortDescription: 'Low loss, tidal, greater than 10,833,333 up to and including 15,000,000 ML/yr, Tier 1 model',
    tidal: true,
    lossFactor: 'low',
    modelTier: 'tier 1',
    restrictedSource: false,
    minVolume: 10833333,
    maxVolume: 15000000
  },
  {
    id: '6485d150-927b-40e1-85df-b7543ab48607',
    reference: '4.1.33',
    subsistenceCharge: 15861800,
    description:
      'Low loss tidal abstraction of water greater than 10,833, 333 up to and including 15,000,000 megalitres a year where a Tier 2 model applies',
    shortDescription: 'Low loss, tidal, greater than 10,833,333 up to and including 15,000,000 ML/yr, Tier 2 model',
    tidal: true,
    lossFactor: 'low',
    modelTier: 'tier 2',
    restrictedSource: false,
    minVolume: 10833333,
    maxVolume: 15000000
  },
  {
    id: 'f0525ceb-cba6-43b4-bb97-41867bf9cb82',
    reference: '4.1.34',
    subsistenceCharge: 25748600,
    description:
      'Low loss tidal abstraction of water greater than 15,000,000 up to and including 35,833,333 megalitres a year where no model applies',
    shortDescription: 'Low loss, tidal, greater than 15,000,000 up to and including 35,833,333 ML/yr',
    tidal: true,
    lossFactor: 'low',
    modelTier: 'no model',
    restrictedSource: false,
    minVolume: 15000000,
    maxVolume: 35833333
  },
  {
    id: '24e6b693-7351-4f40-9be0-c851a6f5154b',
    reference: '4.1.35',
    subsistenceCharge: 27025700,
    description:
      'Low loss tidal abstraction of water greater than 15,000,000 up to and including 35,833,333 megalitres a year where a Tier 1 model applies',
    shortDescription: 'Low loss, tidal, greater than 15,000,000 up to and including 35,833,333 ML/yr, Tier 1 model',
    tidal: true,
    lossFactor: 'low',
    modelTier: 'tier 1',
    restrictedSource: false,
    minVolume: 15000000,
    maxVolume: 35833333
  },
  {
    id: '7b19a23e-e20b-4c84-8035-9b4aaa4802ec',
    reference: '4.1.36',
    subsistenceCharge: 29265100,
    description:
      'Low loss tidal abstraction of water greater than 15,000,000 up to and including 35,833,333 megalitres a year where a Tier 2 model applies',
    shortDescription: 'Low loss, tidal, greater than 15,000,000 up to and including 35,833,333 ML/yr, Tier 2 model',
    tidal: true,
    lossFactor: 'low',
    modelTier: 'tier 2',
    restrictedSource: false,
    minVolume: 15000000,
    maxVolume: 35833333
  },
  {
    id: '8d455f2d-a8e9-429a-9a20-2e3c4ad7d613',
    reference: '4.1.37',
    subsistenceCharge: 65723300,
    description:
      'Low loss tidal abstraction of water greater than 35,833,333 up to and including 166,666,667 megalitres a year where no model applies',
    shortDescription: 'Low loss, tidal, greater than 35,833,333 up to and including 166,666,667 ML/yr',
    tidal: true,
    lossFactor: 'low',
    modelTier: 'no model',
    restrictedSource: false,
    minVolume: 35833333,
    maxVolume: 166666667
  },
  {
    id: 'cc39da2c-6ead-42cd-88dc-34a1a173b7a5',
    reference: '4.1.38',
    subsistenceCharge: 68983000,
    description:
      'Low loss tidal abstraction of water greater than 35,833,333 up to and including 166,666,667 megalitres a year where a Tier 1 model applies',
    shortDescription: 'Low loss, tidal, greater than 35,833,333 up to and including 166,666,667 ML/yr, Tier 1 model',
    tidal: true,
    lossFactor: 'low',
    modelTier: 'tier 1',
    restrictedSource: false,
    minVolume: 35833333,
    maxVolume: 166666667
  },
  {
    id: '8ba4208c-746a-49a1-b3dc-f2dd2712a89b',
    reference: '4.2.3',
    subsistenceCharge: 11000,
    description:
      'Medium loss tidal abstraction of water up to and including 125 megalitres a year where a Tier 2 model applies',
    shortDescription: 'Medium loss, tidal, up to and including 125 ML/yr, Tier 2 model',
    tidal: true,
    lossFactor: 'medium',
    modelTier: 'tier 2',
    restrictedSource: false,
    minVolume: 0,
    maxVolume: 125
  },
  {
    id: 'e0ad679d-9412-419b-9dce-57014b50fe9f',
    reference: '4.2.4',
    subsistenceCharge: 51300,
    description:
      'Medium loss tidal abstraction of water greater than 125 up to and including 417 megalitres a year where no model applies',
    shortDescription: 'Medium loss, tidal, greater than 125 up to and including 417 ML/yr',
    tidal: true,
    lossFactor: 'medium',
    modelTier: 'no model',
    restrictedSource: false,
    minVolume: 125,
    maxVolume: 417
  },
  {
    id: 'e924522d-2b3b-46f9-ab8a-4ae743926ca8',
    reference: '4.2.5',
    subsistenceCharge: 53800,
    description:
      'Medium loss tidal abstraction of water greater than 125 up to and including 417 megalitres a year where a Tier 1 model applies',
    shortDescription: 'Medium loss, tidal, greater than 125 up to and including 417 ML/yr, Tier 1 model',
    tidal: true,
    lossFactor: 'medium',
    modelTier: 'tier 1',
    restrictedSource: false,
    minVolume: 125,
    maxVolume: 417
  },
  {
    id: '4c30c2d7-582f-4129-9afe-4a25c64ac5de',
    reference: '4.2.6',
    subsistenceCharge: 58800,
    description:
      'Medium loss tidal abstraction of water greater than 125 up to and including 417 megalitres a year where a Tier 2 model applies',
    shortDescription: 'Medium loss, tidal, greater than 125 up to and including 417 ML/yr, Tier 2 model',
    tidal: true,
    lossFactor: 'medium',
    modelTier: 'tier 2',
    restrictedSource: false,
    minVolume: 125,
    maxVolume: 417
  },
  {
    id: '5d8bdca0-cb88-47c2-9018-b75555852f61',
    reference: '4.2.7',
    subsistenceCharge: 116200,
    description:
      'Medium loss tidal abstraction of water greater than 417 up to and including 708 megalitres a year where no model applies',
    shortDescription: 'Medium loss, tidal, greater than 417 up to and including 708 ML/yr',
    tidal: true,
    lossFactor: 'medium',
    modelTier: 'no model',
    restrictedSource: false,
    minVolume: 417,
    maxVolume: 708
  },
  {
    id: '55ba4dc3-66b1-42db-934c-3cb8d59bed0f',
    reference: '4.2.8',
    subsistenceCharge: 122000,
    description:
      'Medium loss tidal abstraction of water greater than 417 up to and including 708 megalitres a year where a Tier 1 model applies',
    shortDescription: 'Medium loss, tidal, greater than 417 up to and including 708 ML/yr, Tier 1 model',
    tidal: true,
    lossFactor: 'medium',
    modelTier: 'tier 1',
    restrictedSource: false,
    minVolume: 417,
    maxVolume: 708
  },
  {
    id: '09913988-3446-4608-bb3d-1ef1ac282999',
    reference: '4.2.9',
    subsistenceCharge: 132100,
    description:
      'Medium loss tidal abstraction of water greater than 417 up to and including 708 megalitres a year where a Tier 2 model applies',
    shortDescription: 'Medium loss, tidal, greater than 417 up to and including 708 ML/yr, Tier 2 model',
    tidal: true,
    lossFactor: 'medium',
    modelTier: 'tier 2',
    restrictedSource: false,
    minVolume: 417,
    maxVolume: 708
  },
  {
    id: 'c01acefe-b01d-4b42-a949-f8894a4fb375',
    reference: '4.2.10',
    subsistenceCharge: 178300,
    description:
      'Medium loss tidal abstraction of water greater than 708 up to and including 1,000 megalitres a year where no model applies',
    shortDescription: 'Medium loss, tidal, greater than 708 up to and including 1,000 ML/yr',
    tidal: true,
    lossFactor: 'medium',
    modelTier: 'no model',
    restrictedSource: false,
    minVolume: 708,
    maxVolume: 1000
  },
  {
    id: '62e4122a-a7d5-41af-bb77-5cf32d3e89d8',
    reference: '4.2.11',
    subsistenceCharge: 187100,
    description:
      'Medium loss tidal abstraction of water greater than 708 up to and including 1,000 megalitres a year where a Tier 1 model applies',
    shortDescription: 'Medium loss, tidal, greater than 708 up to and including 1,000 ML/yr, Tier 1 model',
    tidal: true,
    lossFactor: 'medium',
    modelTier: 'tier 1',
    restrictedSource: false,
    minVolume: 708,
    maxVolume: 1000
  },
  {
    id: 'b7d2bb00-8928-487b-ae42-619849fe5bd3',
    reference: '4.2.12',
    subsistenceCharge: 202700,
    description:
      'Medium loss tidal abstraction of water greater than 708 up to and including 1,000 megalitres a year where a Tier 2 model applies',
    shortDescription: 'Medium loss, tidal, greater than 708 up to and including 1,000 ML/yr, Tier 2 model',
    tidal: true,
    lossFactor: 'medium',
    modelTier: 'tier 2',
    restrictedSource: false,
    minVolume: 708,
    maxVolume: 1000
  },
  {
    id: '853bc5c2-e7a6-4134-b062-504e9b1a3fa0',
    reference: '4.2.14',
    subsistenceCharge: 303200,
    description:
      'Medium loss tidal abstraction of water greater than 1,000 up to and including 1,833 megalitres a year where a Tier 1 model applies',
    shortDescription: 'Medium loss, tidal, greater than 1,000 up to and including 1,833 ML/yr, Tier 1 model',
    tidal: true,
    lossFactor: 'medium',
    modelTier: 'tier 1',
    restrictedSource: false,
    minVolume: 1000,
    maxVolume: 1833
  },
  {
    id: '41d07601-2ca2-4795-be79-30f92e228c96',
    reference: '4.2.15',
    subsistenceCharge: 328300,
    description:
      'Medium loss tidal abstraction of water greater than 1,000 up to and including 1,833 megalitres a year where a Tier 2 model applies',
    shortDescription: 'Medium loss, tidal, greater than 1,000 up to and including 1,833 ML/yr, Tier 2 model',
    tidal: true,
    lossFactor: 'medium',
    modelTier: 'tier 2',
    restrictedSource: false,
    minVolume: 1000,
    maxVolume: 1833
  },
  {
    id: 'a1ef200f-1620-4762-b4f2-3cf459592f0b',
    reference: '4.2.16',
    subsistenceCharge: 525800,
    description:
      'Medium loss tidal abstraction of water greater than 1,833 up to and including 3,333 megalitres a year where no model applies',
    shortDescription: 'Medium loss, tidal, greater than 1,833 up to and including 3,333 ML/yr',
    tidal: true,
    lossFactor: 'medium',
    modelTier: 'no model',
    restrictedSource: false,
    minVolume: 1833,
    maxVolume: 3333
  },
  {
    id: '4883c81a-f478-4806-b6af-5c0888611eef',
    reference: '4.2.17',
    subsistenceCharge: 551900,
    description:
      'Medium loss tidal abstraction of water greater than 1,833 up to and including 3,333 megalitres a year where a Tier 1 model applies',
    shortDescription: 'Medium loss, tidal, greater than 1,833 up to and including 3,333 ML/yr, Tier 1 model',
    tidal: true,
    lossFactor: 'medium',
    modelTier: 'tier 1',
    restrictedSource: false,
    minVolume: 1833,
    maxVolume: 3333
  },
  {
    id: '22bf76da-7f9d-4930-9912-636195f0b350',
    reference: '4.2.18',
    subsistenceCharge: 597600,
    description:
      'Medium loss tidal abstraction of water greater than 1,833 up to and including 3,333 megalitres a year where a Tier 2 model applies',
    shortDescription: 'Medium loss, tidal, greater than 1,833 up to and including 3,333 ML/yr, Tier 2 model',
    tidal: true,
    lossFactor: 'medium',
    modelTier: 'tier 2',
    restrictedSource: false,
    minVolume: 1833,
    maxVolume: 3333
  },
  {
    id: '1dd7d71d-5cfc-48e1-8a20-78c3ef9ade5b',
    reference: '4.2.19',
    subsistenceCharge: 993800,
    description:
      'Medium loss tidal abstraction of water greater than 3,333 up to and including 6,250 megalitres a year where no model applies',
    shortDescription: 'Medium loss, tidal, greater than 3,333 up to and including 6,250 ML/yr',
    tidal: true,
    lossFactor: 'medium',
    modelTier: 'no model',
    restrictedSource: false,
    minVolume: 3333,
    maxVolume: 6250
  },
  {
    id: '0d40b64d-1ef0-4123-bf28-21f337285d0a',
    reference: '4.2.20',
    subsistenceCharge: 1043100,
    description:
      'Medium loss tidal abstraction of water greater than 3,333 up to and including 6,250 megalitres a year where a Tier 1 model applies',
    shortDescription: 'Medium loss, tidal, greater than 3,333 up to and including 6,250 ML/yr, Tier 1 model',
    tidal: true,
    lossFactor: 'medium',
    modelTier: 'tier 1',
    restrictedSource: false,
    minVolume: 3333,
    maxVolume: 6250
  },
  {
    id: '88398c7b-8215-442d-a32a-947780d23d19',
    reference: '4.2.21',
    subsistenceCharge: 1129500,
    description:
      'Medium loss tidal abstraction of water greater than 3,333 up to and including 6,250 megalitres a year where a Tier 2 model applies',
    shortDescription: 'Medium loss, tidal, greater than 3,333 up to and including 6,250 ML/yr, Tier 2 model',
    tidal: true,
    lossFactor: 'medium',
    modelTier: 'tier 2',
    restrictedSource: false,
    minVolume: 3333,
    maxVolume: 6250
  },
  {
    id: '21ea493d-68ea-4300-98f6-b08491b678ce',
    reference: '4.2.22',
    subsistenceCharge: 1843700,
    description:
      'Medium loss tidal abstraction of water greater than 6,250 up to and including 11,667 megalitres a year where no model applies',
    shortDescription: 'Medium loss, tidal, greater than 6,250 up to and including 11,667 ML/yr',
    tidal: true,
    lossFactor: 'medium',
    modelTier: 'no model',
    restrictedSource: false,
    minVolume: 6250,
    maxVolume: 11667
  },
  {
    id: '7257f66e-c82d-49d2-a974-1cfe9a31de4a',
    reference: '4.2.23',
    subsistenceCharge: 1935100,
    description:
      'Medium loss tidal abstraction of water greater than 6,250 up to and including 11,667 megalitres a year where a Tier 1 model applies',
    shortDescription: 'Medium loss, tidal, greater than 6,250 up to and including 11,667 ML/yr, Tier 1 model',
    tidal: true,
    lossFactor: 'medium',
    modelTier: 'tier 1',
    restrictedSource: false,
    minVolume: 6250,
    maxVolume: 11667
  },
  {
    id: '11167ede-4229-4de4-a357-27366e8d953b',
    reference: '4.2.28',
    subsistenceCharge: 6545100,
    description:
      'Medium loss tidal abstraction of water greater than 18,333 up to and including 54,167 megalitres a year where no model applies',
    shortDescription: 'Medium loss, tidal, greater than 18,333 up to and including 54,167 ML/yr',
    tidal: true,
    lossFactor: 'medium',
    modelTier: 'no model',
    restrictedSource: false,
    minVolume: 18333,
    maxVolume: 54167
  },
  {
    id: 'de9f98d6-b76f-49f2-aa81-bc965fbd14be',
    reference: '4.2.29',
    subsistenceCharge: 6869700,
    description:
      'Medium loss tidal abstraction of water greater than 18,333 up to and including 54,167 megalitres a year where a Tier 1 model applies',
    shortDescription: 'Medium loss, tidal, greater than 18,333 up to and including 54,167 ML/yr, Tier 1 model',
    tidal: true,
    lossFactor: 'medium',
    modelTier: 'tier 1',
    restrictedSource: false,
    minVolume: 18333,
    maxVolume: 54167
  },
  {
    id: 'e1436d7a-b7bd-4d6c-a03c-5677a03d8656',
    reference: '4.2.30',
    subsistenceCharge: 7439000,
    description:
      'Medium loss tidal abstraction of water greater than 18,333 up to and including 54,167 megalitres a year where a Tier 2 model applies',
    shortDescription: 'Medium loss, tidal, greater than 18,333 up to and including 54,167 ML/yr, Tier 2 model',
    tidal: true,
    lossFactor: 'medium',
    modelTier: 'tier 2',
    restrictedSource: false,
    minVolume: 18333,
    maxVolume: 54167
  },
  {
    id: 'b58d7fdb-586d-4ed4-916c-98a160611413',
    reference: '4.2.31',
    subsistenceCharge: 13958000,
    description:
      'Medium loss tidal abstraction of water greater than 54,167 up to and including 75,000 megalitres a year where no model applies',
    shortDescription: 'Medium loss, tidal, greater than 54,167 up to and including 75,000 ML/yr',
    tidal: true,
    lossFactor: 'medium',
    modelTier: 'no model',
    restrictedSource: false,
    minVolume: 54167,
    maxVolume: 75000
  },
  {
    id: '88277c68-32be-4197-8ee2-031ddfc1657d',
    reference: '4.2.32',
    subsistenceCharge: 14650300,
    description:
      'Medium loss tidal abstraction of water greater than 54,167 up to and including 75,000 megalitres a year where a Tier 1 model applies',
    shortDescription: 'Medium loss, tidal, greater than 54,167 up to and including 75,000 ML/yr, Tier 1 model',
    tidal: true,
    lossFactor: 'medium',
    modelTier: 'tier 1',
    restrictedSource: false,
    minVolume: 54167,
    maxVolume: 75000
  },
  {
    id: 'f3326882-a7ec-4148-a893-60b9cb308812',
    reference: '4.2.33',
    subsistenceCharge: 15861800,
    description:
      'Medium loss tidal abstraction of water greater than 54,167 up to and including 75,000 megalitres a year where a Tier 2 model applies',
    shortDescription: 'Medium loss, tidal, greater than 54,167 up to and including 75,000 ML/yr, Tier 2 model',
    tidal: true,
    lossFactor: 'medium',
    modelTier: 'tier 2',
    restrictedSource: false,
    minVolume: 54167,
    maxVolume: 75000
  },
  {
    id: '358d1be3-b658-4a08-902d-5125817383a5',
    reference: '4.2.34',
    subsistenceCharge: 25748600,
    description:
      'Medium loss tidal abstraction of water greater than 75,000 up to and including 179,167 megalitres a year where no model applies',
    shortDescription: 'Medium loss, tidal, greater than 75,000 up to and including 179,167 ML/yr',
    tidal: true,
    lossFactor: 'medium',
    modelTier: 'no model',
    restrictedSource: false,
    minVolume: 75000,
    maxVolume: 179167
  },
  {
    id: 'b13a0b9f-af40-4760-b1b9-787cc4e6b8e2',
    reference: '4.2.35',
    subsistenceCharge: 27025700,
    description:
      'Medium loss tidal abstraction of water greater than 75,000 up to and including 179,167 megalitres a year where a Tier 1 model applies',
    shortDescription: 'Medium loss, tidal, greater than 75,000 up to and including 179,167 ML/yr, Tier 1 model',
    tidal: true,
    lossFactor: 'medium',
    modelTier: 'tier 1',
    restrictedSource: false,
    minVolume: 75000,
    maxVolume: 179167
  },
  {
    id: '76f6afb0-a2a7-4c26-9ad4-647d2c6d22d4',
    reference: '4.2.36',
    subsistenceCharge: 29265100,
    description:
      'Medium loss tidal abstraction of water greater than 75,000 up to and including 179,167 megalitres a year where a Tier 2 model applies',
    shortDescription: 'Medium loss, tidal, greater than 75,000 up to and including 179,167 ML/yr, Tier 2 model',
    tidal: true,
    lossFactor: 'medium',
    modelTier: 'tier 2',
    restrictedSource: false,
    minVolume: 75000,
    maxVolume: 179167
  },
  {
    id: 'a7213a5d-6323-4f4a-af9c-54324ab6dd9c',
    reference: '4.2.37',
    subsistenceCharge: 65723300,
    description:
      'Medium loss tidal abstraction of water greater than 179,167 up to and including 833,333 megalitres a year where no model applies',
    shortDescription: 'Medium loss, tidal, greater than 179,167 up to and including 833,333 ML/yr',
    tidal: true,
    lossFactor: 'medium',
    modelTier: 'no model',
    restrictedSource: false,
    minVolume: 179167,
    maxVolume: 833333
  },
  {
    id: 'ed92f41f-5f04-41ef-ab05-d805ebd3cfa9',
    reference: '4.2.24',
    subsistenceCharge: 2095500,
    description:
      'Medium loss tidal abstraction of water greater than 6,250 up to and including 11,667 megalitres a year where a Tier 2 model applies',
    shortDescription: 'Medium loss, tidal, greater than 6,250 up to and including 11,667 ML/yr, Tier 2 model',
    tidal: true,
    lossFactor: 'medium',
    modelTier: 'tier 2',
    restrictedSource: false,
    minVolume: 6250,
    maxVolume: 11667
  },
  {
    id: 'bf583031-a9a4-4e12-a090-6cb730b3c17a',
    reference: '4.2.25',
    subsistenceCharge: 3162100,
    description:
      'Medium loss tidal abstraction of water greater than 11,667 up to and including 18,333 megalitres a year where no model applies',
    shortDescription: 'Medium loss, tidal, greater than 11,667 up to and including 18,333 ML/yr',
    tidal: true,
    lossFactor: 'medium',
    modelTier: 'no model',
    restrictedSource: false,
    minVolume: 11667,
    maxVolume: 18333
  },
  {
    id: 'a3452475-5256-4998-9602-a025b36db5e3',
    reference: '4.2.26',
    subsistenceCharge: 3318900,
    description:
      'Medium loss tidal abstraction of water greater than 11,667 up to and including 18,333 megalitres a year where a Tier 1 model applies',
    shortDescription: 'Medium loss, tidal, greater than 11,667 up to and including 18,333 ML/yr, Tier 1 model',
    tidal: true,
    lossFactor: 'medium',
    modelTier: 'tier 1',
    restrictedSource: false,
    minVolume: 11667,
    maxVolume: 18333
  },
  {
    id: 'f85519e3-0d23-419e-b553-95ce5f789518',
    reference: '4.2.27',
    subsistenceCharge: 3594000,
    description:
      'Medium loss tidal abstraction of water greater than 11,667 up to and including 18,333 megalitres a year where a Tier 2 model applies',
    shortDescription: 'Medium loss, tidal, greater than 11,667 up to and including 18,333 ML/yr, Tier 2 model',
    tidal: true,
    lossFactor: 'medium',
    modelTier: 'tier 2',
    restrictedSource: false,
    minVolume: 11667,
    maxVolume: 18333
  },
  {
    id: 'cc5ffdd5-fe7d-4d18-89b7-be7379b1e91a',
    reference: '4.2.38',
    subsistenceCharge: 68983000,
    description:
      'Medium loss tidal abstraction of water greater than 179,167 up to and including 833,333 megalitres a year where a Tier 1 model applies',
    shortDescription: 'Medium loss, tidal, greater than 179,167 up to and including 833,333 ML/yr, Tier 1 model',
    tidal: true,
    lossFactor: 'medium',
    modelTier: 'tier 1',
    restrictedSource: false,
    minVolume: 179167,
    maxVolume: 833333
  },
  {
    id: '6c942e4e-2145-4873-9764-86631984c6f0',
    reference: '4.2.39',
    subsistenceCharge: 74699200,
    description:
      'Medium loss tidal abstraction of water greater than 179,167 up to and including 833,333 megalitres a year where a Tier 2 model applies',
    shortDescription: 'Medium loss, tidal, greater than 179,167 up to and including 833,333 ML/yr, Tier 2 model',
    tidal: true,
    lossFactor: 'medium',
    modelTier: 'tier 2',
    restrictedSource: false,
    minVolume: 179167,
    maxVolume: 833333
  },
  {
    id: '78b7f42d-a971-47ef-84c6-c2c107b000a9',
    reference: '4.2.40',
    subsistenceCharge: 336532800,
    description:
      'Medium loss tidal abstraction of water greater than 833,333 megalitres a year, where no model applies',
    shortDescription: 'Medium loss, tidal, greater than 833,333 ML/yr',
    tidal: true,
    lossFactor: 'medium',
    modelTier: 'no model',
    restrictedSource: false,
    minVolume: 833333,
    maxVolume: 1000000000000000
  },
  {
    id: '9c9fe0d0-8ccd-4515-bef9-d0b7f1559f2b',
    reference: '4.2.41',
    subsistenceCharge: 353223900,
    description:
      'Medium loss tidal abstraction of water greater than 833,333 megalitres a year, where a Tier 1 model applies',
    shortDescription: 'Medium loss, tidal, greater than 833,333 ML/yr, Tier 1 model',
    tidal: true,
    lossFactor: 'medium',
    modelTier: 'tier 1',
    restrictedSource: false,
    minVolume: 833333,
    maxVolume: 1000000000000000
  },
  {
    id: 'fe503cf8-db5c-488c-a33f-b601cc799681',
    reference: '4.3.10',
    subsistenceCharge: 178300,
    description:
      'High loss tidal abstraction of water greater than 425 up to and including 600 megalitres a year where no model applies',
    shortDescription: 'High loss, tidal, greater than 425 up to and including 600 ML/yr',
    tidal: true,
    lossFactor: 'high',
    modelTier: 'no model',
    restrictedSource: false,
    minVolume: 425,
    maxVolume: 600
  },
  {
    id: '6d1f881f-1371-4d70-b949-df0f63faaffd',
    reference: '4.3.11',
    subsistenceCharge: 187100,
    description:
      'High loss tidal abstraction of water greater than 425 up to and including 600 megalitres a year where a Tier 1 model applies',
    shortDescription: 'High loss, tidal, greater than 425 up to and including 600 ML/yr, Tier 1 model',
    tidal: true,
    lossFactor: 'high',
    modelTier: 'tier 1',
    restrictedSource: false,
    minVolume: 425,
    maxVolume: 600
  },
  {
    id: '8fdb4837-9d16-4851-b176-48151902c79d',
    reference: '4.3.12',
    subsistenceCharge: 202700,
    description:
      'High loss tidal abstraction of water greater than 425 up to and including 600 megalitres a year where a Tier 2 model applies',
    shortDescription: 'High loss, tidal, greater than 425 up to and including 600 ML/yr, Tier 2 model',
    tidal: true,
    lossFactor: 'high',
    modelTier: 'tier 2',
    restrictedSource: false,
    minVolume: 425,
    maxVolume: 600
  },
  {
    id: '94c59695-a46a-43a1-bf6e-022c62ccbb2d',
    reference: '4.3.13',
    subsistenceCharge: 288900,
    description:
      'High loss tidal abstraction of water greater than 600 up to and including 1,100 megalitres a year where no model applies',
    shortDescription: 'High loss, tidal, greater than 600 up to and including 1,100 ML/yr',
    tidal: true,
    lossFactor: 'high',
    modelTier: 'no model',
    restrictedSource: false,
    minVolume: 600,
    maxVolume: 1100
  },
  {
    id: 'aca2a0f8-943f-4e5c-9e1f-1d0701f32f21',
    reference: '4.3.14',
    subsistenceCharge: 303200,
    description:
      'High loss tidal abstraction of water greater than  600 up to and including 1,100 megalitres a year where a Tier 1 model applies',
    shortDescription: 'High loss, tidal, greater than 600 up to and including 1,100 ML/yr, Tier 1 model',
    tidal: true,
    lossFactor: 'high',
    modelTier: 'tier 1',
    restrictedSource: false,
    minVolume: 600,
    maxVolume: 1100
  },
  {
    id: '7f56ad70-7fb6-4bff-b394-60c53900ca70',
    reference: '4.3.15',
    subsistenceCharge: 328300,
    description:
      'High loss tidal abstraction of water greater than  600 up to and including 1,100 megalitres a year where a Tier 2 model applies',
    shortDescription: 'High loss, tidal, greater than 600 up to and including 1,100 ML/yr, Tier 2 model',
    tidal: true,
    lossFactor: 'high',
    modelTier: 'tier 2',
    restrictedSource: false,
    minVolume: 600,
    maxVolume: 1100
  },
  {
    id: 'c5cc76e0-091d-4a13-b964-47f3ec777ade',
    reference: '4.3.16',
    subsistenceCharge: 525800,
    description:
      'High loss tidal abstraction of water greater than 1,100 up to and including 2,000 megalitres a year where no model applies',
    shortDescription: 'High loss, tidal, greater than 1,100 up to and including 2,000 ML/yr',
    tidal: true,
    lossFactor: 'high',
    modelTier: 'no model',
    restrictedSource: false,
    minVolume: 1100,
    maxVolume: 2000
  },
  {
    id: '2abfb96b-307a-48e1-bbee-9d20bf63a794',
    reference: '4.3.27',
    subsistenceCharge: 3594000,
    description:
      'High loss tidal abstraction of water greater than 7,000 up to and including 11,000 megalitres a year where a Tier 2 model applies',
    shortDescription: 'High loss, tidal, greater than 7,000 up to and including 11,000 ML/yr, Tier 2 model',
    tidal: true,
    lossFactor: 'high',
    modelTier: 'tier 2',
    restrictedSource: false,
    minVolume: 7000,
    maxVolume: 11000
  },
  {
    id: '6190d6c6-c8b0-4d97-a587-f49a1a75773d',
    reference: '4.3.28',
    subsistenceCharge: 6545100,
    description:
      'High loss tidal abstraction of water greater than 11,000 up to and including 32,500 megalitres a year where no model applies',
    shortDescription: 'High loss, tidal, greater than 11,000 up to and including 32,500 ML/yr',
    tidal: true,
    lossFactor: 'high',
    modelTier: 'no model',
    restrictedSource: false,
    minVolume: 11000,
    maxVolume: 32500
  },
  {
    id: '011f2ffb-866b-49c9-bb08-a0f0c6189014',
    reference: '4.3.29',
    subsistenceCharge: 6869700,
    description:
      'High loss tidal abstraction of water greater than 11,000 up to and including 32,500 megalitres a year where a Tier 1 model applies',
    shortDescription: 'High loss, tidal, greater than 11,000 up to and including 32,500 ML/yr, Tier 1 model',
    tidal: true,
    lossFactor: 'high',
    modelTier: 'tier 1',
    restrictedSource: false,
    minVolume: 11000,
    maxVolume: 32500
  },
  {
    id: '8df1fcd4-4895-4e14-affb-c2a02c4902da',
    reference: '4.3.30',
    subsistenceCharge: 7439000,
    description:
      'High loss tidal abstraction of water greater than 11,000 up to and including 32,500 megalitres a year where a Tier 2 model applies',
    shortDescription: 'High loss, tidal, greater than 11,000 up to and including 32,500 ML/yr, Tier 2 model',
    tidal: true,
    lossFactor: 'high',
    modelTier: 'tier 2',
    restrictedSource: false,
    minVolume: 11000,
    maxVolume: 32500
  },
  {
    id: '943b5563-5935-49e5-a963-ca6cf5820e5c',
    reference: '4.3.31',
    subsistenceCharge: 13958000,
    description:
      'High loss tidal abstraction of water greater than 32,500 up to and including 45,000 megalitres a year where no model applies',
    shortDescription: 'High loss, tidal, greater than 32,500 up to and including 45,000 ML/yr',
    tidal: true,
    lossFactor: 'high',
    modelTier: 'no model',
    restrictedSource: false,
    minVolume: 32500,
    maxVolume: 45000
  },
  {
    id: 'e28dc865-2c3c-47e6-ae14-1e83bfaeb716',
    reference: '4.2.42',
    subsistenceCharge: 382483400,
    description:
      'Medium loss tidal abstraction of water greater than 833,333 megalitres a year, where a Tier 2 model applies',
    shortDescription: 'Medium loss, tidal, greater than 833,333 ML/yr, Tier 2 model',
    tidal: true,
    lossFactor: 'medium',
    modelTier: 'tier 2',
    restrictedSource: false,
    minVolume: 833333,
    maxVolume: 1000000000000000
  },
  {
    id: '14cd940e-8243-460d-81ba-de3441c6140f',
    reference: '4.3.1',
    subsistenceCharge: 9700,
    description: 'High loss tidal abstraction of water up to and including 75 megalitres a year where no model applies',
    shortDescription: 'High loss, tidal, up to and including 75 ML/yr',
    tidal: true,
    lossFactor: 'high',
    modelTier: 'no model',
    restrictedSource: false,
    minVolume: 0,
    maxVolume: 75
  },
  {
    id: '8704e9c7-237e-403a-b01a-dd0745a7ba01',
    reference: '4.3.2',
    subsistenceCharge: 10200,
    description:
      'High loss tidal abstraction of water up to and including 75 megalitres a year where a Tier 1 model applies',
    shortDescription: 'High loss, tidal, up to and including 75 ML/yr, Tier 1 model',
    tidal: true,
    lossFactor: 'high',
    modelTier: 'tier 1',
    restrictedSource: false,
    minVolume: 0,
    maxVolume: 75
  },
  {
    id: '5940b1f3-3bde-4c3e-b790-be0d56630432',
    reference: '4.3.3',
    subsistenceCharge: 11000,
    description:
      'High loss tidal abstraction of water up to and including 75 megalitres a year where a Tier 2 model applies',
    shortDescription: 'High loss, tidal, up to and including 75 ML/yr, Tier 2 model',
    tidal: true,
    lossFactor: 'high',
    modelTier: 'tier 2',
    restrictedSource: false,
    minVolume: 0,
    maxVolume: 75
  },
  {
    id: 'df8e43e6-6d9b-4a75-9fdd-83d83bbc932d',
    reference: '4.3.4',
    subsistenceCharge: 51300,
    description:
      'High loss tidal abstraction of water greater than 75 up to and including 250 megalitres a year where no model applies',
    shortDescription: 'High loss, tidal, greater than 75 up to and including 250 ML/yr',
    tidal: true,
    lossFactor: 'high',
    modelTier: 'no model',
    restrictedSource: false,
    minVolume: 75,
    maxVolume: 250
  },
  {
    id: '1a5f60c0-9c9b-44b8-a14f-f37d76b31fc9',
    reference: '4.3.5',
    subsistenceCharge: 53800,
    description:
      'High loss tidal abstraction of water greater than 75 up to and including 250 megalitres a year where a Tier 1 model applies',
    shortDescription: 'High loss, tidal, greater than 75 up to and including 250 ML/yr, Tier 1 model',
    tidal: true,
    lossFactor: 'high',
    modelTier: 'tier 1',
    restrictedSource: false,
    minVolume: 75,
    maxVolume: 250
  },
  {
    id: '85671f0d-9c0f-44ca-9294-c236a479ad67',
    reference: '4.3.6',
    subsistenceCharge: 58800,
    description:
      'High loss tidal abstraction of water greater than 75 up to and including 250 megalitres a year where a Tier 2 model applies',
    shortDescription: 'High loss, tidal, greater than 75 up to and including 250 ML/yr, Tier 2 model',
    tidal: true,
    lossFactor: 'high',
    modelTier: 'tier 2',
    restrictedSource: false,
    minVolume: 75,
    maxVolume: 250
  },
  {
    id: 'fb1fed90-0ad5-4d22-86ca-34b3ac7ba324',
    reference: '4.3.7',
    subsistenceCharge: 116200,
    description:
      'High loss tidal abstraction of water greater than 250 up to and including 425 megalitres a year where no model applies',
    shortDescription: 'High loss, tidal, greater than 250 up to and including 425 ML/yr',
    tidal: true,
    lossFactor: 'high',
    modelTier: 'no model',
    restrictedSource: false,
    minVolume: 250,
    maxVolume: 425
  },
  {
    id: '773b1f9b-4a20-45d5-8938-2146de9752fe',
    reference: '4.3.8',
    subsistenceCharge: 122000,
    description:
      'High loss tidal abstraction of water greater than 250 up to and including 425 megalitres a year where a Tier 1 model applies',
    shortDescription: 'High loss, tidal, greater than 250 up to and including 425 ML/yr, Tier 1 model',
    tidal: true,
    lossFactor: 'high',
    modelTier: 'tier 1',
    restrictedSource: false,
    minVolume: 250,
    maxVolume: 425
  },
  {
    id: 'b20587f3-a328-4c4d-a3ea-8314445676f9',
    reference: '4.3.9',
    subsistenceCharge: 132100,
    description:
      'High loss tidal abstraction of water greater than 250 up to and including 425 megalitres a year where a Tier 2 model applies',
    shortDescription: 'High loss, tidal, greater than 250 up to and including 425 ML/yr, Tier 2 model',
    tidal: true,
    lossFactor: 'high',
    modelTier: 'tier 2',
    restrictedSource: false,
    minVolume: 250,
    maxVolume: 425
  },
  {
    id: '8456ca71-93ba-412b-b9da-ff9628c8adad',
    reference: '4.3.17',
    subsistenceCharge: 551900,
    description:
      'High loss tidal abstraction of water greater than 1,100 up to and including 2,000 megalitres a year where a Tier 1 model applies',
    shortDescription: 'High loss, tidal, greater than 1,100 up to and including 2,000 ML/yr, Tier 1 model',
    tidal: true,
    lossFactor: 'high',
    modelTier: 'tier 1',
    restrictedSource: false,
    minVolume: 1100,
    maxVolume: 2000
  },
  {
    id: '723da392-c007-4c2c-83ae-8ddc79039fbc',
    reference: '4.3.18',
    subsistenceCharge: 597600,
    description:
      'High loss tidal abstraction of water greater than 1,100 up to and including 2,000 megalitres a year where a Tier 2 model applies',
    shortDescription: 'High loss, tidal, greater than 1,100 up to and including 2,000 ML/yr, Tier 2 model',
    tidal: true,
    lossFactor: 'high',
    modelTier: 'tier 2',
    restrictedSource: false,
    minVolume: 1100,
    maxVolume: 2000
  },
  {
    id: 'a170a57a-cd06-45f3-8703-c850fe78f12a',
    reference: '4.3.19',
    subsistenceCharge: 993800,
    description:
      'High loss tidal abstraction of water greater than 2,000 up to and including 3,750 megalitres a year where no model applies',
    shortDescription: 'High loss, tidal, greater than 2,000 up to and including 3,750 ML/yr',
    tidal: true,
    lossFactor: 'high',
    modelTier: 'no model',
    restrictedSource: false,
    minVolume: 2000,
    maxVolume: 3750
  },
  {
    id: '638ee069-0bac-4f32-8a94-e04f07a51b6d',
    reference: '4.3.20',
    subsistenceCharge: 1043100,
    description:
      'High loss tidal abstraction of water greater than  2,000 up to and including 3,750 megalitres a year where a Tier 1 model applies',
    shortDescription: 'High loss, tidal, greater than 2,000 up to and including 3,750 ML/yr, Tier 1 model',
    tidal: true,
    lossFactor: 'high',
    modelTier: 'tier 1',
    restrictedSource: false,
    minVolume: 2000,
    maxVolume: 3750
  },
  {
    id: '84366006-b2f8-4abf-86a9-dd144ccd1f24',
    reference: '4.3.21',
    subsistenceCharge: 1129500,
    description:
      'High loss tidal abstraction of water greater than  2,000 up to and including 3,750 megalitres a year where a Tier 2 model applies',
    shortDescription: 'High loss, tidal, greater than 2,000 up to and including 3,750 ML/yr, Tier 2 model',
    tidal: true,
    lossFactor: 'high',
    modelTier: 'tier 2',
    restrictedSource: false,
    minVolume: 2000,
    maxVolume: 3750
  },
  {
    id: '84f9b8b9-8bd9-48b9-99fc-c1ad32847700',
    reference: '4.3.22',
    subsistenceCharge: 1843700,
    description:
      'High loss tidal abstraction of water greater than 3,750 up to and including 7,000 megalitres a year where no model applies',
    shortDescription: 'High loss, tidal, greater than 3,750 up to and including 7,000 ML/yr',
    tidal: true,
    lossFactor: 'high',
    modelTier: 'no model',
    restrictedSource: false,
    minVolume: 3750,
    maxVolume: 7000
  },
  {
    id: 'd305cf1f-0575-4260-9401-b2b93b9063c4',
    reference: '4.3.23',
    subsistenceCharge: 1935100,
    description:
      'High loss tidal abstraction of water greater than 3,750 up to and including 7,000 megalitres a year where a Tier 1 model applies',
    shortDescription: 'High loss, tidal, greater than 3,750 up to and including 7,000 ML/yr, Tier 1 model',
    tidal: true,
    lossFactor: 'high',
    modelTier: 'tier 1',
    restrictedSource: false,
    minVolume: 3750,
    maxVolume: 7000
  },
  {
    id: '23e43b04-ffc3-46e0-a612-14581540b59c',
    reference: '4.3.24',
    subsistenceCharge: 2095500,
    description:
      'High loss tidal abstraction of water greater than 3,750 up to and including 7,000 megalitres a year where a Tier 2 model applies',
    shortDescription: 'High loss, tidal, greater than 3,750 up to and including 7,000 ML/yr, Tier 2 model',
    tidal: true,
    lossFactor: 'high',
    modelTier: 'tier 2',
    restrictedSource: false,
    minVolume: 3750,
    maxVolume: 7000
  },
  {
    id: '1fcf62c0-4110-4702-8bc9-703bc063d654',
    reference: '4.3.25',
    subsistenceCharge: 3162100,
    description:
      'High loss tidal abstraction of water greater than 7,000 up to and including 11,000 megalitres a year where no model applies',
    shortDescription: 'High loss, tidal, greater than 7,000 up to and including 11,000 ML/yr',
    tidal: true,
    lossFactor: 'high',
    modelTier: 'no model',
    restrictedSource: false,
    minVolume: 7000,
    maxVolume: 11000
  },
  {
    id: 'b5801692-de56-435a-92ea-5d86c8fe9ed0',
    reference: '4.3.26',
    subsistenceCharge: 3318900,
    description:
      'High loss tidal abstraction of water greater than 7,000 up to and including 11,000 megalitres a year where a Tier 1 model applies',
    shortDescription: 'High loss, tidal, greater than 7,000 up to and including 11,000 ML/yr, Tier 1 model',
    tidal: true,
    lossFactor: 'high',
    modelTier: 'tier 1',
    restrictedSource: false,
    minVolume: 7000,
    maxVolume: 11000
  },
  {
    id: '88301721-91f2-4375-9891-b3f7be1fa0d3',
    reference: '4.3.32',
    subsistenceCharge: 14650300,
    description:
      'High loss tidal abstraction of water greater than 32,500 up to and including 45,000 megalitres a year where a Tier 1 model applies',
    shortDescription: 'High loss, tidal, greater than 32,500 up to and including 45,000 ML/yr, Tier 1 model',
    tidal: true,
    lossFactor: 'high',
    modelTier: 'tier 1',
    restrictedSource: false,
    minVolume: 32500,
    maxVolume: 45000
  },
  {
    id: '618083d4-b4c3-4521-b4fb-6555f9c09aa1',
    reference: '4.3.33',
    subsistenceCharge: 15861800,
    description:
      'High loss tidal abstraction of water greater than 32,500 up to and including 45,000 megalitres a year where a Tier 2 model applies',
    shortDescription: 'High loss, tidal, greater than 32,500 up to and including 45,000 ML/yr, Tier 2 model',
    tidal: true,
    lossFactor: 'high',
    modelTier: 'tier 2',
    restrictedSource: false,
    minVolume: 32500,
    maxVolume: 45000
  },
  {
    id: 'c6a95be6-92ff-4cd4-ae5c-138058692c60',
    reference: '4.3.34',
    subsistenceCharge: 25748600,
    description:
      'High loss tidal abstraction of water greater than 45,000 up to and including 107,500 megalitres a year where no model applies',
    shortDescription: 'High loss, tidal, greater than 45,000 up to and including 107,500 ML/yr',
    tidal: true,
    lossFactor: 'high',
    modelTier: 'no model',
    restrictedSource: false,
    minVolume: 45000,
    maxVolume: 107500
  },
  {
    id: 'b98b227f-4a3f-45cb-ab9f-dfd6d8d9192d',
    reference: '4.3.35',
    subsistenceCharge: 27025700,
    description:
      'High loss tidal abstraction of water greater than 45,000 up to and including 107,500 megalitres a year where a Tier 1 model applies',
    shortDescription: 'High loss, tidal, greater than 45,000 up to and including 107,500 ML/yr, Tier 1 model',
    tidal: true,
    lossFactor: 'high',
    modelTier: 'tier 1',
    restrictedSource: false,
    minVolume: 45000,
    maxVolume: 107500
  },
  {
    id: '5b827280-b739-4df4-8db5-f7f0c53e6862',
    reference: '4.3.36',
    subsistenceCharge: 29265100,
    description:
      'High loss tidal abstraction of water greater than 45,000 up to and including 107,500 megalitres a year where a Tier 2 model applies',
    shortDescription: 'High loss, tidal, greater than 45,000 up to and including 107,500 ML/yr, Tier 2 model',
    tidal: true,
    lossFactor: 'high',
    modelTier: 'tier 2',
    restrictedSource: false,
    minVolume: 45000,
    maxVolume: 107500
  },
  {
    id: 'ecd39bba-fd51-4948-b71f-bd5ed76ef8de',
    reference: '4.3.37',
    subsistenceCharge: 65723300,
    description:
      'High loss tidal abstraction of water greater than 107,500 up to and including 500,000 megalitres a year where no model applies',
    shortDescription: 'High loss, tidal, greater than 107,500 up to and including 500,000 ML/yr',
    tidal: true,
    lossFactor: 'high',
    modelTier: 'no model',
    restrictedSource: false,
    minVolume: 107500,
    maxVolume: 500000
  },
  {
    id: '3a52071c-35f5-4ffb-b768-e6119d88e5f4',
    reference: '4.3.38',
    subsistenceCharge: 68983000,
    description:
      'High loss tidal abstraction of water greater than 107,500 up to and including 500,000 megalitres a year where a Tier 1 model applies',
    shortDescription: 'High loss, tidal, greater than 107,500 up to and including 500,000 ML/yr, Tier 1 model',
    tidal: true,
    lossFactor: 'high',
    modelTier: 'tier 1',
    restrictedSource: false,
    minVolume: 107500,
    maxVolume: 500000
  },
  {
    id: 'c4a83de0-c69c-4420-bbf4-a0cbaa5091a8',
    reference: '4.3.39',
    subsistenceCharge: 74699200,
    description:
      'High loss tidal abstraction of water greater than 107,500 up to and including 500,000 megalitres a year where a Tier 2 model applies',
    shortDescription: 'High loss, tidal, greater than 107,500 up to and including 500,000 ML/yr, Tier 2 model',
    tidal: true,
    lossFactor: 'high',
    modelTier: 'tier 2',
    restrictedSource: false,
    minVolume: 107500,
    maxVolume: 500000
  },
  {
    id: '4fb3f0cb-701a-43df-8812-275c2576dfad',
    reference: '4.4.7',
    subsistenceCharge: 51300,
    description:
      'Low loss non-tidal abstraction of water greater than 5,000 up to and including 16,667 megalitres a year where no model applies.',
    shortDescription: 'Low loss, non-tidal, greater than 5,000 up to and including 16,667 ML/yr',
    tidal: false,
    lossFactor: 'low',
    modelTier: 'no model',
    restrictedSource: false,
    minVolume: 5000,
    maxVolume: 16667
  },
  {
    id: '06896a09-29d0-4633-b0e4-382493a69fad',
    reference: '4.4.8',
    subsistenceCharge: 53800,
    description:
      'Low loss non-tidal abstraction of water greater than 5,000 up to and including 16,667 megalitres a year where a Tier 1 model applies.',
    shortDescription: 'Low loss, non-tidal, greater than 5,000 up to and including 16,667 ML/yr, Tier 1 model',
    tidal: false,
    lossFactor: 'low',
    modelTier: 'tier 1',
    restrictedSource: false,
    minVolume: 5000,
    maxVolume: 16667
  },
  {
    id: 'e48ac371-0efa-441d-ad40-97af0bdf81fb',
    reference: '4.4.9',
    subsistenceCharge: 58800,
    description:
      'Low loss non-tidal abstraction of water greater than 5,000 up to and including 16,667 megalitres a year where a Tier 2 model applies.',
    shortDescription: 'Low loss, non-tidal, greater than 5,000 up to and including 16,667 ML/yr, Tier 2 model',
    tidal: false,
    lossFactor: 'low',
    modelTier: 'tier 2',
    restrictedSource: false,
    minVolume: 5000,
    maxVolume: 16667
  },
  {
    id: '2e39efed-252a-4a3e-a5d6-4e3d5fec0e3d',
    reference: '4.4.10',
    subsistenceCharge: 60900,
    description:
      'Low loss non-tidal abstraction of restricted water greater than 5,000 up to and including 16,667 megalitres a year, where no model applies.',
    shortDescription: 'Low loss, non-tidal, restricted water, greater than 5,000 up to and including 16,667 ML/yr',
    tidal: false,
    lossFactor: 'low',
    modelTier: 'no model',
    restrictedSource: true,
    minVolume: 5000,
    maxVolume: 16667
  },
  {
    id: '15866f6c-9af1-4bf0-b95f-531203c71a87',
    reference: '4.4.11',
    subsistenceCharge: 63400,
    description:
      'Low loss non-tidal abstraction of restricted water greater than 5,000 up to and including 16,667 megalitres a year, where a Tier 1 model applies.',
    shortDescription:
      'Low loss, non-tidal, restricted water, greater than 5,000 up to and including 16,667 ML/yr, Tier 1 model',
    tidal: false,
    lossFactor: 'low',
    modelTier: 'tier 1',
    restrictedSource: true,
    minVolume: 5000,
    maxVolume: 16667
  },
  {
    id: '81232c92-1568-4293-9be7-d42d7c7740c3',
    reference: '4.4.12',
    subsistenceCharge: 68400,
    description:
      'Low loss non-tidal abstraction of restricted water greater than 5,000 up to and including 16,667 megalitres a year, where a Tier 2 model applies.',
    shortDescription:
      'Low loss, non-tidal, restricted water, greater than 5,000 up to and including 16,667 ML/yr, Tier 2 model',
    tidal: false,
    lossFactor: 'low',
    modelTier: 'tier 2',
    restrictedSource: true,
    minVolume: 5000,
    maxVolume: 16667
  },
  {
    id: '4875cd10-94e6-4fcd-87f0-9e7a242f8277',
    reference: '4.4.13',
    subsistenceCharge: 116200,
    description:
      'Low loss non-tidal abstraction of water greater than 16,667 up to and including 28,333 megalitres a year where no model applies.',
    shortDescription: 'Low loss, non-tidal, greater than 16,667 up to and including 28,333 ML/yr',
    tidal: false,
    lossFactor: 'low',
    modelTier: 'no model',
    restrictedSource: false,
    minVolume: 16667,
    maxVolume: 28333
  },
  {
    id: 'bb1eea11-c74d-4770-98a9-db8f5d7b5ac0',
    reference: '4.3.40',
    subsistenceCharge: 336532800,
    description: 'High loss tidal abstraction of water greater than 500,000 megalitres a year, where no model applies',
    shortDescription: 'High loss, tidal, greater than 500,000 ML/yr',
    tidal: true,
    lossFactor: 'high',
    modelTier: 'no model',
    restrictedSource: false,
    minVolume: 500000,
    maxVolume: 1000000000000000
  },
  {
    id: '407e0ee6-baf8-412a-a420-1b8b8179a484',
    reference: '4.3.41',
    subsistenceCharge: 353223900,
    description:
      'High loss tidal abstraction of water greater than 500,000 megalitres a year, where a Tier 1 model applies',
    shortDescription: 'High loss, tidal, greater than 500,000 ML/yr, Tier 1 model',
    tidal: true,
    lossFactor: 'high',
    modelTier: 'tier 1',
    restrictedSource: false,
    minVolume: 500000,
    maxVolume: 1000000000000000
  },
  {
    id: '749bb29c-2613-4bd0-ae44-ae54b806b907',
    reference: '4.3.42',
    subsistenceCharge: 382483400,
    description:
      'High loss tidal abstraction of water greater than 500,000 megalitres a year, where a Tier 2 model applies',
    shortDescription: 'High loss, tidal, greater than 500,000 ML/yr, Tier 2 model',
    tidal: true,
    lossFactor: 'high',
    modelTier: 'tier 2',
    restrictedSource: false,
    minVolume: 500000,
    maxVolume: 1000000000000000
  },
  {
    id: 'f1afb1b7-e2a8-4987-8f2b-324d5cd67413',
    reference: '4.4.1',
    subsistenceCharge: 9700,
    description:
      'Low loss non-tidal abstraction of water up to and including 5,000 megalitres a year where no model applies.',
    shortDescription: 'Low loss, non-tidal, up to and including 5,000 ML/yr',
    tidal: false,
    lossFactor: 'low',
    modelTier: 'no model',
    restrictedSource: false,
    minVolume: 0,
    maxVolume: 5000
  },
  {
    id: '81a8be5e-2d8e-4989-a62f-0f4a002a9bcc',
    reference: '4.4.2',
    subsistenceCharge: 10200,
    description:
      'Low loss non-tidal abstraction of water up to and including 5,000 megalitres a year where a Tier 1 model applies.',
    shortDescription: 'Low loss, non-tidal, up to and including 5,000 ML/yr, Tier 1 model',
    tidal: false,
    lossFactor: 'low',
    modelTier: 'tier 1',
    restrictedSource: false,
    minVolume: 0,
    maxVolume: 5000
  },
  {
    id: 'b75c9590-7923-4af5-ba68-c5681868a47e',
    reference: '4.4.3',
    subsistenceCharge: 11000,
    description:
      'Low loss non-tidal abstraction of water up to and including 5,000 megalitres a year, where a Tier 2 model applies.',
    shortDescription: 'Low loss, non-tidal, up to and including 5,000 ML/yr, Tier 2 model',
    tidal: false,
    lossFactor: 'low',
    modelTier: 'tier 2',
    restrictedSource: false,
    minVolume: 0,
    maxVolume: 5000
  },
  {
    id: 'c83c3d13-19cb-4a2f-8e5b-9422b230b52a',
    reference: '4.4.4',
    subsistenceCharge: 11500,
    description:
      'Low loss non-tidal abstraction of restricted water up to and including 5,000 megalitres a year, where no model applies.',
    shortDescription: 'Low loss, non-tidal, restricted water, up to and including 5,000 ML/yr',
    tidal: false,
    lossFactor: 'low',
    modelTier: 'no model',
    restrictedSource: true,
    minVolume: 0,
    maxVolume: 5000
  },
  {
    id: 'bd244215-8522-4efe-8394-663e10a2598f',
    reference: '4.4.5',
    subsistenceCharge: 12000,
    description:
      'Low loss non-tidal abstraction of restricted water up to and including 5,000 megalitres a year, where a Tier 1 model applies.',
    shortDescription: 'Low loss, non-tidal, restricted water, up to and including 5,000 ML/yr, Tier 1 model',
    tidal: false,
    lossFactor: 'low',
    modelTier: 'tier 1',
    restrictedSource: true,
    minVolume: 0,
    maxVolume: 5000
  },
  {
    id: '49c7cc3e-db41-4f93-8833-d8604a13c166',
    reference: '4.4.6',
    subsistenceCharge: 12800,
    description:
      'Low loss non-tidal abstraction of restricted water up to and including 5,000 megalitres a year, where a Tier 2 model applies.',
    shortDescription: 'Low loss, non-tidal, restricted water, up to and including 5,000 ML/yr, Tier 2 model',
    tidal: false,
    lossFactor: 'low',
    modelTier: 'tier 2',
    restrictedSource: true,
    minVolume: 0,
    maxVolume: 5000
  },
  {
    id: '989aff96-23b1-43db-a2b4-db551c87e548',
    reference: '4.4.14',
    subsistenceCharge: 122000,
    description:
      'Low loss non-tidal abstraction of water greater than 16,667 up to and including 28,333 megalitres a year where a Tier 1 model applies.',
    shortDescription: 'Low loss, non-tidal, greater than 16,667 up to and including 28,333 ML/yr, Tier 1 model',
    tidal: false,
    lossFactor: 'low',
    modelTier: 'tier 1',
    restrictedSource: false,
    minVolume: 16667,
    maxVolume: 28333
  },
  {
    id: '898abb0f-b501-437b-b0a0-d7169a98555d',
    reference: '4.4.15',
    subsistenceCharge: 132100,
    description:
      'Low loss non-tidal abstraction of water greater than 16,667 up to and including 28,333 megalitres a year where a Tier 2 model applies.',
    shortDescription: 'Low loss, non-tidal, greater than 16,667 up to and including 28,333 ML/yr, Tier 2 model',
    tidal: false,
    lossFactor: 'low',
    modelTier: 'tier 2',
    restrictedSource: false,
    minVolume: 16667,
    maxVolume: 28333
  },
  {
    id: 'e3b064e0-83bb-421e-999a-caf2616bbe94',
    reference: '4.4.16',
    subsistenceCharge: 138000,
    description:
      'Low loss non-tidal abstraction of restricted water greater than 16,667 up to and including 28,333 megalitres a year, where no model applies.',
    shortDescription: 'Low loss, non-tidal, restricted water, greater than 16,667 up to and including 28,333 ML/yr',
    tidal: false,
    lossFactor: 'low',
    modelTier: 'no model',
    restrictedSource: true,
    minVolume: 16667,
    maxVolume: 28333
  },
  {
    id: 'b27dd4b5-8926-4c85-9e46-986b24eb7bc1',
    reference: '4.4.17',
    subsistenceCharge: 143800,
    description:
      'Low loss non-tidal abstraction of restricted water greater than 16,667 up to and including 28,333 megalitres a year, where a Tier 1 model applies.',
    shortDescription:
      'Low loss, non-tidal, restricted water, greater than 16,667 up to and including 28,333 ML/yr, Tier 1 model',
    tidal: false,
    lossFactor: 'low',
    modelTier: 'tier 1',
    restrictedSource: true,
    minVolume: 16667,
    maxVolume: 28333
  },
  {
    id: 'ad8aaf41-92de-4af2-9f62-18af777e0d6a',
    reference: '4.4.18',
    subsistenceCharge: 153900,
    description:
      'Low loss non-tidal abstraction of restricted water greater than 16,667 up to and including 28,333 megalitres a year, where a Tier 2 model applies.',
    shortDescription:
      'Low loss, non-tidal, restricted water, greater than 16,667 up to and including 28,333 ML/yr, Tier 2 model',
    tidal: false,
    lossFactor: 'low',
    modelTier: 'tier 2',
    restrictedSource: true,
    minVolume: 16667,
    maxVolume: 28333
  },
  {
    id: 'a50abcd5-31cd-40f1-92d4-603944ac4204',
    reference: '4.4.19',
    subsistenceCharge: 178300,
    description:
      'Low loss non-tidal abstraction of water greater than 28,333 up to and including 40,000 megalitres a year where no model applies.',
    shortDescription: 'Low loss, non-tidal, greater than 28,333 up to and including 40,000 ML/yr',
    tidal: false,
    lossFactor: 'low',
    modelTier: 'no model',
    restrictedSource: false,
    minVolume: 28333,
    maxVolume: 40000
  },
  {
    id: '9a15bbef-33bf-48d9-b68e-d8a5176de449',
    reference: '4.4.20',
    subsistenceCharge: 187100,
    description:
      'Low loss non-tidal abstraction of water greater than 28,333 up to and including 40,000 megalitres a year where a Tier 1 model applies.',
    shortDescription: 'Low loss, non-tidal, greater than 28,333 up to and including 40,000 ML/yr, Tier 1 model',
    tidal: false,
    lossFactor: 'low',
    modelTier: 'tier 1',
    restrictedSource: false,
    minVolume: 28333,
    maxVolume: 40000
  },
  {
    id: '0ad65e94-cd67-44b8-8e27-bc3eeb2f7962',
    reference: '4.4.21',
    subsistenceCharge: 202700,
    description:
      'Low loss non-tidal abstraction of water greater than 28,333 up to and including 40,000 megalitres a year where a Tier 2 model applies.',
    shortDescription: 'Low loss, non-tidal, greater than 28,333 up to and including 40,000 ML/yr, Tier 2 model',
    tidal: false,
    lossFactor: 'low',
    modelTier: 'tier 2',
    restrictedSource: false,
    minVolume: 28333,
    maxVolume: 40000
  },
  {
    id: '48a7df55-317a-4e43-966d-1d46a1a43e42',
    reference: '4.4.22',
    subsistenceCharge: 211700,
    description:
      'Low loss non-tidal abstraction of restricted water greater than 28,333 up to and including 40,000 megalitres a year, where no model applies.',
    shortDescription: 'Low loss, non-tidal, restricted water, greater than 28,333 up to and including 40,000 ML/yr',
    tidal: false,
    lossFactor: 'low',
    modelTier: 'no model',
    restrictedSource: true,
    minVolume: 28333,
    maxVolume: 40000
  },
  {
    id: '199a145a-6d17-4498-9770-37be4dd2a053',
    reference: '4.4.30',
    subsistenceCharge: 382500,
    description:
      'Low loss non-tidal abstraction of restricted water greater than 40,000 up to and including 73,333 megalitres a year, where a Tier 2 model applies.',
    shortDescription:
      'Low loss, non-tidal, restricted water, greater than 40,000 up to and including 73,333 ML/yr, Tier 2 model',
    tidal: false,
    lossFactor: 'low',
    modelTier: 'tier 2',
    restrictedSource: true,
    minVolume: 40000,
    maxVolume: 73333
  },
  {
    id: 'd3ad6c7d-6f64-47cf-83db-f27bcfee7625',
    reference: '4.4.31',
    subsistenceCharge: 525800,
    description:
      'Low loss non-tidal abstraction of water greater than 73,333 up to and including 133,333 megalitres a year where no model applies.',
    shortDescription: 'Low loss, non-tidal, greater than 73,333 up to and including 133,333 ML/yr',
    tidal: false,
    lossFactor: 'low',
    modelTier: 'no model',
    restrictedSource: false,
    minVolume: 73333,
    maxVolume: 133333
  },
  {
    id: '6c9e7612-e280-4f40-a984-6dfbd8b0aede',
    reference: '4.4.32',
    subsistenceCharge: 551900,
    description:
      'Low loss non-tidal abstraction of water greater than 73,333 up to and including 133,333 megalitres a year where a Tier 1 model applies.',
    shortDescription: 'Low loss, non-tidal, greater than 73,333 up to and including 133,333 ML/yr, Tier 1 model',
    tidal: false,
    lossFactor: 'low',
    modelTier: 'tier 1',
    restrictedSource: false,
    minVolume: 73333,
    maxVolume: 133333
  },
  {
    id: '069c4997-8277-401c-b5c4-bbc347a119c3',
    reference: '4.4.33',
    subsistenceCharge: 597600,
    description:
      'Low loss non-tidal abstraction of water greater than 73,333 up to and including 133,333 megalitres a year where a Tier 2 model applies.',
    shortDescription: 'Low loss, non-tidal, greater than 73,333 up to and including 133,333 ML/yr, Tier 2 model',
    tidal: false,
    lossFactor: 'low',
    modelTier: 'tier 2',
    restrictedSource: false,
    minVolume: 73333,
    maxVolume: 133333
  },
  {
    id: 'd7929105-8c2e-47d9-a75e-8d63bafea044',
    reference: '4.4.34',
    subsistenceCharge: 624400,
    description:
      'Low loss non-tidal abstraction of restricted water greater than 73,333 up to and including 133,333 megalitres a year, where no model applies.',
    shortDescription: 'Low loss, non-tidal, restricted water, greater than 73,333 up to and including 133,333 ML/yr',
    tidal: false,
    lossFactor: 'low',
    modelTier: 'no model',
    restrictedSource: true,
    minVolume: 73333,
    maxVolume: 133333
  },
  {
    id: '8afc2cf0-0ca1-4a06-8837-aa6337efaa51',
    reference: '4.4.35',
    subsistenceCharge: 650500,
    description:
      'Low loss non-tidal abstraction of restricted water greater than 73,333 up to and including 133,333 megalitres a year, where a Tier 1 model applies.',
    shortDescription:
      'Low loss, non-tidal, restricted water, greater than 73,333 up to and including 133,333 ML/yr, Tier 1 model',
    tidal: false,
    lossFactor: 'low',
    modelTier: 'tier 1',
    restrictedSource: true,
    minVolume: 73333,
    maxVolume: 133333
  },
  {
    id: 'a9210892-c599-492e-8ed2-8ac302388fff',
    reference: '4.4.23',
    subsistenceCharge: 220500,
    description:
      'Low loss non-tidal abstraction of restricted water greater than 28,333 up to and including 40,000 megalitres a year, where a Tier 1 model applies.',
    shortDescription:
      'Low loss, non-tidal, restricted water, greater than 28,333 up to and including 40,000 ML/yr, Tier 1 model',
    tidal: false,
    lossFactor: 'low',
    modelTier: 'tier 1',
    restrictedSource: true,
    minVolume: 28333,
    maxVolume: 40000
  },
  {
    id: '867060b0-4923-41f9-a827-81d6e7bdf311',
    reference: '4.4.24',
    subsistenceCharge: 236100,
    description:
      'Low loss non-tidal abstraction of restricted water greater than 28,333 up to and including 40,000 megalitres a year, where a Tier 2 model applies.',
    shortDescription:
      'Low loss, non-tidal, restricted water, greater than 28,333 up to and including 40,000 ML/yr, Tier 2 model',
    tidal: false,
    lossFactor: 'low',
    modelTier: 'tier 2',
    restrictedSource: true,
    minVolume: 28333,
    maxVolume: 40000
  },
  {
    id: 'd4ecd560-2c11-4d0b-893a-725d0a6670f9',
    reference: '4.4.25',
    subsistenceCharge: 288900,
    description:
      'Low loss non-tidal abstraction of water greater than 40,000 up to and including 73,333 megalitres a year where no model applies.',
    shortDescription: 'Low loss, non-tidal, greater than 40,000 up to and including 73,333 ML/yr',
    tidal: false,
    lossFactor: 'low',
    modelTier: 'no model',
    restrictedSource: false,
    minVolume: 40000,
    maxVolume: 73333
  },
  {
    id: 'b202f1fb-259c-41e1-8d57-28c5f381a948',
    reference: '4.4.26',
    subsistenceCharge: 303200,
    description:
      'Low loss non-tidal abstraction of water greater than 40,000 up to and including 73,333 megalitres a year where a Tier 1 model applies.',
    shortDescription: 'Low loss, non-tidal, greater than 40,000 up to and including 73,333 ML/yr, Tier 1 model',
    tidal: false,
    lossFactor: 'low',
    modelTier: 'tier 1',
    restrictedSource: false,
    minVolume: 40000,
    maxVolume: 73333
  },
  {
    id: '695ce228-565f-49d0-9bd3-a2955be4568d',
    reference: '4.4.27',
    subsistenceCharge: 328300,
    description:
      'Low loss non-tidal abstraction of water greater than 40,000 up to and including 73,333 megalitres a year where a Tier 2 model applies.',
    shortDescription: 'Low loss, non-tidal, greater than 40,000 up to and including 73,333 ML/yr, Tier 2 model',
    tidal: false,
    lossFactor: 'low',
    modelTier: 'tier 2',
    restrictedSource: false,
    minVolume: 40000,
    maxVolume: 73333
  },
  {
    id: 'fa563d95-d3b5-464c-ada6-806831ab94bd',
    reference: '4.4.28',
    subsistenceCharge: 343100,
    description:
      'Low loss non-tidal abstraction of restricted water greater than 40,000 up to and including 73,333 megalitres a year, where no model applies.',
    shortDescription: 'Low loss, non-tidal, restricted water, greater than 40,000 up to and including 73,333 ML/yr',
    tidal: false,
    lossFactor: 'low',
    modelTier: 'no model',
    restrictedSource: true,
    minVolume: 40000,
    maxVolume: 73333
  },
  {
    id: 'a85637df-bee6-471e-b1cb-d3954b8a8585',
    reference: '4.4.29',
    subsistenceCharge: 357400,
    description:
      'Low loss non-tidal abstraction of restricted water greater than 40,000 up to and including 73,333 megalitres a year, where a Tier 1 model applies.',
    shortDescription:
      'Low loss, non-tidal, restricted water, greater than 40,000 up to and including 73,333 ML/yr, Tier 1 model',
    tidal: false,
    lossFactor: 'low',
    modelTier: 'tier 1',
    restrictedSource: true,
    minVolume: 40000,
    maxVolume: 73333
  },
  {
    id: 'd48829bf-7a3f-4fda-8c28-e8f21a9eba7b',
    reference: '4.4.39',
    subsistenceCharge: 1129500,
    description:
      'Low loss non-tidal abstraction of water greater than 133,333 up to and including 250,000 megalitres a year where a Tier 2 model applies.',
    shortDescription: 'Low loss, non-tidal, greater than 133,333 up to and including 250,000 ML/yr, Tier 2 model',
    tidal: false,
    lossFactor: 'low',
    modelTier: 'tier 2',
    restrictedSource: false,
    minVolume: 133333,
    maxVolume: 250000
  },
  {
    id: 'cc7fbd1a-3e1e-4451-bbfe-ce90e8d7d11b',
    reference: '4.4.40',
    subsistenceCharge: 1180100,
    description:
      'Low loss non-tidal abstraction of restricted water greater than 133,333 up to and including 250,000 megalitres a year, where no model applies.',
    shortDescription: 'Low loss, non-tidal, restricted water, greater than 133,333 up to and including 250,000 ML/yr',
    tidal: false,
    lossFactor: 'low',
    modelTier: 'no model',
    restrictedSource: true,
    minVolume: 133333,
    maxVolume: 250000
  },
  {
    id: '3b3412d9-1430-4d21-b856-89c65e171037',
    reference: '4.4.41',
    subsistenceCharge: 1229400,
    description:
      'Low loss non-tidal abstraction of restricted water greater than 133,333 up to and including 250,000 megalitres a year, where a Tier 1 model applies.',
    shortDescription:
      'Low loss, non-tidal, restricted water, greater than 133,333 up to and including 250,000 ML/yr, Tier 1 model',
    tidal: false,
    lossFactor: 'low',
    modelTier: 'tier 1',
    restrictedSource: true,
    minVolume: 133333,
    maxVolume: 250000
  },
  {
    id: 'a57f9844-85c1-4938-9177-78dcce93a720',
    reference: '4.4.36',
    subsistenceCharge: 696200,
    description:
      'Low loss non-tidal abstraction of restricted water greater than 73,333 up to and including 133,333 megalitres a year, where a Tier 2 model applies.',
    shortDescription:
      'Low loss, non-tidal, restricted water, greater than 73,333 up to and including 133,333 ML/yr, Tier 2 model',
    tidal: false,
    lossFactor: 'low',
    modelTier: 'tier 2',
    restrictedSource: true,
    minVolume: 73333,
    maxVolume: 133333
  },
  {
    id: 'c8f1d82c-67e2-4239-9111-ebb6d0ff87ce',
    reference: '4.4.37',
    subsistenceCharge: 993800,
    description:
      'Low loss non-tidal abstraction of water greater than 133,333 up to and including 250,000 megalitres a year where no model applies.',
    shortDescription: 'Low loss, non-tidal, greater than 133,333 up to and including 250,000 ML/yr',
    tidal: false,
    lossFactor: 'low',
    modelTier: 'no model',
    restrictedSource: false,
    minVolume: 133333,
    maxVolume: 250000
  },
  {
    id: 'e4ed4433-4bcd-4954-bbb5-1016e2deff3b',
    reference: '4.4.38',
    subsistenceCharge: 1043100,
    description:
      'Low loss non-tidal abstraction of water greater than 133,333 up to and including 250,000 megalitres a year where a Tier 1 model applies.',
    shortDescription: 'Low loss, non-tidal, greater than 133,333 up to and including 250,000 ML/yr, Tier 1 model',
    tidal: false,
    lossFactor: 'low',
    modelTier: 'tier 1',
    restrictedSource: false,
    minVolume: 133333,
    maxVolume: 250000
  },
  {
    id: 'cb641a01-27e7-48d5-84bf-05e3406953d2',
    reference: '4.4.42',
    subsistenceCharge: 1315800,
    description:
      'Low loss non-tidal abstraction of restricted water greater than 133,333 up to and including 250,000 megalitres a year, where a Tier 2 model applies.',
    shortDescription:
      'Low loss, non-tidal, restricted water, greater than 133,333 up to and including 250,000 ML/yr, Tier 2 model',
    tidal: false,
    lossFactor: 'low',
    modelTier: 'tier 2',
    restrictedSource: true,
    minVolume: 133333,
    maxVolume: 250000
  },
  {
    id: '09c507df-4ce0-4743-9bfb-d08fea9e55b8',
    reference: '4.4.43',
    subsistenceCharge: 1843700,
    description:
      'Low loss non-tidal abstraction of water greater than 250,000 up to and including 466,667 megalitres a year where no model applies.',
    shortDescription: 'Low loss, non-tidal, greater than 250,000 up to and including 466,667 ML/yr',
    tidal: false,
    lossFactor: 'low',
    modelTier: 'no model',
    restrictedSource: false,
    minVolume: 250000,
    maxVolume: 466667
  },
  {
    id: '81ef47b5-766e-4684-9f32-720201036927',
    reference: '4.4.44',
    subsistenceCharge: 1935100,
    description:
      'Low loss non-tidal abstraction of water greater than 250,000 up to and including 466,667 megalitres a year where a Tier 1 model applies.',
    shortDescription: 'Low loss, non-tidal, greater than 250,000 up to and including 466,667 ML/yr, Tier 1 model',
    tidal: false,
    lossFactor: 'low',
    modelTier: 'tier 1',
    restrictedSource: false,
    minVolume: 250000,
    maxVolume: 466667
  },
  {
    id: '7ba57bec-cc17-4e67-8360-9f9b70bbf58a',
    reference: '4.4.45',
    subsistenceCharge: 2095500,
    description:
      'Low loss non-tidal abstraction of water greater than 250,000 up to and including 466,667 megalitres a year where a Tier 2 model applies.',
    shortDescription: 'Low loss, non-tidal, greater than 250,000 up to and including 466,667 ML/yr, Tier 2 model',
    tidal: false,
    lossFactor: 'low',
    modelTier: 'tier 2',
    restrictedSource: false,
    minVolume: 250000,
    maxVolume: 466667
  },
  {
    id: '2155bfed-eec6-4fae-a08e-01f9a461b67c',
    reference: '4.4.46',
    subsistenceCharge: 2189400,
    description:
      'Low loss non-tidal abstraction of restricted water greater than 250,000 up to and including 466,667 megalitres a year, where no model applies.',
    shortDescription: 'Low loss, non-tidal, restricted water, greater than 250,000 up to and including 466,667 ML/yr',
    tidal: false,
    lossFactor: 'low',
    modelTier: 'no model',
    restrictedSource: true,
    minVolume: 250000,
    maxVolume: 466667
  },
  {
    id: '35a5acc6-97ab-4693-9065-f5ea6387ea8d',
    reference: '4.4.47',
    subsistenceCharge: 2280800,
    description:
      'Low loss non-tidal abstraction of restricted water greater than 250,000 up to and including 466,667 megalitres a year, where a Tier 1 model applies.',
    shortDescription:
      'Low loss, non-tidal, restricted water, greater than 250,000 up to and including 466,667 ML/yr, Tier 1 model',
    tidal: false,
    lossFactor: 'low',
    modelTier: 'tier 1',
    restrictedSource: true,
    minVolume: 250000,
    maxVolume: 466667
  },
  {
    id: 'e52a2a3a-3848-4436-8c47-f6441bef7546',
    reference: '4.4.48',
    subsistenceCharge: 2441200,
    description:
      'Low loss non-tidal abstraction of restricted water greater than 250,000 up to and including 466,667 megalitres a year, where a Tier 2 model applies.',
    shortDescription:
      'Low loss, non-tidal, restricted water, greater than 250,000 up to and including 466,667 ML/yr, Tier 2 model',
    tidal: false,
    lossFactor: 'low',
    modelTier: 'tier 2',
    restrictedSource: true,
    minVolume: 250000,
    maxVolume: 466667
  }
]

module.exports = {
  data
}
