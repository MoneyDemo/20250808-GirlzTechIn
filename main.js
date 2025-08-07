/**
 * 主應用程式模組
 * 處理使用者介面互動、餐廳列表渲染、隨機選擇等功能
 */

import GoogleMapsAPI from './api.js';

class RestaurantFinder {
    constructor() {
        this.googleMapsAPI = new GoogleMapsAPI();
        this.restaurants = [];
        this.selectedRestaurant = null;
        
        // DOM 元素
        this.elements = {
            addressInput: document.getElementById('addressInput'),
            searchBtn: document.getElementById('searchBtn'),
            randomBtn: document.getElementById('randomBtn'),
            loadingIndicator: document.getElementById('loadingIndicator'),
            errorMessage: document.getElementById('errorMessage'),
            errorText: document.getElementById('errorText'),
            restaurantList: document.getElementById('restaurantList'),
            restaurantCount: document.getElementById('restaurantCount')
        };

        this.initializeApp();
    }

    /**
     * 初始化應用程式
     */
    async initializeApp() {
        try {
            // 等待 Google Maps API 載入
            await this.waitForGoogleMaps();
            
            // 初始化地圖
            this.googleMapsAPI.initMap('map');
            
            // 綁定事件監聽器
            this.bindEventListeners();
            
            console.log('應用程式初始化完成');
        } catch (error) {
            console.error('初始化失敗：', error);
            this.showError('應用程式初始化失敗，請重新整理頁面再試。');
        }
    }

    /**
     * 等待 Google Maps API 載入完成
     */
    waitForGoogleMaps() {
        return new Promise((resolve, reject) => {
            if (typeof google !== 'undefined') {
                resolve();
            } else {
                const checkGoogleMaps = setInterval(() => {
                    if (typeof google !== 'undefined') {
                        clearInterval(checkGoogleMaps);
                        resolve();
                    }
                }, 100);
                
                // 30 秒超時
                setTimeout(() => {
                    clearInterval(checkGoogleMaps);
                    reject(new Error('Google Maps API 載入超時'));
                }, 30000);
            }
        });
    }

