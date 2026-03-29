/**
 * migrate-to-supabase.js
 *
 * data/history/ と data/menus/ の既存JSONファイルを Supabase に移行します。
 *
 * テーブル対応:
 *   data/history/*.json  → meal_history テーブル（新規作成）
 *   data/menus/*.json    → menus テーブル（既存、1行=メニュー1品）
 *
 * 使い方:
 *   1. .env ファイルに SUPABASE_URL と SUPABASE_SERVICE_KEY を設定
 *   2. npm install
 *   3. npm run migrate
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// --- 環境変数の読み込み (.env がある場合) ---
try {
  const envContent = readFileSync(join(ROOT, '.env'), 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
} catch {
  // .env ファイルが存在しない場合は無視
}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('エラー: SUPABASE_URL と SUPABASE_SERVICE_KEY を環境変数または .env ファイルに設定してください。');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
});

// --- 食事履歴の移行 → meal_history テーブル ---
async function migrateHistory() {
  const historyDir = join(ROOT, 'data', 'history');
  let files;
  try {
    files = readdirSync(historyDir).filter(f => f.endsWith('.json'));
  } catch {
    console.warn('data/history/ が見つかりません。スキップします。');
    return;
  }

  console.log(`\n📋 食事履歴 (meal_history): ${files.length} 件処理中...`);
  let success = 0, errors = 0;

  for (const file of files) {
    const date = file.replace('.json', '');
    try {
      const raw = JSON.parse(readFileSync(join(historyDir, file), 'utf-8'));

      const record = {
        date: raw.date || date,
        day_of_week: raw.dayOfWeek || null,
        user_name: raw.user || null,
        timestamp: raw.timestamp ? new Date(raw.timestamp).toISOString() : null,
        settings: raw.settings || {},
        selected_menus: raw.selectedMenus || [],
        totals: raw.totals || {},
        achievement: raw.achievement || {},
      };

      const { error } = await supabase
        .from('meal_history')
        .upsert(record, { onConflict: 'date' });

      if (error) {
        console.error(`  ✗ ${file}: ${error.message}`);
        errors++;
      } else {
        console.log(`  ✓ ${file}`);
        success++;
      }
    } catch (err) {
      console.error(`  ✗ ${file}: ${err.message}`);
      errors++;
    }
  }

  console.log(`  完了: 成功 ${success}, エラー ${errors}`);
}

// --- 日別メニューの移行 → 既存 menus テーブル（1行=1品）---
async function migrateMenus() {
  const menusDir = join(ROOT, 'data', 'menus');
  let files;
  try {
    files = readdirSync(menusDir).filter(
      f => f.endsWith('.json') && f !== 'available-dates.json'
    );
  } catch {
    console.warn('data/menus/ が見つかりません。スキップします。');
    return;
  }

  console.log(`\n🍽️  日別メニュー (menus): ${files.length} ファイル処理中...`);
  let success = 0, errors = 0;

  for (const file of files) {
    const date = file.replace('.json', '');
    try {
      const raw = JSON.parse(readFileSync(join(menusDir, file), 'utf-8'));
      const items = Array.isArray(raw.menus) ? raw.menus : [];

      if (items.length === 0) {
        console.log(`  - ${file}: メニューなし、スキップ`);
        continue;
      }

      // 既存テーブルのスキーマに合わせて1品1行で挿入
      // 重複を避けるため、同じ date の既存データを先に削除してから insert
      const { error: delError } = await supabase
        .from('menus')
        .delete()
        .eq('date', date);

      if (delError) {
        console.error(`  ✗ ${file} (削除): ${delError.message}`);
        errors++;
        continue;
      }

      const records = items.map(item => ({
        date,
        menu_name: item.name,
        nutrition: item.nutrition || {},
      }));

      const { error } = await supabase
        .from('menus')
        .insert(records);

      if (error) {
        console.error(`  ✗ ${file}: ${error.message}`);
        errors++;
      } else {
        console.log(`  ✓ ${file} (${items.length} 品)`);
        success++;
      }
    } catch (err) {
      console.error(`  ✗ ${file}: ${err.message}`);
      errors++;
    }
  }

  console.log(`  完了: 成功 ${success}, エラー ${errors}`);
}

// --- メイン ---
async function main() {
  console.log('🚀 Supabaseへの移行を開始します...');
  console.log(`   URL: ${SUPABASE_URL}`);

  await migrateHistory();
  await migrateMenus();

  console.log('\n✅ 移行完了');
}

main().catch(err => {
  console.error('予期しないエラー:', err);
  process.exit(1);
});
