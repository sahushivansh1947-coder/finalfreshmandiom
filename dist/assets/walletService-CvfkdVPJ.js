import{c as o,k as c}from"./index-KK4MHg2U.js";/**
 * @license lucide-react v0.564.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const l=[["path",{d:"M10 12h4",key:"a56b0p"}],["path",{d:"M10 8h4",key:"1sr2af"}],["path",{d:"M14 21v-3a2 2 0 0 0-4 0v3",key:"1rgiei"}],["path",{d:"M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2",key:"secmi2"}],["path",{d:"M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16",key:"16ra0t"}]],f=o("building-2",l);/**
 * @license lucide-react v0.564.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const d=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]],k=o("circle-check",d);/**
 * @license lucide-react v0.564.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const h=[["path",{d:"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8",key:"5wwlr5"}],["path",{d:"M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",key:"r6nss1"}]],_=o("house",h);/**
 * @license lucide-react v0.564.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const w=[["path",{d:"M10 18v-7",key:"wt116b"}],["path",{d:"M11.12 2.198a2 2 0 0 1 1.76.006l7.866 3.847c.476.233.31.949-.22.949H3.474c-.53 0-.695-.716-.22-.949z",key:"1m329m"}],["path",{d:"M14 18v-7",key:"vav6t3"}],["path",{d:"M18 18v-7",key:"aexdmj"}],["path",{d:"M3 22h18",key:"8prr45"}],["path",{d:"M6 18v-7",key:"1ivflk"}]],b=o("landmark",w);/**
 * @license lucide-react v0.564.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const y=[["path",{d:"M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1",key:"18etb6"}],["path",{d:"M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4",key:"xoc0q4"}]],v=o("wallet",y),i={getBalance:async t=>{try{const{data:a,error:e}=await c.database.from("users").select("wallet_balance").eq("id",t).single();if(e)throw e;return(a==null?void 0:a.wallet_balance)||0}catch(a){return console.error("Error fetching balance:",a),0}},getTransactions:async t=>{try{const{data:a,error:e}=await c.database.from("wallet_transactions").select("*").eq("user_id",t).order("created_at",{ascending:!1});if(e)throw e;return a||[]}catch(a){return console.error("Error fetching transactions:",a),[]}},payWithWallet:async(t,a,e)=>{try{const r=await i.getBalance(t);if(r<a)throw new Error("Insufficient wallet balance");const{error:n}=await c.database.from("users").update({wallet_balance:r-a}).eq("id",t);if(n)throw n;const{error:s}=await c.database.from("wallet_transactions").insert([{user_id:t,amount:a,type:"Debit",description:e,created_at:new Date().toISOString()}]);if(s)throw s;return!0}catch(r){throw console.error("Wallet payment failed:",r),r}},addMoney:async(t,a)=>{try{const e=await i.getBalance(t),{error:r}=await c.database.from("users").update({wallet_balance:e+a}).eq("id",t);if(r)throw r;return await c.database.from("wallet_transactions").insert([{user_id:t,amount:a,type:"Credit",description:"Wallet Top-up",created_at:new Date().toISOString()}]),!0}catch(e){throw console.error("Add money failed:",e),e}}};export{f as B,k as C,_ as H,b as L,v as W,i as w};