    /**
     * 綁定事件監聽器
     */
    bindEventListeners() {
        // 搜尋按鈕點擊事件
        this.elements.searchBtn.addEventListener('click', () => {
            this.handleSearch();
        });

        // 地址輸入框 Enter 鍵事件
        this.elements.addressInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch();
            }
        });

        // 隨機選擇按鈕點擊事件
        this.elements.randomBtn.addEventListener('click', () => {
            this.handleRandomSelection();
        });

        // 地址輸入框變化事件
        this.elements.addressInput.addEventListener('input', () => {
            this.clearError();
        });
    }

    /**
     * 處理搜尋功能
     */
    async handleSearch() {
        const address = this.elements.addressInput.value.trim();
        
        if (!address) {
            this.showError('請輸入地址');
            this.elements.addressInput.focus();
            return;
        }

        try {
            this.showLoading(true);
            this.clearError();
            this.disableRandomButton();

            console.log(`開始搜尋地址：${address}`);
            
            // 呼叫 API 搜尋餐廳
            this.restaurants = await this.googleMapsAPI.searchRestaurants(address, 500);
            
            console.log(`找到 ${this.restaurants.length} 間餐廳`);
            
            // 獲取餐廳詳細資訊（電話號碼等）
            await this.loadRestaurantDetails();
            
            // 渲染餐廳列表
            this.renderRestaurantList();
            
            // 啟用隨機選擇按鈕
            this.enableRandomButton();
            
            // 更新計數器
            this.updateRestaurantCount();

        } catch (error) {
            console.error('搜尋失敗：', error);
            
            // 根據錯誤類型顯示不同的錯誤訊息
            let errorMessage = error.message;
            if (errorMessage.includes('API Key')) {
                errorMessage = 'Google Maps API Key 設定有誤，請檢查設定。';
            } else if (errorMessage.includes('OVER_QUERY_LIMIT')) {
                errorMessage = 'API 查詢次數已達上限，請稍後再試。';
            } else if (errorMessage.includes('REQUEST_DENIED')) {
                errorMessage = 'API 請求被拒絕，請檢查 API Key 權限設定。';
            }
            
            this.showError(errorMessage);
            this.clearRestaurantList();
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * 載入餐廳詳細資訊
     */
    async loadRestaurantDetails() {
        for (const restaurant of this.restaurants) {
            try {
                const details = await this.googleMapsAPI.getRestaurantDetails(restaurant.id);
                restaurant.phone = details.phone;
                restaurant.website = details.website;
                restaurant.openingHours = details.openingHours;
            } catch (error) {
                console.warn(`無法載入餐廳 ${restaurant.name} 的詳細資訊：`, error);
            }
        }
    }

    /**
     * 處理隨機選擇功能
     */
    handleRandomSelection() {
        if (this.restaurants.length === 0) {
            this.showError('沒有可選擇的餐廳');
            return;
        }

        // 隨機選擇一間餐廳
        const randomIndex = Math.floor(Math.random() * this.restaurants.length);
        const randomRestaurant = this.restaurants[randomIndex];
        
        console.log(`隨機選中：${randomRestaurant.name}`);
        
        // 聚焦到選中的餐廳
        this.selectRestaurant(randomRestaurant);
        
        // 在地圖上聚焦
        this.googleMapsAPI.focusOnRestaurant(randomRestaurant);
        
        // 滾動到該餐廳項目
        this.scrollToRestaurantItem(randomIndex);
    }

    /**
     * 選擇餐廳
     * @param {Object} restaurant - 選中的餐廳
     */
    selectRestaurant(restaurant) {
        this.selectedRestaurant = restaurant;
        
        // 更新 UI 中的選中狀態
        const restaurantItems = this.elements.restaurantList.querySelectorAll('.restaurant-item');
        restaurantItems.forEach((item, index) => {
            item.classList.remove('selected');
            if (this.restaurants[index].id === restaurant.id) {
                item.classList.add('selected');
            }
        });
    }

    /**
     * 滾動到指定的餐廳項目
     * @param {number} index - 餐廳索引
     */
    scrollToRestaurantItem(index) {
        const restaurantItems = this.elements.restaurantList.querySelectorAll('.restaurant-item');
        if (restaurantItems[index]) {
            restaurantItems[index].scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }

    /**
     * 渲染餐廳列表
     */
    renderRestaurantList() {
        if (this.restaurants.length === 0) {
            this.clearRestaurantList();
            return;
        }

        const listHTML = this.restaurants.map((restaurant, index) => 
            this.createRestaurantItemHTML(restaurant, index)
        ).join('');

        this.elements.restaurantList.innerHTML = listHTML;
        
        // 綁定餐廳項目點擊事件
        this.bindRestaurantItemEvents();
    }

    /**
     * 建立餐廳項目 HTML
     * @param {Object} restaurant - 餐廳資料
     * @param {number} index - 索引
     * @returns {string} HTML 字串
     */
    createRestaurantItemHTML(restaurant, index) {
        const stars = this.generateStarRatingHTML(restaurant.rating);
        const phone = restaurant.phone ? 
            `<div class="restaurant-phone">
                <i class="fas fa-phone"></i>
                <a href="tel:${restaurant.phone}" class="restaurant-phone">${restaurant.phone}</a>
            </div>` : '';
        
        const typeText = this.formatRestaurantType(restaurant.type);
        
        return `
            <div class="restaurant-item fade-in" data-index="${index}">
                <div class="restaurant-name">${restaurant.name}</div>
                <div class="restaurant-type">
                    <i class="fas fa-utensils"></i>
                    ${typeText}
                </div>
                <div class="restaurant-address">
                    <i class="fas fa-map-marker-alt"></i>
                    ${restaurant.address}
                </div>
                <div class="restaurant-rating">
                    <span class="rating-stars">${stars}</span>
                    <span class="rating-text">${restaurant.rating.toFixed(1)} (${restaurant.userRatingsTotal} 評論)</span>
                </div>
                ${phone}
            </div>
        `;
    }

    /**
     * 格式化餐廳類型
     * @param {string} type - 原始類型
     * @returns {string} 格式化後的類型
     */
    formatRestaurantType(type) {
        const typeMap = {
            'restaurant': '餐廳',
            'food': '美食',
            'meal_takeaway': '外帶餐廳',
            'bakery': '烘焙店',
            'cafe': '咖啡廳',
            'bar': '酒吧',
            'night_club': '夜店',
            'meal_delivery': '外送餐廳'
        };
        return typeMap[type] || type;
    }

    /**
     * 生成星星評分 HTML
     * @param {number} rating - 評分
     * @returns {string} 星星 HTML
     */
    generateStarRatingHTML(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars += '<i class="fas fa-star"></i>';
            } else if (i - 0.5 <= rating) {
                stars += '<i class="fas fa-star-half-alt"></i>';
            } else {
                stars += '<i class="far fa-star"></i>';
            }
        }
        return stars;
    }

    /**
     * 綁定餐廳項目事件
     */
    bindRestaurantItemEvents() {
        const restaurantItems = this.elements.restaurantList.querySelectorAll('.restaurant-item');
        
        restaurantItems.forEach((item, index) => {
            item.addEventListener('click', () => {
                const restaurant = this.restaurants[index];
                this.selectRestaurant(restaurant);
                this.googleMapsAPI.focusOnRestaurant(restaurant);
            });
        });
    }

    /**
     * 清空餐廳列表
     */
    clearRestaurantList() {
        this.elements.restaurantList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search fa-2x mb-2"></i>
                <div>請輸入地址開始搜尋</div>
            </div>
        `;
        this.restaurants = [];
        this.selectedRestaurant = null;
        this.updateRestaurantCount();
    }

    /**
     * 更新餐廳數量顯示
     */
    updateRestaurantCount() {
        this.elements.restaurantCount.textContent = this.restaurants.length;
    }

    /**
     * 啟用隨機選擇按鈕
     */
    enableRandomButton() {
        this.elements.randomBtn.disabled = false;
        this.elements.randomBtn.classList.remove('btn-secondary');
        this.elements.randomBtn.classList.add('btn-success');
    }

    /**
     * 停用隨機選擇按鈕
     */
    disableRandomButton() {
        this.elements.randomBtn.disabled = true;
        this.elements.randomBtn.classList.remove('btn-success');
        this.elements.randomBtn.classList.add('btn-secondary');
    }

    /**
     * 顯示載入狀態
     * @param {boolean} show - 是否顯示
     */
    showLoading(show) {
        this.elements.loadingIndicator.style.display = show ? 'block' : 'none';
        this.elements.searchBtn.disabled = show;
        
        if (show) {
            this.elements.searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 搜尋中...';
        } else {
            this.elements.searchBtn.innerHTML = '<i class="fas fa-search"></i> 搜尋餐廳';
        }
    }

    /**
     * 顯示錯誤訊息
     * @param {string} message - 錯誤訊息
     */
    showError(message) {
        this.elements.errorText.textContent = message;
        this.elements.errorMessage.style.display = 'block';
        
        // 3 秒後自動隱藏錯誤訊息
        setTimeout(() => {
            this.clearError();
        }, 5000);
    }

    /**
     * 清除錯誤訊息
     */
    clearError() {
        this.elements.errorMessage.style.display = 'none';
        this.elements.errorText.textContent = '';
    }
}

// 當 DOM 載入完成後啟動應用程式
document.addEventListener('DOMContentLoaded', () => {
    console.log('開始載入餐廳搜尋應用程式...');
    new RestaurantFinder();
});
