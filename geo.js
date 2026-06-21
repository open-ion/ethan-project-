/*
 * geo.js — 位置情報の取得と、OpenStreetMapからの実病院検索
 *
 * 機能:
 *  - getCurrentLocation() : ブラウザの位置情報API(navigator.geolocation)で現在地を取得
 *  - geocodeAddress()     : 地名・住所を緯度経度に変換（Nominatim / OpenStreetMap）
 *  - searchHospitalsOSM() : 現在地周辺の医療機関を検索（Overpass API / OpenStreetMap）
 *
 * ⚠ 設計方針:
 *  - 位置情報はこの検索のためにその場で使うだけ。保存も外部送信もしない。
 *  - ここでも病名の診断・薬の推奨はしない。診療科の案内・医療機関の候補提示まで。
 *  - OSMのデータは更新が遅れることがあるため、診療科・診療時間は要確認である旨を
 *    呼び出し側(app.js)で必ず表示する。
 *  - 位置情報APIは HTTPS（安全なコンテキスト）でのみ動く。公開URL(GitHub Pages)はHTTPS。
 */

(function () {
  'use strict';

  const OVERPASS = 'https://overpass-api.de/api/interpreter';
  const NOMINATIM = 'https://nominatim.openstreetmap.org/search';

  // 2点間の直線距離（メートル）。Haversineの公式。
  function haversine(aLat, aLng, bLat, bLng) {
    const R = 6371000;
    const toRad = (d) => (d * Math.PI) / 180;
    const dLat = toRad(bLat - aLat);
    const dLng = toRad(bLng - aLng);
    const s =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
    return Math.round(2 * R * Math.asin(Math.sqrt(s)));
  }

  // 徒歩の所要時間（分）。徒歩を約80m/分として概算。
  const walkMinutes = (m) => Math.max(1, Math.round(m / 80));

  // ブラウザの位置情報APIで現在地を取得
  function getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!('geolocation' in navigator)) {
        reject(new Error('この端末・ブラウザでは位置情報が使えません。'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
        (err) => {
          const msg =
            err.code === 1
              ? '位置情報の利用が許可されませんでした。ブラウザの設定をご確認ください。'
              : err.code === 3
              ? '位置情報の取得がタイムアウトしました。'
              : '位置情報を取得できませんでした。';
          reject(new Error(msg));
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });
  }

  // 地名・住所 → 緯度経度（OpenStreetMapのジオコーディング）
  async function geocodeAddress(query) {
    const url =
      `${NOMINATIM}?format=json&limit=1&countrycodes=jp&accept-language=ja` +
      `&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error('住所の検索に失敗しました。時間をおいてお試しください。');
    const data = await res.json();
    if (!data.length) {
      throw new Error('その地名・住所が見つかりませんでした。別の書き方でお試しください。');
    }
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), label: data[0].display_name };
  }

  // OSMの診療科タグを、本アプリの診療科IDに対応づける（部分一致）
  function mapSpecialities(tags) {
    const map = window.HospitalNaviData.OSM_SPECIALITY_TO_DEPT;
    const out = new Set();
    const raw = `${tags['healthcare:speciality'] || ''};${tags.speciality || ''}`;
    raw
      .split(/[;,]/)
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
      .forEach((s) => {
        Object.keys(map).forEach((k) => {
          if (s.includes(k)) out.add(map[k]);
        });
      });
    return [...out];
  }

  // 現在地周辺の医療機関を検索（Overpass API）
  async function searchHospitalsOSM(lat, lng, radius = 1500) {
    const q =
      `[out:json][timeout:25];(` +
      `node["amenity"~"clinic|hospital|doctors"](around:${radius},${lat},${lng});` +
      `way["amenity"~"clinic|hospital|doctors"](around:${radius},${lat},${lng});` +
      `);out center tags 80;`;
    const res = await fetch(OVERPASS, {
      method: 'POST',
      body: 'data=' + encodeURIComponent(q),
    });
    if (!res.ok) {
      throw new Error('病院データの取得に失敗しました。時間をおいてお試しください。');
    }
    const data = await res.json();
    const seen = new Set();
    return (data.elements || [])
      .map((el) => {
        const t = el.tags || {};
        const plat = el.lat != null ? el.lat : el.center && el.center.lat;
        const plng = el.lon != null ? el.lon : el.center && el.center.lon;
        if (plat == null || plng == null) return null;
        const dist = haversine(lat, lng, plat, plng);
        return {
          name: t.name || t['name:ja'] || '(名称不明の医療機関)',
          lat: plat,
          lng: plng,
          amenity: t.amenity,
          distanceMeters: dist,
          walkMinutes: walkMinutes(dist),
          departments: mapSpecialities(t),
          hours: t.opening_hours || '',
          phone: t.phone || t['contact:phone'] || '',
        };
      })
      .filter(Boolean)
      .filter((h) => {
        const key = `${h.name}@${h.lat.toFixed(4)},${h.lng.toFixed(4)}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => a.distanceMeters - b.distanceMeters);
  }

  window.HospitalNaviGeo = { getCurrentLocation, geocodeAddress, searchHospitalsOSM, haversine, walkMinutes };
})();
