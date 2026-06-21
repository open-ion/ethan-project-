/*
 * app.js — 受診先ナビのロジック
 *
 * 処理の流れ:
 *  1. 症状フォームを描画
 *  2. 送信時、選択症状から
 *     a) 緊急症状があれば救急警告を最優先で表示
 *     b) 該当診療科を集計して提示（ルールベース）
 *     c) その診療科を扱う徒歩圏内のダミー病院を表示
 *
 * ⚠ 病名診断・薬の推奨は行わない。診療科の案内まで。
 */

(function () {
  'use strict';

  const { SYMPTOMS, DEPARTMENTS, DUMMY_HOSPITALS } = window.HospitalNaviData;

  const form = document.getElementById('symptom-form');
  const symptomList = document.getElementById('symptom-list');
  const formSection = document.getElementById('form-section');
  const resultSection = document.getElementById('result-section');
  const emergencyBanner = document.getElementById('emergency-banner');
  const deptContainer = document.getElementById('recommended-departments');
  const hospitalContainer = document.getElementById('hospital-results');

  /* ---------- 1. 症状フォームの描画 ---------- */
  function renderSymptoms() {
    symptomList.innerHTML = '';
    SYMPTOMS.forEach((s) => {
      const id = `sym-${s.id}`;
      const wrapper = document.createElement('label');
      wrapper.className = 'symptom-item' + (s.emergency ? ' is-emergency' : '');
      wrapper.htmlFor = id;
      wrapper.innerHTML = `
        <input type="checkbox" id="${id}" name="symptom" value="${s.id}" />
        <span>${s.label}</span>
      `;
      symptomList.appendChild(wrapper);
    });
  }

  /* ---------- 2. 結果の計算 ---------- */
  function getSelectedSymptoms() {
    const checked = [...form.querySelectorAll('input[name="symptom"]:checked')];
    const ids = checked.map((c) => c.value);
    return SYMPTOMS.filter((s) => ids.includes(s.id));
  }

  // 緊急症状だけ抽出
  function getEmergencySymptoms(selected) {
    return selected.filter((s) => s.emergency);
  }

  // 選択症状 → 推奨診療科（重複は出現回数でスコア化し優先度順に）
  function rankDepartments(selected) {
    const score = {};
    selected.forEach((s) => {
      s.departments.forEach((deptId, idx) => {
        // 先頭の診療科ほど高スコア（idxが小さいほど加点）
        score[deptId] = (score[deptId] || 0) + (s.departments.length - idx);
      });
    });
    return Object.keys(score)
      .map((id) => ({ dept: DEPARTMENTS[id], score: score[id] }))
      .sort((a, b) => b.score - a.score);
  }

  // 年齢層が「こども」なら小児科を先頭に補足提案
  function applyProfileAdjustments(ranked, ageGroup) {
    if (ageGroup === 'child' && !ranked.some((r) => r.dept.id === 'pediatrics')) {
      return [{ dept: DEPARTMENTS.pediatrics, score: Infinity }, ...ranked];
    }
    return ranked;
  }

  // 推奨診療科に該当する徒歩圏内のダミー病院（距離が近い順）
  function findHospitals(deptIds) {
    return DUMMY_HOSPITALS
      .filter((h) => h.departments.some((d) => deptIds.includes(d)))
      .sort((a, b) => a.distanceMeters - b.distanceMeters);
  }

  /* ---------- 3. 結果の描画 ---------- */
  function renderEmergency(emergencySymptoms) {
    if (emergencySymptoms.length === 0) {
      emergencyBanner.className = 'hidden';
      emergencyBanner.innerHTML = '';
      return;
    }
    const notes = [...new Set(emergencySymptoms.map((s) => s.emergencyNote).filter(Boolean))];
    emergencyBanner.className = 'emergency-banner';
    emergencyBanner.innerHTML = `
      <div class="emergency-title">🚨 今すぐ救急車（119）または救急外来へ</div>
      <p>選択された症状に、緊急性が高い可能性のあるものが含まれています。</p>
      <ul class="emergency-symptoms">
        ${emergencySymptoms.map((s) => `<li>${s.label}</li>`).join('')}
      </ul>
      ${notes.length ? `<p class="emergency-note">${notes.join(' ')}</p>` : ''}
      <div class="emergency-actions">
        <a class="call-btn call-119" href="tel:119">119 に電話（救急車）</a>
        <a class="call-btn call-7119" href="tel:7119">#7119 に相談（救急相談）</a>
      </div>
      <p class="emergency-foot">迷う場合も、下の診療科案内より救急への相談を優先してください。</p>
    `;
  }

  function renderDepartments(ranked) {
    if (ranked.length === 0) {
      deptContainer.innerHTML = `
        <h3>受診先の目安</h3>
        <p>選択された症状からは診療科を特定できませんでした。
        まずは <strong>内科</strong> で相談するか、判断に迷う場合は
        <a href="tel:7119">#7119</a> に相談してください。</p>`;
      return;
    }
    const primary = ranked[0].dept;
    const others = ranked.slice(1);
    deptContainer.innerHTML = `
      <h3>受診先の目安</h3>
      <p class="dept-lead">まずは次の診療科の受診を検討してください。</p>
      <div class="dept-primary">${primary.name}</div>
      ${
        others.length
          ? `<p class="dept-others">関連して候補になりうる科：
             ${others.map((o) => `<span class="dept-chip">${o.dept.name}</span>`).join(' ')}</p>`
          : ''
      }
    `;
  }

  function renderHospitals(hospitals) {
    if (hospitals.length === 0) {
      hospitalContainer.innerHTML = `
        <h3>徒歩圏内の病院候補</h3>
        <p>該当する診療科の病院候補（ダミー）が見つかりませんでした。</p>`;
      return;
    }
    hospitalContainer.innerHTML = `
      <h3>徒歩圏内の病院候補 <span class="dummy-tag">ダミーデータ</span></h3>
      <p class="hospital-note">※ 位置情報・地図連携は未実装です。距離や営業時間は仮の値です。</p>
      <ul class="hospital-list">
        ${hospitals
          .map((h) => {
            const depts = h.departments
              .map((d) => DEPARTMENTS[d] && DEPARTMENTS[d].name)
              .filter(Boolean)
              .join('・');
            return `
            <li class="hospital-card">
              <div class="hospital-head">
                <span class="hospital-name">${h.name}</span>
                <span class="hospital-open ${h.open ? 'open' : 'closed'}">
                  ${h.open ? '診療中の可能性' : '時間外の可能性'}
                </span>
              </div>
              <div class="hospital-meta">
                <span>🚶 約${h.walkMinutes}分（${h.distanceMeters}m）</span>
              </div>
              <div class="hospital-depts">診療科：${depts}</div>
              <div class="hospital-hours">🕒 ${h.hours}</div>
            </li>`;
          })
          .join('')}
      </ul>
    `;
  }

  /* ---------- 4. 送信ハンドラ ---------- */
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const selected = getSelectedSymptoms();

    if (selected.length === 0) {
      alert('症状を1つ以上選んでください。');
      return;
    }

    const ageGroup = document.getElementById('age-group').value;
    const emergencySymptoms = getEmergencySymptoms(selected);

    // a) 緊急警告を最優先で
    renderEmergency(emergencySymptoms);

    // b) 推奨診療科
    let ranked = rankDepartments(selected);
    ranked = applyProfileAdjustments(ranked, ageGroup);
    renderDepartments(ranked);

    // c) 病院候補
    const deptIds = ranked.map((r) => r.dept.id);
    renderHospitals(findHospitals(deptIds));

    // 画面切り替え
    formSection.classList.add('hidden');
    resultSection.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------- 5. ナビゲーション ---------- */
  document.getElementById('reset-btn').addEventListener('click', () => {
    form.reset();
  });

  document.getElementById('back-btn').addEventListener('click', () => {
    resultSection.classList.add('hidden');
    formSection.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------- 初期化 ---------- */
  renderSymptoms();
})();
