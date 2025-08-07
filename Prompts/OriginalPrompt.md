幫我建立一個使用 HTML, CSS, JS 的網站，網站的主要功能為吃甚麼。

使用純 HTML、CSS 和 JavaScript 來實作。
首頁直接放在根目錄並命名為 index.html。
網站的主要功能為吃甚麼，使用者可以透過輸入地址來搜尋附近的餐廳，並且可以選擇餐廳類型與搜尋範圍。

網站的使用者功能有:
- 首頁
  - 使用者可以輸入地址
  - 使用者可以選擇餐廳類型
    - Ex: 中式、日式、義式、韓式、美式
  - 提供一個選項可以設定搜尋範圍
    - Ex: 500公尺、1公里、2公里
        - 預設值為500公尺
  - 透過使用者輸入的地址
    - 顯示附近的餐廳
      - 使用列表方式顯示餐廳
        - 餐廳名稱
        - 餐廳類型
        - 餐廳地址
        - 餐廳的評價
        - Google Map 顯示餐廳位置
        - 餐廳的電話
        - 使用者可以透過點擊"隨機"按鈕隨機選擇餐廳
      - 提供一個頁面透過地圖顯示所有有搜尋到的餐廳
        - 使用 Google Map API 顯示地圖
        - 顯示使用者輸入的地址
        - 顯示所有搜尋到的餐廳位置
        - 點擊餐廳位置顯示餐廳資訊
  - 最後提供一個按鈕可以隨機選擇在列表內的餐廳

系統的網站架構與設計應該要有:
- OS 是 Windows 11
  - 所有 command 請使用 PowerShell 來執行
- 地圖請使用 Google Map API 與 Google Places API
  - 使用者可以透過 Google Map API 顯示地圖
  - 使用者可以透過 Google Map API 顯示餐廳位置
  - 使用者可以透過 Google Map API 顯示餐廳資訊
  - 跟 Google Map API 有關的呼叫請全部使用前端 JAVASCRIPT 來呼叫
  - 地圖相關請使用繁體中文顯示
- 網站語言請確保使用繁體中文
- 提供 README.md 檔案，說明如何啟動網站等常見 README 內容。
- 程式碼必須包含適當的註解。
  - 所有的 Class 與 Method 一定要有註解
  - 所有的變數與參數一定要有註解
  - 適當地為所有程式碼加入註解
- 使用 Bootstrap 5 來設計網站。
  - 使用 fontawesome 來提供 ICON。
  - 畫面要華麗
  - 可以加入動畫效果。
  - 畫面的整體色調一定要色彩繽紛
  - 要有 Dark Mode 與 Light Mode 的切換功能。
- 使用 jsdeliver CDN 來載入 Bootstrap 5 與 fontawesome。
  - 若有任何其他前段需要的 library 也要使用 jsdeliver CDN。
 
其他要求:
- 請使用繁體中文

直接開始實作