/* Equation illustrations for thesis sections 8.2–8.5. No microdata or fitted
   population simulation is included. Each component states its own inputs. */
(function () {
  'use strict';
  const COLORS = ['#1f497d', '#b9722d'];
  const $ = id => document.getElementById(id);
  const val = id => Number($(id).value);
  const fmt = (n, digits=0) => n.toLocaleString('en-GB', {minimumFractionDigits:digits,maximumFractionDigits:digits});
  const put = (id, text) => { $(id).textContent = text; };
  function softmax(values, scale) {
    const m = Math.max(...values), e = values.map(v => Math.exp((v-m)/scale));
    const total = e.reduce((a,b)=>a+b,0);
    return e.map(v=>v/total);
  }
  const sectors={bnc:{contribution:.22,abatement:.34},services:{contribution:.22,abatement:.5},retail:{contribution:.128,abatement:.71}};
  function regimeIncome(cost, premium, sector) {
    const {contribution,abatement}=sectors[sector];
    return [100*(1+premium)*(1-cost-contribution-.1*(1-abatement)),100*(1-cost)*.55*.9];
  }
  function regimeCutoff(premium, sector) {
    const {contribution,abatement}=sectors[sector];
    return 1-(1+premium)*(contribution+.1*(1-abatement))/(1+premium-.55*.9);
  }
  function certaintyEquivalent(sigma, volatility, wageShare) {
    // Simpson quadrature of a standard normal, at fixed mean income 100.
    // Normalization preserves the mean of the discretized entrepreneurial draw.
    const n=400, dz=16/n; let total=0,mean=0;
    const nodes=[];
    for(let i=0;i<=n;i++){
      const z=-8+i*dz;
      const weight=(i===0||i===n?1:i%2?4:2)*Math.exp(-z*z/2);
      const draw=Math.exp(volatility*z-volatility*volatility/2);
      nodes.push([weight,draw]);total+=weight;mean+=weight*draw;
    }
    mean/=total;let expected=0;
    const logCase=Math.abs(sigma-1)<1e-8;
    for(const [weight,draw] of nodes){
      const c=100*(wageShare+(1-wageShare)*draw/mean);
      expected+=weight*(logCase?Math.log(c):Math.pow(c,1-sigma));
    }
    expected/=total;
    return logCase?Math.exp(expected):Math.pow(expected,1/(1-sigma));
  }
  // Export the pure equations for numerical verification, independent of the UI.
  if(typeof module!=='undefined' && module.exports) module.exports={softmax,regimeIncome,regimeCutoff,certaintyEquivalent};
  if(typeof document==='undefined') return;
  if(!$('cap-explorer')) return;
  function chart(id, series, xMin, xMax, yMin, yMax, xLabel, yLabel, marker) {
    const width=Math.max(280,$(id).clientWidth);
    $(id).setAttribute('viewBox',`0 0 ${width} 300`);
    const left=48,right=width-15,top=32,bottom=246;
    const X=x=>left+(x-xMin)/(xMax-xMin)*(right-left);
    const Y=y=>bottom-(y-yMin)/(yMax-yMin)*(bottom-top);
    let s=`<text x="${left}" y="16">${yLabel}</text>`;
    for(let j=0;j<=4;j++) {
      const y=yMin+(yMax-yMin)*j/4;
      s+=`<line class="axis" x1="${left}" y1="${Y(y)}" x2="${right}" y2="${Y(y)}"/><text x="${left-9}" y="${Y(y)+4}" text-anchor="end">${fmt(y,yMax<=10?1:0)}</text>`;
      const x=xMin+(xMax-xMin)*j/4;
      s+=`<text x="${X(x)}" y="${bottom+22}" text-anchor="middle">${fmt(x,xMax<=2?1:0)}</text>`;
    }
    s+=`<text x="${(left+right)/2}" y="290" text-anchor="middle">${xLabel}</text>`;
    series.forEach((points,k)=>{
      s+=`<path stroke="${COLORS[k]}" d="${points.map(([x,y],i)=>`${i?'L':'M'}${X(x).toFixed(2)},${Y(y).toFixed(2)}`).join(' ')}"/>`;
    });
    if(marker){
      const x=X(marker.x);
      s+=`<line x1="${x}" y1="${top}" x2="${x}" y2="${bottom}" stroke="#9aa6b5" stroke-dasharray="4 5"/>`;
      marker.ys.forEach((y,k)=>{s+=`<circle cx="${x}" cy="${Y(y)}" r="5" fill="${COLORS[k]}" stroke="#ffffff" stroke-width="2"/>`;});
    }
    $(id).innerHTML=s;
  }
  function cap() {
    const retail=$('cap-sector').value==='retail';
    const old=retail?82800:33200,now=retail?170000:70000,mu=val('cap-return');
    const cap=(m,x)=>Math.min(3000,m/x);
    const xs=Array.from({length:141},(_,i)=>i+10);
    chart('cap-chart',[xs.map(x=>[x,cap(now,x)]),xs.map(x=>[x,cap(old,x)])],10,150,0,3000,'Hourly turnover (€)','Annual micro-eligible hours',{x:mu,ys:[cap(now,mu),cap(old,mu)]});
    put('cap-return-out',`€${fmt(mu)}`);
    put('cap-summary',`At €${fmt(mu)} per hour, the statutory cap moves from ${fmt(old/mu)} to ${fmt(now/mu)} annual hours. With the illustrative 3,000-hour time budget, the feasible maximum moves from ${fmt(cap(old,mu))} to ${fmt(cap(now,mu))} hours.`);
  }
  function regime() {
    const sector=$('regime-sector').value,cost=val('regime-cost'),premium=val('regime-premium')/100;
    const xs=Array.from({length:71},(_,i)=>i);
    const incomes=regimeIncome(cost/100,premium,sector),cutoff=100*regimeCutoff(premium,sector);
    chart('regime-chart',[0,1].map(k=>xs.map(x=>[x,regimeIncome(x/100,premium,sector)[k]])),0,70,0,100,'Operating costs (% of turnover)','Disposable income per €100 turnover',{x:cost,ys:incomes});
    put('regime-cost-out',`${fmt(cost)}%`);put('regime-premium-out',`${fmt(premium*100,1)}%`);
    const winner=incomes[0]>incomes[1]?'micro':'réel';
    put('regime-summary',`With €${fmt(cost)} of costs per €100 of turnover, disposable income is €${fmt(incomes[0],2)} under micro and €${fmt(incomes[1],2)} under réel. The financial advantage goes to ${winner}. The two are equal at a cost share of ${fmt(cutoff,1)}%. Above that share, deducting actual costs makes réel more attractive financially.`);
  }
  function risk() {
    const sigma=val('risk-sigma'),vol=val('risk-vol');
    const xs=Array.from({length:61},(_,i)=>i*.02);
    const hybrid=certaintyEquivalent(sigma,vol,.5),solo=certaintyEquivalent(sigma,vol,0);
    chart('risk-chart',[xs.map(x=>[x,certaintyEquivalent(sigma,x,.5)]),xs.map(x=>[x,certaintyEquivalent(sigma,x,0)])],0,1.2,0,110,'Log-income volatility σy','Certainty-equivalent income',{x:vol,ys:[hybrid,solo]});
    put('risk-sigma-out',fmt(sigma,2));put('risk-vol-out',fmt(vol,2));
    put('risk-summary',`For mean income of 100 in both cases, certainty-equivalent income is ${fmt(solo,1)} with business income alone and ${fmt(hybrid,1)} with half from a stable wage. ${sigma===0?'With no risk aversion, only mean income matters.':'The stable component reduces the utility cost of risk.'}`);
  }
  const states=['One wage job · W','Two wage jobs · WW','Wage + business · WSE','Business only · SE'];
  $('choice-bars').innerHTML=states.map((name,i)=>`<div class="choice-row"><span>${name}</span><div class="bar-track" aria-hidden="true"><div class="bar-fill" id="choice-bar-${i}"></div></div><span id="choice-value-${i}" class="choice-value"></span></div>`).join('');
  function choice() {
    const cost=val('choice-cost'),scale=val('choice-scale');
    const ps=softmax([3,4-cost,4.5-cost,3.5],scale);
    ps.forEach((p,i)=>{$(`choice-bar-${i}`).style.width=`${p*100}%`;put(`choice-value-${i}`,`${fmt(p*100,1)}%`);});
    put('choice-cost-out',fmt(cost,1));put('choice-scale-out',fmt(scale,1));
    put('choice-summary',`The two dual-job states together receive ${fmt((ps[1]+ps[2])*100,1)}% probability in this illustration. A higher fixed cost lowers both dual-state values, and a larger logit scale makes probabilities more even.`);
  }
  const groups={cap:{fn:cap,defaults:{'cap-sector':'services','cap-return':45}},regime:{fn:regime,defaults:{'regime-sector':'bnc','regime-cost':40,'regime-premium':0}},risk:{fn:risk,defaults:{'risk-sigma':.9,'risk-vol':.6}},choice:{fn:choice,defaults:{'choice-cost':1,'choice-scale':1}}};
  Object.values(groups).forEach(group=>{Object.keys(group.defaults).forEach(id=>$(id).addEventListener('input',group.fn));group.fn();});
  let resizeFrame; window.addEventListener('resize',()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>Object.values(groups).forEach(g=>g.fn()));});
  document.querySelectorAll('[data-reset]').forEach(b=>b.addEventListener('click',()=>{const g=groups[b.dataset.reset];Object.entries(g.defaults).forEach(([id,v])=>{$(id).value=v;});g.fn();}));
})();
