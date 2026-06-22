/* マネークリップ v1 — 副業×確定申告×ほったらかし投資の見える化
   データは端末内(localStorage)に保存。バックエンドなし。 */

'use strict';

// ---------- 初期データ（イオンの設定をシード。アプリ内で編集可） ----------
const DEFAULT = {
  defenseFund: 0,            // 防衛資金の現在額
  defenseTargetMin: 1000000, // 生活費3か月(個別株解禁ライン)
  defenseTargetFull: 1800000,// 生活費6か月
  bufferMonthly: 70000,      // 現金バッファ(防衛資金へ)/月
  split: { tax: 35000, buffer: 70000, invest: 35000 }, // 副業の分け方
  livingCost: 325000,
  rate: 0.05,                // 想定利回り
  phaseBMonthly: 105000,     // 防衛資金完成後の月額投資
  taxYear: 2026,             // 確定申告の対象年
  filingMethod: '未定（青色申告を推奨）',
  income: [
    // {ym:'2026-06', honbun:325000, fukugyo:160000, baito:0}
  ],
  holdings: [
    { name:'eMAXIS Slim 全世界株式(オルカン)', kind:'投信', box:'つみたて', monthly:35000, invested:0, note:'コア・7月開始' }
  ],
  checks: {} // 確定申告チェックリストの状態
};

const CANDIDATES = {
  高配当株: [
    { n:'三菱HCキャピタル', c:'8593', y:'4.0%', p:'性向46%', r:'A', m:'25期級連続増配' },
    { n:'KDDI', c:'9433', y:'3.1%', p:'性向44%', r:'A', m:'24期連続増配' },
    { n:'三井物産', c:'8031', y:'3.0%', p:'性向40%', r:'A', m:'累進配当' },
    { n:'三菱商事', c:'8058', y:'2.8%', p:'性向52%', r:'B', m:'累進配当' },
    { n:'JT', c:'2914', y:'4.1%', p:'性向81%', r:'C', m:'2021減配・性向高' },
  ],
  REIT: [
    { n:'イオンリート投資法人', c:'3292', y:'4.3%', p:'15.6万', r:'A', m:'全国イオンモール' },
    { n:'大江戸温泉リート', c:'3472', y:'4.1%', p:'5.4万', r:'A', m:'最も買いやすい' },
  ],
  優待株: [
    { n:'イオン', c:'8267', y:'買上3〜5%還元', p:'100万〜', r:'A', m:'本業直結・継続' },
  ],
};

// ---------- 状態 ----------
let S = load();
function load(){
  try{ const v = JSON.parse(localStorage.getItem('moneyclip')); if(v) return Object.assign(structuredClone(DEFAULT), v);}catch(e){}
  return structuredClone(DEFAULT);
}
function save(){ localStorage.setItem('moneyclip', JSON.stringify(S)); }

// ---------- ヘルパー ----------
const yen = n => Math.round(n).toLocaleString('ja-JP') + '円';
const man = n => (n/10000).toLocaleString('ja-JP',{maximumFractionDigits:0}) + '万円';
const clamp = (x,a,b)=>Math.max(a,Math.min(b,x));
const el = (h)=>{const t=document.createElement('template');t.innerHTML=h.trim();return t.content.firstChild;};

function fvAnnuity(monthly, years, annual){
  const r = annual/12, n = Math.round(years*12);
  if(r===0) return monthly*n;
  return monthly*((Math.pow(1+r,n)-1)/r);
}
function phase(){ return S.defenseFund < S.defenseTargetMin ? 'A' : 'B'; }
function totalInvested(){ return S.holdings.reduce((a,h)=>a+(+h.invested||0),0); }

function taxCountdown(){
  const start = new Date(S.taxYear+1, 1, 16); // 2/16
  const end   = new Date(S.taxYear+1, 2, 15);  // 3/15
  const now = new Date(); now.setHours(0,0,0,0);
  const days = Math.ceil((start-now)/86400000);
  return { start, end, days, now };
}

