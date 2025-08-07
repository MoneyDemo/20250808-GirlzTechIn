你現在是一個專業的前端工程師，請在 DEMO 網站範圍內一次成功交付以下需求，並以繁體中文回覆所有註解與文字。

幫我建立一個 DEMO 網站，使用純 HTML、CSS、JavaScript (ES6 module)，主要示範「吃甚麼」功能：輸入地址後搜尋附近餐廳，並能隨機挑選一間。

---

## 一、專案目的
- 示範「吃甚麼」功能：輸入地址後搜尋附近餐廳，並能隨機挑選一間。

## 二、技術棧與資源
1. HTML + CSS + 原生 JavaScript (ES6 module)  
2. Bootstrap 5 via jsDelivr CDN  
3. FontAwesome Icons via jsDelivr CDN  
4. Google Maps JavaScript API + Google Places API（前端呼叫，API Key 直接放在 index.html script 標籤）  
5. 所有文字與程式註解請使用繁體中文  

## 三、檔案與目錄結構
```
index.html
style.css
api.js       ← 封裝 Google Maps/Places 呼叫
main.js      ← 處理搜尋、列表渲染、隨機選擇
README.md
```

## 四、核心功能

### 1. 首頁 (index.html)
- 地址輸入框 + 「搜尋」按鈕  
- 「隨機選一間」按鈕（搜尋前 disabled，搜尋後啟用）  
- Google Map 容器  
- 餐廳列表區（顯示名稱、類型、地址、評分、電話）  
- Google Maps API Key 直接在 `<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places"></script>` 標籤填入

### 2. 功能流程
1. 使用者輸入地址後按「搜尋」  
2. 呼叫 `searchRestaurants(address, radius)`（預設半徑 500 公尺）  
3. API 回傳清單，在地圖上打標記並渲染列表  
4. 啟用「隨機選一間」按鈕  
5. 按下「隨機選一間」後：  
   - 從列表隨機挑一筆  
   - 將地圖定位到該標記並開啟資訊視窗  

### 3. 錯誤處理
- 地址解析失敗、API 回傳錯誤或無結果時，在頁面顯示友善提示  

## 五、程式碼規範
- 函式／變數／重要邏輯必須加中文註解  
- 使用 ES6 `async/await` 處理非同步  

## 六、README.md 內容
1. 專案說明與 DEMO 目的  
2. 取得 Google Maps & Places API Key，並在 `index.html` 的 `<script>` 標籤填入  
   ```html
   <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places&language=zh-TW"></script>
   ```
3. 本機啟動方式：
   ```powershell
   # 本機開啟 index.html 即可，無需其他伺服器
   Start-Process index.html
   ```  
4. 注意事項：  
   - 需允許載入外部 CDN  
   - API Key 不要公開上傳  

---

請直接開始實作，並依照上述需求建立所有主要檔案的完整程式碼。