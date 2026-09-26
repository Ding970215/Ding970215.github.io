# DC WOODBALL ⚾

個人木球網站 — **American Athletic × Woodball** 風格，黑 / 白 / 金配色。
純 HTML + CSS + JavaScript，零相依、零建置流程，可直接丟上 GitHub Pages。

- 網站名稱：**DC WOODBALL**
- 選手姓名：**陳定淳**（Chen Ding-Chun）
- GitHub 使用者：**Ding970215**
- Repository 名稱：**woodball**
- GitHub Pages 網址：<https://ding970215.github.io/woodball/>

---

## 目錄結構

```
woodball/
├── index.html              # 主頁（單頁式，10 大區塊）
├── 404.html                # 自訂錯誤頁
├── .nojekyll               # 讓 GitHub Pages 不跑 Jekyll（保持檔名原樣）
└── assets/
    ├── css/
    │   └── style.css       # 全部樣式（含 RWD / 列印 / reduced-motion）
    ├── js/
    │   └── main.js         # 全部互動動畫（無任何外部 library）
    └── img/
        ├── hero.jpg        # ⭐ 首頁封面背景照片（1179×786，62KB）
        ├── favicon.svg
        ├── og-cover.svg    # OG / 社群分享封面
        ├── portrait.svg    # 個人介紹大圖（示意圖，請替換）
        └── photo-01.svg … photo-08.svg  # 照片展示區（示意圖，請替換）
```

---

## 部署到 GitHub Pages

### 方式 A：從現有資料夾直接建立新 repo（最快）

```powershell
cd woodball
git init
git add .
git commit -m "feat: DC WOODBALL woodball personal website"
git branch -M main
git remote add origin https://github.com/Ding970215/woodball.git
git push -u origin main
```

### 方式 B：已經有 repo，只要把網頁放進去

把 `woodball/` 資料夾內的**所有內容**複製到 repo 根目錄，再 push。

### 開啟 Pages

1. 到 GitHub → 進 `woodball` repo → **Settings**
2. 左側選單 **Pages**
3. **Source** 選 `Deploy from a branch`
4. **Branch** 選 `main` ／ **Folder** 選 `/ (root)`
5. 按 **Save**

約 1～2 分鐘後網站上線：
`https://<你的帳號>.github.io/woodball/`

> 建議之後把網址改成自訂網域：在 **Settings → Pages → Custom domain** 填入網域，
> 並在 DNS 加一筆 `CNAME` 指向 `<帳號>.github.io`。

---

## 頁面區塊（對應需求）

| # | 區塊 | 錨點 | 特色 |
|---|------|------|------|
| 01 | 首頁 Hero | `#home` | Canvas 木球場透視線、漂浮木球、滑動遮罩標題、數字動畫 |
| — | 跑馬燈 | — | 金色斜切廣告帶，純 CSS 動畫 |
| 02 | 我的木球介紹 | `#woodball` | 規則說明、裝備表、3D tilt 卡片 |
| 03 | 木球社社長經歷 | `#president` | 時間軸 + 金色漸層進度線 |
| 04 | 全中運經歷 | `#games` | 金色版面、浮動獎牌、賽事備忘錄 |
| 05 | 比賽紀錄 | `#records` | 可篩選表格（全部 / 全國 / 縣市 / 社團） |
| 06 | 木球精神 | `#spirit` | 5 大精神卡 + 金句引言版 |
| 07 | 照片展示區 | `#gallery` | 瀑布網格 + 鍵盤可操作的 Lightbox |
| 08 | 個人介紹 | `#about` | 照片框、名牌、資料表、技能進度條 |
| 09 | IG / GitHub | `#links` | 金色翻版卡片 + 磁吸效果 |
| 10 | Footer | — | 四欄導覽、超大字 DC WOODBALL 描邊字 |

---

## 互動效果一覽

