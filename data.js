/*
 * data.js — 受診先ナビのデータ定義
 *
 * ここに「症状」「診療科」「ダミー病院」のデータをまとめている。
 * ルールはすべて固定（ルールベース）。後で精緻化しやすいよう、
 * ロジック(app.js)とデータ(このファイル)を分離している。
 *
 * ⚠ 安全のための設計方針:
 *  - 病名の診断・薬の推奨は一切しない。診療科の案内まで。
 *  - emergency:true の症状が1つでも選ばれたら、診療科案内より先に
 *    救急(119)を最優先で案内する（app.js側で処理）。
 */

/*
 * 症状マスタ
 *  id          : 内部ID
 *  label       : 画面表示名
 *  emergency   : 緊急性が高い症状か（true なら救急を最優先案内）
 *  emergencyNote : 緊急時に表示する補足
 *  departments : この症状に対応する診療科ID（優先度順）
 */
const SYMPTOMS = [
  // --- 緊急性が高い症状 ---
  {
    id: 'chest_pain',
    label: '胸の痛み・締めつけ',
    emergency: true,
    emergencyNote: '心臓や血管の重い病気の可能性があります。',
    departments: ['cardiology', 'internal'],
  },
  {
    id: 'breathing',
    label: '激しい息苦しさ・呼吸困難',
    emergency: true,
    emergencyNote: '呼吸や心臓の緊急事態の可能性があります。',
    departments: ['internal', 'cardiology'],
  },
  {
    id: 'unconscious',
    label: '意識がもうろう・意識を失った',
    emergency: true,
    emergencyNote: '命に関わる可能性があります。ためらわず119へ。',
    departments: ['emergency'],
  },
  {
    id: 'paralysis',
    label: '片側の手足のまひ・ろれつが回らない',
    emergency: true,
    emergencyNote: '脳卒中の可能性があります。発症時刻が治療に重要です。',
    departments: ['neurosurgery', 'neurology'],
  },
  {
    id: 'bleeding',
    label: '止まらない大量の出血',
    emergency: true,
    emergencyNote: '止血が必要です。圧迫しながら救急へ。',
    departments: ['surgery', 'emergency'],
  },
  {
    id: 'seizure',
    label: 'けいれん・ひきつけ',
    emergency: true,
    emergencyNote: '繰り返す・長く続く場合は特に危険です。',
    departments: ['neurology', 'emergency'],
  },

  // --- 一般的な症状 ---
  { id: 'fever',     label: '発熱',           emergency: false, departments: ['internal'] },
  { id: 'cough',     label: '咳・のどの痛み', emergency: false, departments: ['internal', 'otolaryngology'] },
  { id: 'stomach',   label: '腹痛',           emergency: false, departments: ['internal', 'gastroenterology'] },
  { id: 'headache',  label: '頭痛',           emergency: false, departments: ['internal', 'neurology'] },
  { id: 'dizziness', label: 'めまい',         emergency: false, departments: ['otolaryngology', 'internal'] },
  { id: 'injury',    label: 'けが・打撲・ねんざ', emergency: false, departments: ['orthopedics', 'surgery'] },
  { id: 'jointpain', label: '関節・腰・首の痛み', emergency: false, departments: ['orthopedics'] },
  { id: 'skin',      label: '皮膚の異常（発疹・かゆみ）', emergency: false, departments: ['dermatology'] },
  { id: 'eye',       label: '目の痛み・見えにくさ', emergency: false, departments: ['ophthalmology'] },
  { id: 'ear',       label: '耳の痛み・聞こえにくさ', emergency: false, departments: ['otolaryngology'] },
  { id: 'tooth',     label: '歯の痛み',       emergency: false, departments: ['dentistry'] },
];

/*
 * 診療科マスタ
 */
const DEPARTMENTS = {
  emergency:        { id: 'emergency',        name: '救急科' },
  internal:         { id: 'internal',         name: '内科' },
  surgery:          { id: 'surgery',          name: '外科' },
  orthopedics:      { id: 'orthopedics',      name: '整形外科' },
  cardiology:       { id: 'cardiology',       name: '循環器内科' },
  gastroenterology: { id: 'gastroenterology', name: '消化器内科' },
  neurology:        { id: 'neurology',        name: '神経内科' },
  neurosurgery:     { id: 'neurosurgery',     name: '脳神経外科' },
  otolaryngology:   { id: 'otolaryngology',   name: '耳鼻咽喉科' },
  dermatology:      { id: 'dermatology',      name: '皮膚科' },
  ophthalmology:    { id: 'ophthalmology',    name: '眼科' },
  dentistry:        { id: 'dentistry',        name: '歯科' },
  pediatrics:       { id: 'pediatrics',       name: '小児科' },
};

/*
 * ダミー病院データ
 *  実際の位置情報/地図APIは未連携。距離は仮の固定値。
 *  departments には扱う診療科IDを並べる。
 *  walkMinutes : 徒歩での所要時間（分・ダミー）
 */
const DUMMY_HOSPITALS = [
  {
    name: 'みなと総合クリニック',
    departments: ['internal', 'cardiology', 'gastroenterology'],
    distanceMeters: 220,
    walkMinutes: 3,
    hours: '平日 9:00–18:00 / 土 9:00–13:00',
    open: true,
  },
  {
    name: 'さくら整形外科・外科',
    departments: ['orthopedics', 'surgery'],
    distanceMeters: 480,
    walkMinutes: 6,
    hours: '平日 9:00–12:30, 15:00–18:30 / 土 9:00–12:30',
    open: true,
  },
  {
    name: 'あおぞら皮膚科クリニック',
    departments: ['dermatology'],
    distanceMeters: 350,
    walkMinutes: 5,
    hours: '平日 10:00–13:00, 14:30–19:00',
    open: true,
  },
  {
    name: 'なかまち耳鼻咽喉科',
    departments: ['otolaryngology'],
    distanceMeters: 600,
    walkMinutes: 8,
    hours: '平日 9:00–12:00, 15:00–18:00 / 木・日 休診',
    open: false,
  },
  {
    name: 'ひかり眼科',
    departments: ['ophthalmology'],
    distanceMeters: 540,
    walkMinutes: 7,
    hours: '平日 9:30–13:00, 14:30–18:00',
    open: true,
  },
  {
    name: 'けやき脳神経クリニック',
    departments: ['neurology', 'neurosurgery', 'internal'],
    distanceMeters: 750,
    walkMinutes: 10,
    hours: '平日 9:00–17:00',
    open: true,
  },
  {
    name: '市民中央病院（救急対応）',
    departments: ['emergency', 'internal', 'surgery', 'cardiology', 'neurosurgery', 'orthopedics'],
    distanceMeters: 900,
    walkMinutes: 12,
    hours: '24時間・救急受付あり',
    open: true,
  },
  {
    name: 'こもれび歯科',
    departments: ['dentistry'],
    distanceMeters: 280,
    walkMinutes: 4,
    hours: '平日 9:00–18:00 / 土 9:00–13:00',
    open: true,
  },
];

// app.js から参照できるよう公開
window.HospitalNaviData = { SYMPTOMS, DEPARTMENTS, DUMMY_HOSPITALS };