// ---------- 画面: ホーム ----------
function viewHome(){
  const ph = phase();
  const def = S.defenseFund;
  const inv = totalInvested();
  // 二段ロケット試算
  const aYears = Math.max(0,(S.defenseTargetFull-def)/S.bufferMonthly/12);
  const bYears = Math.max(0, 20-aYears);
  const r = S.rate/12;
  let pot = fvAnnuity(S.split.invest, aYears, S.rate);
  pot = pot*Math.pow(1+r, Math.round(bYears*12)) + fvAnnuity(S.phaseBMonthly, bYears, S.rate);

  const tc = taxCountdown();
  let taxAlert='', cls='green';
  if(tc.now>tc.end){ taxAlert='今期の申告は終了。対象年を更新してね。'; }
  else if(tc.days<=0){ cls='red'; taxAlert='🔴 確定申告 期間中！今すぐ着手。'; }
  else if(tc.days<=60){ cls='red'; taxAlert=`🔴 確定申告まであと${tc.days}日。①税金プールは足りてる？②やり方OK？ → 税金タブへ`; }
  else if(tc.days<=120){ cls='yellow'; taxAlert=`🟡 確定申告まであと${tc.days}日。書類(経費・支払調書)を集め始めよう。`; }
  else { cls='green'; taxAlert=`🟢 確定申告まであと${tc.days}日。今は気にしなくてOK。`; }

  const v = document.createElement('div');
  v.innerHTML = `
  <div class="card hero">
    <h2>ほったらかし状況</h2>
    <div class="big">${man(inv)} <small>/ NISA投資済み</small></div>
    <div class="row"><span class="k">現在フェーズ</span>
      <span class="v"><span class="pill ${ph}">${ph==='A'?'A 防衛資金づくり':'B 投資加速'}</span></span></div>
    <div class="row"><span class="k">20年後の見込み(5%)</span><span class="v accent">約${man(pot)}</span></div>
    <div class="note">想定利回り5%・税引前のざっくり。「10%」は理想値、現実はこのくらいで十分。NISAなので増えた分は非課税。</div>
  </div>

  <div class="alert ${cls}">${taxAlert}</div>

  <div class="card">
    <h2>防衛資金（投資の大前提）</h2>
    <div class="row"><span class="k">現在額</span><span class="v">${man(def)}</span></div>
    <h3>最低ライン（生活費3か月 ${man(S.defenseTargetMin)}）</h3>
    <div class="progress"><i style="width:${clamp(def/S.defenseTargetMin*100,0,100)}%"></i></div>
    <h3>安心ライン（生活費6か月 ${man(S.defenseTargetFull)}）</h3>
    <div class="progress"><i style="width:${clamp(def/S.defenseTargetFull*100,0,100)}%"></i></div>
    <div class="note">${ph==='A'
      ? `あと${man(Math.max(0,S.defenseTargetMin-def))}で個別株フェーズB解禁。それまで投資は全額オルカン。`
      : '防衛資金クリア。個別株フェーズB解禁OK。バッファ分が投資に合流できる🚀'}</div>
    <div class="btnrow">
      <button class="btn mini ghost" data-act="defMinus">−1万</button>
      <button class="btn mini" data-act="defPlus">今月分 +${(S.bufferMonthly/10000)}万</button>
    </div>
  </div>

  <div class="card">
    <h2>今月のお金の流れ</h2>
    <div class="row"><span class="k">本業＋バイト</span><span class="v">→ 生活費でほぼ消費</span></div>
    <div class="row"><span class="k">副業 税金プール</span><span class="v">${yen(S.split.tax)}</span></div>
    <div class="row"><span class="k">副業 現金バッファ</span><span class="v">${yen(S.split.buffer)}</span></div>
    <div class="row"><span class="k">副業 投資準備</span><span class="v accent">${yen(S.split.invest)}</span></div>
  </div>

  <div class="card">
    <h2>次の一手</h2>
    ${nextSteps().map(s=>`<div class="row"><span class="k">▸</span><span class="v" style="text-align:right;max-width:80%">${s}</span></div>`).join('')}
  </div>`;
  return v;
}
function nextSteps(){
  const s=[];
  if(totalInvested()===0) s.push('楽天証券でオルカン月3.5万の自動積立を設定（7月開始）');
  if(phase()==='A') s.push('現金バッファを防衛資金へ。100万超えたらフェーズBへ');
  else s.push('三菱HCキャピタル/KDDI/三井物産を単元未満で開始検討');
  s.push('月1回マネークリップを開いて状況を更新');
  return s;
}

