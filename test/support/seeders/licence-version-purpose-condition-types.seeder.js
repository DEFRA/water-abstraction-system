'use strict'

/**
 * @module LicenceVersionPurposeConditionTypeSeeder
 */

const { db } = require('../../../db/db.js')

/**
 * Add all of the licence version purpose conditions to the database
 *
 */
async function seed () {
  await db.raw(`
    INSERT INTO water.licence_version_purpose_condition_types (licence_version_purpose_condition_type_id,code,subcode,description,subcode_description,date_created,date_updated,display_title) VALUES
  ('4c0b378d-a9c2-4b50-b1bd-9aeefe988f93','AGG','LLL','Aggregate','Licence To Licence; Link Between Licences','2024-07-04 16:00:17.997679','2024-07-04 16:00:17.997679','Aggregate condition link between licences'),
  ('69e08cfb-9fdd-4ba2-9cd3-e74f4c36f94f','AGG','LLX','Aggregate','Licence To Licence; Cross Regional Condition Link Between Licences','2024-07-04 16:00:17.997679','2024-07-04 16:00:17.997679','Aggregate condition cross regional link between licences'),
  ('4eac5d7e-21e4-475c-8108-3e0c2ece181f','AGG','LPL','Aggregate','Licence To Purpose; Link Between Different Licences','2024-07-04 16:00:17.997679','2024-07-04 16:00:17.997679','Aggregate condition licence to purpose between different licences'),
  ('f7f9604c-6c7b-43b0-a0a8-13ca1ed7dd73','AGG','PP','Aggregate','Purpose To Purpose; Link Within A Licence','2024-07-04 16:00:17.997679','2024-07-04 16:00:17.997679','Aggregate condition purpose to purpose within a licence'),
  ('379b6514-e714-4c17-9b91-957ea92c5ee4','AGG','PPL','Aggregate','Purpose To Purpose ; Link Between Different Licences','2024-07-04 16:00:17.997679','2024-07-04 16:00:17.997679','Aggregate condition purpose to purpose between different licences'),
  ('1a52a0b5-2dee-4006-b539-eb780ddb42d7','AGI','DIM','Additional Groundwater Information','Dimensions','2024-07-04 16:00:17.997679','2024-07-04 16:00:17.997679','Additional groundwater information dimensions'),
  ('da59a9c8-3a39-4e40-ad4a-db26118dc46f','BYPAS','FLOW','By-Pass Flow','Flow','2024-07-04 16:00:17.997679','2024-07-04 16:00:17.997679','By-pass flow'),
  ('c7b88fe7-b3df-41ae-844d-0e5e47e80d8a','CES','CHE','Cessation Condition','Chemical','2024-07-04 16:00:17.997679','2024-07-04 16:00:17.997679','Chemical cessation condition'),
  ('49ae5c07-19c4-485c-a1e0-a28be3e10290','CES','DEP','Cessation Condition','Dependent On Release From Schemes/Other Licences','2024-07-04 16:00:17.997679','2024-07-04 16:00:17.997679','Cessation dependant on releases from schemes / other licences'),
  ('540e2453-5741-4637-bfc5-57d76e2cecf9','CES','FLOW','Cessation Condition','Flow','2024-07-04 16:00:17.997679','2024-07-04 16:00:17.997679','Flow cessation condition');
INSERT INTO water.licence_version_purpose_condition_types (licence_version_purpose_condition_type_id,code,subcode,description,subcode_description,date_created,date_updated,display_title) VALUES
  ('5e06bb53-bd9d-47e4-86d0-dd56d1a2ed5b','CES','GWL','Cessation Condition','Groundwater Level','2024-07-04 16:00:17.997679','2024-07-04 16:00:17.997679','Groundwater level cessation condition'),
  ('abca0b8e-9745-4628-8a73-614d2df93977','CES','LEV','Cessation Condition','Level','2024-07-04 16:00:17.997679','2024-07-04 16:00:17.997679','Level cessation condition'),
  ('d8934dcd-6370-4424-9fc1-b9bbd5d06d6d','CES','POL','Cessation Condition','Political - Hosepipe Ban','2024-07-04 16:00:17.997679','2024-07-04 16:00:17.997679','Political cessation condition'),
  ('bb96e6f2-7883-41ce-9d15-fc07da82393b','COMB','LINK','Condition To Indicate Licence  Split On Nald','Link Between Split Licences','2024-07-04 16:00:17.997679','2024-07-04 16:00:17.997679','Link between split licences'),
  ('2984e051-8a71-4442-926a-dcbe1c6aa4da','COMP','GEN','Complex Condition','General','2024-07-04 16:00:17.997679','2024-07-04 16:00:17.997679','Complex condition'),
  ('6d4e0df8-1bd8-412c-8309-232359dd6af2','COMPR','FLOW','Compensation Release','Flow','2024-07-04 16:00:17.997679','2024-07-04 16:00:17.997679','Flow compensation release'),
  ('dad942a1-04c8-424e-b1b0-6c464ffed073','DEROG','CLAUS','Derogation','Derogation Clause','2024-07-04 16:00:17.997679','2024-07-04 16:00:17.997679','Derogation clause'),
  ('7596130e-65ec-48b7-bb79-10449bf847c7','EEL','REGS','Eel Regulations','Pass/Screen - Eel Regs SI3344','2024-07-04 16:00:17.997679','2024-07-04 16:00:17.997679','Fish pass/screen - eel regs SI3344'),
  ('79ce9e30-3f50-4437-a5f4-f614c4be980e','FILL','FILL','Filling/Emptying Clause','Filling/Emptying To Be Notified To Agency','2024-07-04 16:00:17.997679','2024-07-04 16:00:17.997679','Filling/emptying to be notified to Agency'),
  ('52e7cdb0-8499-41d5-84ca-e2fd872fa404','FILL','SEAS','Filling/Emptying Clause','Filling/Emptying Season Limited','2024-07-04 16:00:17.997679','2024-07-04 16:00:17.997679','Filling/emptying season limited');
INSERT INTO water.licence_version_purpose_condition_types (licence_version_purpose_condition_type_id,code,subcode,description,subcode_description,date_created,date_updated,display_title) VALUES
  ('dbaf32aa-dadc-495a-a440-303ca2b74043','INFLO','TYPE','Inflow Control','Control Type','2024-07-04 16:00:17.997679','2024-07-04 16:00:17.997679','Inflow control type'),
  ('173f909a-5a42-4fcd-945e-e65cae5d0257','INFLR','RATE','Inflow Rate','Rate','2024-07-04 16:00:17.997679','2024-07-04 16:00:17.997679','Inflow rate'),
  ('69b75fcf-979a-46cf-a520-ab3162177349','LINTY','TYPE','Type Of Lining','Type','2024-07-04 16:00:17.997679','2024-07-04 16:00:17.997679','Type of lining'),
  ('e7a03f97-3920-4c88-9dd3-cb9c0c3b8103','LOK','OFF','Lockable Structures Required','Locked','2024-07-04 16:00:17.997679','2024-07-04 16:00:17.997679','Lockable structures required'),
  ('3e08ac41-b719-4928-bc44-6a983a91497a','MAINT','FLOW','Maintained Flow','Flow','2024-07-04 16:00:17.997679','2024-07-04 16:00:17.997679','Maintained flow'),
  ('20ece354-b8c4-4e11-a5c4-4030acaffd44','MCOMP','MEANS','Means Of Compensation Flow Release','Means','2024-07-04 16:00:17.997679','2024-07-04 16:00:17.997679','Means of compensation flow release'),
  ('35d9aff6-233a-4e23-b882-6ec29ec6567f','NSQ','M3FN','Non Standard Quantities','Cubic Metres Per Fortnight','2024-07-04 16:00:17.997679','2024-07-04 16:00:17.997679','Non standard quantities cubic metres per fortnight'),
  ('59954d44-5e46-42e2-87f9-b8cc0f7b646a','NSQ','M3MO','Non Standard Quantities','Cubic Metres Per Month','2024-07-04 16:00:17.997679','2024-07-04 16:00:17.997679','Non standard quantities cubic metres per month'),
  ('ddf14927-9b41-40ac-8e6a-9e930643968e','NSQ','M3WK','Non Standard Quantities','Cubic Metres Per Week','2024-07-04 16:00:17.997679','2024-07-04 16:00:17.997679','Non standard quantities cubic metres per week'),
  ('f1f69f3d-3b41-4afb-a1ba-cf50b17945db','NSQ','PER','Non Standard Quantities','Text Defined Periodicity','2024-07-04 16:00:17.997679','2024-07-04 16:00:17.997679','Non standard quantities');
INSERT INTO water.licence_version_purpose_condition_types (licence_version_purpose_condition_type_id,code,subcode,description,subcode_description,date_created,date_updated,display_title) VALUES
  ('eb2c3a1c-d744-4bb7-9abb-5ca56d7ab194','OTH','GEN','Other Standard Conditions','General','2024-07-04 16:00:17.997679','2024-07-04 16:00:17.997679','General conditions'),
  ('4195c9d9-3587-404b-b1f8-713ae752f18a','PTAK','COMP','Proportional Take','Complex','2024-07-04 16:00:17.997679','2024-07-04 16:00:17.997679','Complex proportional take'),
  ('e9fb6ebf-67aa-47ae-b8c3-344cf3f886a7','PTAK','PCENT','Proportional Take','Percentage Take','2024-07-04 16:00:17.997679','2024-07-04 16:00:17.997679','Proportional percentage take'),
  ('a131f6ec-a36e-4eb4-98ec-cb23c92de519','PWS','WSL','Public Water Supply','Water Supply Licensee','2024-07-04 16:00:17.997679','2024-07-04 16:00:17.997679','Public water supply licensee'),
  ('0699414c-0dc8-4015-9a65-7327530ff31d','RAT','LPS','Rates','Litres Per Second','2024-07-04 16:00:17.997679','2024-07-04 16:00:17.997679','Rates litres per second'),
  ('ffa9fe37-fd43-4950-ab50-5787fdc8a2e6','RAT','M3D','Rates','M3 Per Day','2024-07-04 16:00:17.997679','2024-07-04 16:00:17.997679','Rates m3 per day'),
  ('5e20c28a-aa3d-4c69-a26d-ae7c84680348','RAT','M3M','Rates','M3 Per Month','2024-07-04 16:00:17.997679','2024-07-04 16:00:17.997679','Rates m3 per month'),
  ('e8ab0098-86b8-4479-bce2-a5df53b9f634','RAT','M3S','Rates','M3 Per Second','2024-07-04 16:00:17.997679','2024-07-04 16:00:17.997679','Rates m3 per second'),
  ('34ddefea-209a-468a-b3fd-50f5f7f291b0','S57','BANI','Spray Irrigation','Ban Imposed','2024-07-04 16:00:17.997679','2024-07-04 16:00:17.997679','Spray irrigation ban imposed'),
  ('adc8d3a8-2b20-4fa5-a4f4-c64d05b29317','S57','BANP','Spray Irrigation','Ban Proposed','2024-07-04 16:00:17.997679','2024-07-04 16:00:17.997679','Spray irrigation ban proposed');
INSERT INTO water.licence_version_purpose_condition_types (licence_version_purpose_condition_type_id,code,subcode,description,subcode_description,date_created,date_updated,display_title) VALUES
  ('b66671e4-1ac7-4c08-be11-5712f7a5b67c','TLTD','MINQ','Time Limited','Minimum Quantity','2024-07-04 16:00:17.997679','2024-07-04 16:00:17.997679','Time limited minimum quantity'),
  ('deaf47a9-9ee4-4e8e-ba86-03cab3948b9b','TLTD','SD','Time Limited','Self Destruct','2024-07-04 16:00:17.997679','2024-07-04 16:00:17.997679','Time limited self destruct'),
  ('f3e99a33-c239-4b42-9168-bfb69f78a4e3','TLTD','VAR','Time Limited','Variation','2024-07-04 16:00:17.997679','2024-07-04 16:00:17.997679','Time limited variation'),
  ('c2d5dac0-625a-40e2-81ad-1a26963ef55d','TLTD','LEVFL','Time Limited','Limited Extension of Validity - Full Licence Expiry','2024-07-04 16:00:17.997679','2024-07-04 16:00:17.997679','Time Limited Extension of Validity - Full Licence Expiry'),
  ('1f20c437-286f-4dc3-abe5-1374893057b9','TLTD','LEVTL','Time Limited','Limited Extension of Validity - Time Limited Variation','2024-07-04 16:00:17.997679','2024-07-04 16:00:17.997679','Time Limited Extension of Validity - Time Limited Variation'),
  ('9faef5f5-9ca3-475c-8b6e-85b926a58a58','TRA','TRAN','Transfer','Transfer','2024-07-04 16:00:17.997679','2024-07-04 16:00:17.997679','Transfer'),
  ('8824e1b9-9570-4306-9954-67db55067d8f','WLM','GW','Water Level Monitoring','Ground Water','2024-07-04 16:00:17.997679','2024-07-04 16:00:17.997679','Water level monitoring groundwater'),
  ('c26cfab1-e3be-43a6-a7b9-a9aa2e1244fa','WLM','SW','Water Level Monitoring','Surface Water','2024-07-04 16:00:17.997679','2024-07-04 16:00:17.997679','Water level monitoring surface water'),
  ('bc8f2f1f-56aa-4d6f-9ba4-c5f6e5b1aca0','WQM','GW','Water Quality Monitoring','Groundwater','2024-07-04 16:00:17.997679','2024-07-04 16:00:17.997679','Water quality monitoring groundwater'),
  ('b6a145dd-0643-4d60-8ec9-bea2eceacfc0','WQM','SW','Water Quality Monitoring','Surface Water','2024-07-04 16:00:17.997679','2024-07-04 16:00:17.997679','Water quality monitoring surface water');
INSERT INTO water.licence_version_purpose_condition_types (licence_version_purpose_condition_type_id,code,subcode,description,subcode_description,date_created,date_updated,display_title) VALUES
  ('8c2f662e-0be9-4834-8ac2-a5d9efdc03ac','WRT','PNT','Water Rights Trade','Traded Point','2024-07-04 16:00:17.997679','2024-07-04 16:00:17.997679','Water rights trade point'),
  ('71856a20-35b9-420d-b30e-52189647f3c5','WRT','PUR','Water Rights Trade','Traded Purpose','2024-07-04 16:00:17.997679','2024-07-04 16:00:17.997679','Water rights trade purpose'),
  ('5580610f-65a1-4c22-a412-53ee6b935ea2','WRT','QTY','Water Rights Trade','Traded Quantity','2024-07-04 16:00:17.997679','2024-07-04 16:00:17.997679','Water rights trade quantity'),
  ('6765cff9-33fa-4c1c-9e07-51a7d37e451a','XREG','PTS','Cross Regional Point','Licensed Point Falls Within Another Region','2024-07-04 16:00:17.997679','2024-07-04 16:00:17.997679','Licensed point falls within another region');`)
}

module.exports = {
  seed
}
