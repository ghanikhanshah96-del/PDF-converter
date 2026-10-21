/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS test harness with mocked server dependencies. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function load(file, mocks) {
 const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const exports={};vm.runInNewContext(code,{exports,require:name=>name in mocks?mocks[name]:require(name),Request,Response,URL,console,process});return exports;
}
const policy=load('lib/review-policy.ts',{});
function fixture(gate={ok:true,session:{username:'test-admin'}}) {
 const calls=[];
 const route=load('app/api/admin/reviews/[id]/route.ts',{
  'next/server':{NextResponse:{json:(data,options)=>Response.json(data,options)}},
  '@/lib/auth':{requirePermission:async permission=>{assert.equal(permission,'reviews');return gate;}},
  '@/lib/reviews-repo':{updateReview:async(...args)=>{calls.push(['edit',...args]);return true;},deleteReview:async(...args)=>{calls.push(['delete',...args]);return true;}},
 });
 const context={params:Promise.resolve({id:'rv_test'})};
 const body={name:'Customer',rating:5,comment:'Helpful tool',tool:'Merge PDF',published:true};
 const request=(data=body,origin='http://localhost')=>new Request('http://localhost/api/admin/reviews/rv_test',{method:'PATCH',headers:{origin},body:JSON.stringify(data)});
 return {route,context,request,body,calls};
}

test('edit and delete require authenticated review permissions',async()=>{
 for(const status of [401,403]){const f=fixture({ok:false,status});assert.equal((await f.route.PATCH(f.request(),f.context)).status,status);assert.equal((await f.route.DELETE(f.request(),f.context)).status,status);assert.equal(f.calls.length,0);}
});
test('low ratings cannot be published through admin editing',async()=>{
 const f=fixture();for(const rating of [1,2,3])assert.equal((await f.route.PATCH(f.request({...f.body,rating}),f.context)).status,400);assert.equal(f.calls.length,0);
});
test('invalid edit fields and foreign origins are rejected before writing',async()=>{
 const f=fixture();for(const change of [{name:''},{rating:6},{rating:2.5},{comment:' '},{comment:'x'.repeat(281)},{tool:'x'.repeat(81)},{published:'true'}])assert.equal((await f.route.PATCH(f.request({...f.body,...change}),f.context)).status,400);
 assert.equal((await f.route.PATCH(f.request(f.body,'https://another.example'),f.context)).status,403);assert.equal((await f.route.DELETE(f.request(f.body,'https://another.example'),f.context)).status,403);assert.equal(f.calls.length,0);
});
test('authorized edits trim fields and capture the current admin',async()=>{
 const f=fixture();assert.equal((await f.route.PATCH(f.request({...f.body,name:' Customer ',comment:' Updated ',tool:' Merge PDF '}),f.context)).status,200);assert.equal(f.calls[0][1],'rv_test');assert.equal(f.calls[0][2].comment,'Updated');assert.equal(f.calls[0][3],'test-admin');assert.equal((await f.route.DELETE(f.request(),f.context)).status,200);assert.equal(f.calls[1][0],'delete');
});
test('review mutations return 404 for a missing review',async()=>{
 const route=load('app/api/admin/reviews/[id]/route.ts',{'next/server':{NextResponse:{json:(data,options)=>Response.json(data,options)}},'@/lib/auth':{requirePermission:async()=>({ok:true,session:{username:'admin'}})},'@/lib/reviews-repo':{updateReview:async()=>false,deleteReview:async()=>false}});
 const f=fixture();assert.equal((await route.PATCH(f.request(),f.context)).status,404);assert.equal((await route.DELETE(f.request(),f.context)).status,404);
});
test('edits preserve original feedback and email history; deletion removes the record',async()=>{
 let stored={name:'Original customer',rating:2,comment:'Original feedback',tool:'PDF',published:false,notificationStatus:'sent'};
 const ref={};const db={collection:()=>({doc:()=>ref}),runTransaction:async callback=>callback({get:async()=>({exists:!!stored,data:()=>stored}),update:(_ref,fields)=>{stored={...stored,...fields};},delete:()=>{stored=null;}})};
 const repo=load('lib/reviews-repo.ts',{'@/lib/firebase-admin':{getDb:()=>db,isFirebaseAdminConfigured:()=>true},'@/lib/review-policy':policy});
 assert.equal(await repo.updateReview('rv_test',{name:'Updated',rating:2,comment:'Updated feedback',tool:'PDF',published:true},'admin'),true);assert.equal(stored.published,false);assert.equal(stored.originalReview.comment,'Original feedback');assert.equal(stored.notificationStatus,'sent');assert.equal(stored.updatedBy,'admin');
 await repo.updateReview('rv_test',{name:'Updated again',rating:5,comment:'Second edit',tool:'PDF',published:true},'admin');assert.equal(stored.originalReview.comment,'Original feedback');assert.equal(stored.published,true);
 assert.equal(await repo.deleteReview('rv_test'),true);assert.equal(stored,null);assert.equal(await repo.deleteReview('rv_test'),false);
});