// ---------- 画面: 収入の見える化 ----------
function viewIncome(){
  const recs = [...S.income].sort((a,b)=>a.ym<b.ym?-1:1);
  const last6 = recs.slice(-6);
  const max = Math.max(1,...last6.map(r=>(+r.honbun||0)+(+r.fukugyo||0)+(+r.baito||0)));
  const sum = recs.reduce((a,r)=>a+(+r.honbun||0)+(+r.fukugyo||0)+(+r.baito||0),0);
  const fuku = recs.reduce((a,r)=>a+(+r.fukugyo||0),0);

  const v=document.createElement('div');
  v.innerHTML = `
  <div class="card hero">
    <h2>収入の見える化</h2>
    <div class="big">${man(sum)} <small>/ 累計</small></div>
    <div class="row"><span class="k">うち副業 累計</span><span class="v accent">${man(fuku)}</span></div>
  </div>

  <div class="card">
    <h2>直近6か月</h2>
    <div class="bars">
      ${last6.length? last6.map(r=>{
        const h=(+r.honbun||0),f=(+r.fukugyo||0),b=(+r.baito||0),t=h+f+b;
        const px=v=>Math.round(v/max*100);
        return `<div class="bcol">
          <div class="bstack" style="height:${Math.round(t/max*100)}%">
            <div class="seg honbun" style="height:${t? h/t*100:0}%"></div>
            <div class="seg baito" style="height:${t? b/t*100:0}%"></div>
            <div class="seg fukugyo" style="height:${t? f/t*100:0}%"></div>
          </div>
          <div class="small muted">${r.ym.slice(5)}</div>
        </div>`;
      }).join('') : '<div class="muted small">まだ記録がない。下から月の収入を打ち込もう。</div>'}
    </div>
    <div class="legend">
      <span><span class="dot" style="background:#2f6df0"></span>本業</span>
      <span><span class="dot" style="background:var(--warn)"></span>バイト</span>
      <span><span class="dot" style="background:var(--accent)"></span>副業</span>
    </div>
  </div>

  <div class="card">
    <h2>月の収入を打ち込む</h2>
    <div class="field"><label>対象月</label><input type="month" id="i_ym" value="${defaultMonth()}"></div>
    <div class="grid2">
      <div class="field"><label>本業(円)</label><input type="number" id="i_hon" inputmode="numeric" placeholder="325000"></div>
      <div class="field"><label>バイト(円)</label><input type="number" id="i_bai" inputmode="numeric" placeholder="0"></div>
    </div>
    <div class="field"><label>副業(円)</label><input type="number" id="i_fuku" inputmode="numeric" placeholder="160000"></div>
    <button class="btn" data-act="addIncome">この月を記録</button>
  </div>

  <div class="card">
    <h2>記録一覧</h2>
    ${recs.length? recs.slice().reverse().map((r,idx)=>`
      <div class="item">
        <div><span class="name">${r.ym}</span><div class="small muted">本${man(+r.honbun||0)}・バ${man(+r.baito||0)}・副${man(+r.fukugyo||0)}</div></div>
        <div><span class="v">${man((+r.honbun||0)+(+r.fukugyo||0)+(+r.baito||0))}</span>
        <button class="btn mini ghost" data-act="delIncome" data-ym="${r.ym}">削除</button></div>
      </div>`).join('') : '<div class="muted small">記録なし</div>'}
  </div>`;
  return v;
}
function defaultMonth(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;}