- **載入動畫**：木球旋轉 loader + 百分比進度
- **自訂游標**：金色小點 + 延遲外圈（hover 放大）
- **磁吸按鈕** `data-magnetic`：滑鼠接近時按鈕被吸附
- **3D 卡片傾斜** `data-tilt`
- **滾動顯示** `[data-anim="fade-up" | "clip" | "grow"]`
- **數字遞增** `[data-count]`
- **技能條** `[data-bar]`
- **表格篩選** `.filter__btn[data-filter]`
- **Lightbox**：← → 切換、Esc 關閉、方向鍵支援
- **回到頂端** + 頂部全頁捲動進度條
- **Hero Canvas**：透視球場網格 + 上浮木球（附十字標記），離開畫面自動暫停省電

---

## 修改內容的地方

| 想改什麼 | 開哪個檔案 |
|----------|-----------|
| 文字 / 數據 / 表格 | `index.html` 搜尋關鍵字即可 |
| 配色 | `assets/css/style.css` 最上方 `:root` 的變數 |
| 動畫速度 | `assets/css/style.css` 的 `--ease`、`--ease-out` |
| IG 連結 | `index.html` 搜尋 `instagram.com` |
| GitHub 連結 | `index.html` 搜尋 `github.com` |
| 頁面標題 / SEO | `index.html` 的 `<title>` 與 `<meta>` |

### 換首頁封面照片

封面照片是 `assets/img/hero.jpg`。要換圖只要：

1. 新照片存成 `assets/img/hero.jpg`（或另存新檔名）
2. 如果換了檔名，改 `assets/css/style.css` 最上方這行：

```css
--hero-img:url("../img/hero.jpg");   /* 改成你的檔名 */
--hero-pos:center 38%;              /* 照片焦點位置，數字是「水平% 垂直%」 */
```

3. 同步改 `index.html` 的預載入路徑：

```html
<link rel="preload" as="image" href="assets/img/hero.jpg" fetchpriority="high" />
```

> 照片已經套了三層處理讓文字看得清楚：
> 金色雙色調（duotone）→ 底部漸層 → 左側壓暗。
> 深色照片效果最好；照片本身已經很暗時，可把 `--hero-pos` 調到 `center 30%`。
> 建議尺寸 **1920×1280 以上、橫幅、200KB 內**；目前 1179×786 在桌機上會稍微柔一點，但手機版正好。

### 換成自己的照片

1. 把照片放進 `assets/img/`（建議 `jpg` 或 `webp`，寬度 ≥ 1200px，檔名簡單一點）
2. 在 `index.html` 搜尋 `photo-0` 或 `portrait.svg`，把 `src` 換成你的檔名
3. 順便把 `alt` 改成正確的替代文字（無障礙必要）

```html
<img src="assets/img/photo-01.jpg" alt="全中運決賽揮桿" loading="lazy" width="1200" height="900" />
```

---

## RWD 斷點

| 裝置 | 斷點 | 說明 |
|------|------|------|
| 桌機 | `> 960px` | 完整水平導覽、並排卡片 |
| 平板 | `≤ 1100px` | 卡片改單欄 |
| 平板/手機 | `≤ 960px` | 漢堡選單，全頁滑出式抽屜 |
| 手機 | `≤ 720px` | 2 欄網格、按鈕全寬、時間軸縮排 |
| 小螢幕 | `≤ 420px` | 單欄、Lightbox 上下排版 |

已處理：`safe-area`（iPhone 瀏海）、`100svh`（瀏覽器網址列）、`-webkit-` 前綴、
圖片 `loading="lazy"`、表格橫向捲動。

---

## 無障礙 / 效能 / 相容性

- 語意化標籤 + 跳至主內容（可再加）＋ `aria-label` / `aria-expanded` / `aria-selected`
- 支援鍵盤操作（選單、Lightbox、回到頂端皆有 focus 樣式）
- `prefers-reduced-motion: reduce` 會自動關閉所有動畫與 Canvas
- Canvas 在離開視窗時自動 `cancelAnimationFrame`
- 內嵌字體（Google Fonts）已附 `preconnect`，無 JS 也能正常顯示內容
- Chrome / Edge / Firefox / Safari 最新版皆可運作

---

## 授權

© 陳定淳 (Ding970215). 網站內容與設計皆可自由使用、修改。
