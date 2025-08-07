# 吃甚麼 - 附近餐廳搜尋器

一個簡單實用的 DEMO 網站，幫助您快速找到附近的餐廳並隨機選擇用餐地點。

## 專案說明

這是一個基於純前端技術的餐廳搜尋應用程式，主要功能包括：

- 🔍 **地址搜尋**：輸入任意地址，搜尋附近 500 公尺範圍內的餐廳
- 🗺️ **地圖顯示**：使用 Google Maps 顯示餐廳位置和詳細資訊
- 📋 **餐廳列表**：顯示餐廳名稱、類型、地址、評分、電話等資訊
- 🎲 **隨機選擇**：從搜尋結果中隨機挑選一間餐廳
- 📱 **響應式設計**：支援桌面和行動裝置

## 技術棧

- **HTML5** - 網頁結構
- **CSS3** - 樣式設計與響應式佈局
- **JavaScript ES6** - 前端邏輯與模組化
- **Bootstrap 5** - UI 框架（via jsDelivr CDN）
- **FontAwesome** - 圖示字體（via jsDelivr CDN）
- **Google Maps JavaScript API** - 地圖與地點搜尋服務
- **Google Places API** - 餐廳資訊與詳細資料

## 檔案結構

```
Demo/
├── index.html    # 主頁面，包含 UI 結構
├── style.css     # 自定義樣式
├── api.js        # Google Maps/Places API 封裝
├── main.js       # 主要應用程式邏輯
└── README.md     # 專案說明文件
```

## 安裝與設定

### 1. 取得 Google Maps API Key

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 建立新專案或選擇現有專案
3. 啟用以下 API：
   - Maps JavaScript API
   - Places API
4. 建立 API 金鑰
5. 設定 API 金鑰的使用限制（建議限制網域）

### 2. 設定 API Key

在 `index.html` 檔案中找到以下行：

```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places"></script>
```

將 `YOUR_API_KEY` 替換為您的實際 API 金鑰：

```html
<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBvOkBkjQnlkj2w3Gv...&libraries=places"></script>
```

### 3. 本機執行

由於使用了 ES6 模組，需要透過 HTTP 伺服器執行，不能直接開啟 HTML 檔案。

#### 方法一：使用 Live Server（推薦）

如果您使用 VS Code，可以安裝 Live Server 擴充功能：

1. 在 VS Code 中開啟專案資料夾
2. 右鍵點擊 `index.html`
3. 選擇「Open with Live Server」

#### 方法二：使用 Python 簡易伺服器

```powershell
# 在專案目錄下執行
cd "c:\Users\tzyu\Downloads\Demo"

# Python 3
python -m http.server 8000

# 或使用 Python 2
python -m SimpleHTTPServer 8000
```

然後在瀏覽器開啟：http://localhost:8000

#### 方法三：使用 Node.js http-server

```powershell
# 全域安裝 http-server
npm install -g http-server

# 在專案目錄下執行
cd "c:\Users\tzyu\Downloads\Demo"
http-server

# 預設會在 http://localhost:8080 啟動
```

## 使用方法

1. **搜尋餐廳**：
   - 在地址輸入框中輸入您想搜尋的地址
   - 點擊「搜尋餐廳」按鈕或按 Enter 鍵
   - 系統會搜尋該地址附近 500 公尺範圍內的餐廳

2. **瀏覽結果**：
   - 左側會顯示找到的餐廳列表
   - 右側地圖會顯示餐廳位置標記
   - 點擊列表中的餐廳或地圖標記可查看詳細資訊

3. **隨機選擇**：
   - 搜尋完成後，「隨機選一間」按鈈會啟用
   - 點擊後系統會隨機選擇一間餐廳
   - 地圖會自動聚焦到選中的餐廳

## 功能特色

- ✅ **即時搜尋**：支援台灣各地地址搜尋
- ✅ **詳細資訊**：顯示餐廳評分、電話、地址等
- ✅ **互動地圖**：可點擊標記查看餐廳資訊
- ✅ **響應式設計**：適配各種螢幕尺寸
- ✅ **錯誤處理**：友善的錯誤提示訊息
- ✅ **載入狀態**：清楚的載入進度指示

## 注意事項

### 安全性考量

- ⚠️ **API Key 保護**：此 DEMO 將 API Key 直接放在前端程式碼中，僅適用於展示用途
- 🔒 **生產環境**：實際部署時應將 API 呼叫移至後端，避免 API Key 暴露
- 🌐 **網域限制**：建議在 Google Cloud Console 中設定 API Key 的網域限制

### 瀏覽器支援

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 11+
- ✅ Edge 79+

### API 配額限制

- Google Maps API 有每日免費配額限制
- 超過限制後可能需要付費
- 建議在 Google Cloud Console 中設定預算警示

## 故障排除

### 常見問題

1. **地圖無法載入**
   - 檢查 API Key 是否正確設定
   - 確認已啟用 Maps JavaScript API 和 Places API
   - 檢查瀏覽器控制台是否有錯誤訊息

2. **搜尋無結果**
   - 嘗試更具體的地址（包含縣市、區域）
   - 確認地址格式正確
   - 檢查該地區是否有餐廳資料

3. **CORS 錯誤**
   - 確保透過 HTTP 伺服器執行，而非直接開啟 HTML 檔案
   - 檢查 API Key 的網域限制設定

## 開發說明

### 程式碼結構

- `api.js`：封裝 Google Maps 和 Places API 的呼叫邏輯
- `main.js`：主要應用程式邏輯，處理使用者互動和 UI 更新
- `style.css`：自定義樣式，包含響應式設計和動畫效果
- `index.html`：HTML 結構和第三方函式庫引用

### 擴充功能建議

- 🔄 **搜尋歷史**：儲存使用者搜尋記錄
- ⭐ **我的最愛**：允許使用者收藏餐廳
- 🔍 **進階搜尋**：按餐廳類型、價格範圍篩選
- 📍 **目前位置**：使用瀏覽器定位 API
- 🚶 **路線規劃**：整合 Google Maps 路線導航

---

## 授權聲明

此專案僅供學習和展示用途。使用 Google Maps API 時請遵循相關服務條款。