// ---------- 画面: 投資（ほったらかし） ----------
function viewInvest(){
  const inv = totalInvested();
  const cap = 18000000;
  const v=document.createElement('div');
  v.innerHTML = `
  <div class="card hero">
    <h2>投資（ほったらかし）</h2>
    <div class="big">${man(inv)} <small>/ NISA生涯枠 ${man(cap)}</small></div>
    <div class="progress"><i style="width:${clamp(inv/cap*100,0,100)}%"></i></div>
    <div class="note">基本はオルカン1本。値動きを毎日見ない／暴落で売らない・やめない。これがほったらかしの鉄則。</div>
  </div>

  <div class="card">
    <h2>保有・積立</h2>
    ${S.holdings.map((h,i)=>`
      <div class="item">
        <div><span class="name">${h.name}</span><span class="tag">${h.box||h.kind}</span>
          <div class="small muted">${h.monthly?`毎月${man(+h.monthly)}・`:''}${h.note||''}</div></div>
        <div><span class="v">${man(+h.invested||0)}</span>
        <button class="btn mini ghost" data-act="delHold" data-i="${i}">削除</button></div>
      </div>`).join('')}
    <div class="btnrow"><button class="btn mini" data-act="contrib">今月の積立を反映(+保有額)</button></div>
  </div>

  <div class="card">
    <h2>保有を追加</h2>
    <div class="field"><label>銘柄名</label><input id="h_name" placeholder="三菱HCキャピタル"></div>
    <div class="grid2">
      <div class="field"><label>区分</label>
        <select id="h_box"><option>つみたて</option><option>成長</option><option>特定口座</option></select></div>
      <div class="field"><label>投資額(円)</label><input id="h_inv" type="number" inputmode="numeric" placeholder="80000"></div>
    </div>
    <button class="btn" data-act="addHold">追加する</button>
    ${phase()==='A'?'<div class="note">⚠️ 今はフェーズA。個別株はまだ非推奨。防衛資金100万を超えてから。</div>':''}
  </div>

  <div class="card">
    <h2>候補リスト（藤原基準：利回り3%↑×配当性向50%↓×減配なし）</h2>
    ${Object.entries(CANDIDATES).map(([cat,arr])=>`
      <h3>${cat}</h3>
      ${arr.map(x=>`<div class="item">
        <div><span class="name">${x.n}</span><span class="tag ${x.r}">${x.r}</span>
          <div class="small muted">${x.c} ・ ${x.m}</div></div>
        <div style="text-align:right"><span class="v">${x.y}</span><div class="small muted">${x.p}</div></div>
      </div>`).join('')}
    `).join('')}
    <div class="note">A=コア候補／B=準コア／C=高利回りだが配当性向高 or 減配歴で保留。利回りが高い順に買うのは罠。</div>
  </div>`;
  return v;
}

// ---------- 画面: 税金・確定申告ガイド ----------
function viewTax(){
  const tc = taxCountdown();
  let cls='green', msg=`あと${tc.days}日`;
  if(tc.now>tc.end){cls='green';msg='今期は終了';}
  else if(tc.days<=60){cls='red';msg=`あと${tc.days}日・要着手`;}
  else if(tc.days<=120){cls='yellow';msg=`あと${tc.days}日・準備期`;}

  const checklist = [
    '本業の源泉徴収票',
    '副業の支払調書 or 入金記録（住信SBIの明細）',
    '経費の領収書・明細（PC・通信・書籍・交通費）',
    '各種控除の書類（社会保険・生命保険・iDeCo等）',
    'マイナンバー・本人確認書類',
    '（青色なら）帳簿・開業届/青色申告承認申請の控え',
    '住民税は「普通徴収」を選択したか最終確認',
  ];
  const v=document.createElement('div');
  v.innerHTML = `
  <div class="alert ${cls}"><b>確定申告（${S.taxYear}年分）</b> ${msg}<br>
  期間：${tc.start.toLocaleDateString('ja-JP')} 〜 ${tc.end.toLocaleDateString('ja-JP')}</div>

  <div class="card">
    <h2>みんなが知りたい3つ</h2>
    <details open><summary>① 副業が会社にバレないようにするには？</summary>
      <p>バレる原因は<b>住民税</b>。副業で住民税が増えると会社の天引き額に乗って気づかれる。
      確定申告で住民税を<b>「自分で納付（普通徴収）」</b>に選べば、副業分は自分に直接請求され分離できる。
      業務委託（事業/雑所得）なら選択可。⚠️就業規則で副業が禁止されてないかは別途自分で確認を。</p>
    </details>
    <details><summary>② 青色申告と白色、どっちがいい？</summary>
      <p><b>青色申告が有利</b>。開業届＋複式簿記で<b>最大65万円の特別控除</b>。経費も計上でき税が下がる。
      普通徴収もしやすい。事業所得と認められる実態（継続性・帳簿）が必要。
      青色にするには事前に「開業届」＋「青色申告承認申請書」を税務署へ。</p>
    </details>
    <details><summary>③ 税金プールはいくら用意する？</summary>
      <p>副業の所得には<b>所得税＋住民税で約30%</b>が目安（高い税率帯に乗る場合）。
      白色だと不足しがち。<b>青色＋経費で圧縮</b>すれば、月3.5万のプールでおおむね収まる。
      足りない分は現金バッファで吸収できる体制に。⚠️正確な額は国税庁/税理士で確認。</p>
    </details>
  </div>

  <div class="card">
    <h2>申告方式</h2>
    <div class="field"><label>現在の方針</label>
      <select id="t_method">
        ${['未定（青色申告を推奨）','青色申告','白色申告'].map(o=>`<option ${o===S.filingMethod?'selected':''}>${o}</option>`).join('')}
      </select></div>
    <div class="field"><label>確定申告の対象年</label><input id="t_year" type="number" value="${S.taxYear}"></div>
    <button class="btn mini" data-act="saveTax">保存</button>
  </div>

  <div class="card">
    <h2>準備チェックリスト</h2>
    ${checklist.map((c,i)=>`<label class="check">
      <input type="checkbox" data-act="chk" data-k="${i}" ${S.checks[i]?'checked':''}>
      <span class="${S.checks[i]?'muted':''}">${c}</span></label>`).join('')}
  </div>
  <div class="note">※ 本ガイドは一般的な情報。最終的な金額・適用は国税庁／税務署／税理士で必ず確認を。</div>`;
  return v;
}

