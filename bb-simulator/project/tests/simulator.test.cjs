const test=require('node:test'),assert=require('node:assert/strict');
require('../dist/simulator-model.js');const s=globalThis.BBSimulator;
test('crew faces, names and roles are one-to-one; BB leads from Cockpit',()=>{
 assert.equal(s.crew[0].name,'BB');assert.equal(s.crew[0].role,'Cockpit');
 assert.equal(new Set(s.crew.map(c=>c.name)).size,5);assert.equal(new Set(s.crew.map(c=>c.sprite)).size,5);
 assert.equal(s.crew.find(c=>c.name==='Kitty').member,3);assert.equal(s.crew.find(c=>c.name==='Tidy').member,2);
});
test('demo stops at BB approval in every production lane',()=>{
 for(const lane of ['video','content','scheduled']){const j=s.journey(lane),p=j.filter(x=>x.pause);assert.equal(p.length,1);assert.equal(p[0].owner,0);assert.equal(p[0].state,'Approval');assert(j.findIndex(x=>x.pause)<j.findIndex(x=>x.state==='Export'));assert.equal(j.at(-1).state,'Complete');}
});
test('dashboard counts real browser records for the selected brand only',()=>{
 const jobs=[{brand:{id:'beyond'}},{brand:{id:'yaadz'}},{}],refs=[{brandId:'yaadz'},{}];
 assert.deepEqual(s.metrics(jobs,refs,'beyond'),{jobs:2,references:1});assert.deepEqual(s.metrics(jobs,refs,'yaadz'),{jobs:1,references:1});assert.deepEqual(s.metrics([],[],'beyond'),{jobs:0,references:0});
});
test('all character hit targets stay inside the portrait scene',()=>{
 for(const c of s.crew){assert(c.x>15&&c.x<85);assert(c.y>10&&c.y<95)}
});
