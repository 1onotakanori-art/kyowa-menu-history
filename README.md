# Kyowa Menu History (Private)

管理者の食事履歴データと学習モデルを保存するプライベートリポジトリ

## 構成

- `data/history/` - 食事履歴データ（JSON）
- `data/models/` - 学習済みモデルと統計データ

## データ形式

### history_YYYY-MM-DD.json
```json
{
  "date": "2026-01-20",
  "eaten": ["menu1", "menu2", ...],
  "available": ["all", "menus", ...],
  "nutrition": { "total": {...} },
  "timestamp": "2026-01-20T12:34:56.789Z"
}