// ---------- ルーティング & イベント ----------
function render(tab){
  const view = document.getElementById('view');
  const map = { home:viewHome, income:viewIncome, invest:viewInvest, tax:viewTax };
  view.innerHTML=''; view.appendChild((map[tab]||viewHome)());
  document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('is-active',t.dataset.tab===tab));
  const ph=phase();
  document.getElementById('phaseChip').textContent = ph==='A'?'フェーズA 守り':'フェーズB 攻め';
}
let current='home';

document.querySelector('.tabbar').addEventListener('click',e=>{
  const b=e.target.closest('.tab'); if(!b)return; current=b.dataset.tab; render(current); window.scrollTo(0,0);
});

document.getElementById('app').addEventListener('click', e=>{
  const t=e.target.closest('[data-act]'); if(!t)return;
  const act=t.dataset.act;
  if(act==='defPlus'){ S.defenseFund+=S.bufferMonthly; }
  else if(act==='defMinus'){ S.defenseFund=Math.max(0,S.defenseFund-10000); }
  else if(act==='addIncome'){
    const ym=val('i_ym'); if(!ym){alert('月を選んで');return;}
    S.income=S.income.filter(r=>r.ym!==ym);
    S.income.push({ym, honbun:+val('i_hon')||0, fukugyo:+val('i_fuku')||0, baito:+val('i_bai')||0});
  }
  else if(act==='delIncome'){ S.income=S.income.filter(r=>r.ym!==t.dataset.ym); }
  else if(act==='addHold'){
    const name=val('h_name'); if(!name){alert('銘柄名を入れて');return;}
    S.holdings.push({name, box:val('h_box'), kind:'', invested:+val('h_inv')||0});
  }
  else if(act==='delHold'){ S.holdings.splice(+t.dataset.i,1); }
  else if(act==='contrib'){ S.holdings.forEach(h=>{ if(+h.monthly) h.invested=(+h.invested||0)+(+h.monthly); }); }
  else if(act==='saveTax'){ S.filingMethod=val('t_method'); S.taxYear=+val('t_year')||S.taxYear; }
  else if(act==='chk'){ S.checks[t.dataset.k]=t.checked; }
  else return;
  save(); render(current);
});
const val=id=>{const e=document.getElementById(id);return e?e.value:'';};

// PWA
if('serviceWorker' in navigator){ navigator.serviceWorker.register('sw.js').catch(()=>{}); }
render('home');
