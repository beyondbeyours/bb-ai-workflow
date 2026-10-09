const test=require('node:test');
const assert=require('node:assert/strict');
require('../dist/workflow.js');
const w=globalThis.BBWorkflow;
test('a draft and an unverified approval cannot export or publish',()=>{
 const j=w.initial('content');assert.equal(w.exportAllowed(j),false);assert.equal(w.publishAllowed(j),false);
 j.approval={source:'canva',revision:1,verified:false};assert.equal(w.exportAllowed(j),false);
});
test('content requires Canva approval and Canva export of the same revision',()=>{
 const j=w.initial('content');j.approval={source:'canva',revision:1,verified:true};assert.equal(w.exportAllowed(j),true);assert.equal(w.publishAllowed(j),false);
 j.export={origin:'ai',revision:1,verified:true};assert.equal(w.publishAllowed(j),false);
 j.export={origin:'canva',revision:1,verified:true};assert.equal(w.publishAllowed(j),true);
 j.revision++;assert.equal(w.exportAllowed(j),false);assert.equal(w.publishAllowed(j),false);
});
test('CapCut work cannot reuse a Canva approval',()=>{
 const j=w.initial('video');j.approval={source:'canva',revision:1,verified:true};assert.equal(w.exportAllowed(j),false);
 j.approval.source='capcut';assert.equal(w.exportAllowed(j),true);
});
test('editor links reject scripts, lookalike domains and the wrong tool',()=>{
 for(const url of ['javascript:alert(1)','https://canva.com.evil.test/a','http://www.canva.com/a','https://www.capcut.com/a'])assert.equal(w.validEditorUrl('content',url),false);
 assert.equal(w.validEditorUrl('content','https://www.canva.com/design/test/edit'),true);
 assert.equal(w.validEditorUrl('video','https://www.capcut.com/project/test'),true);
});
test('all three lanes retain BB approval before export and publish',()=>{
 for(const lane of ['video','content','scheduled']){const steps=w.steps(lane);assert.equal(steps[5].owner,'BB');assert.equal(steps[5].title,'Approval');assert.equal(steps[6].title,'Export');assert.equal(steps[7].title,'Publish');}
});
