/**
 * Google Maps 和 Places API 封裝模組
 * 處理地址解析、餐廳搜尋等功能
 */

class GoogleMapsAPI {
    constructor() {
        this.map = null;
        this.service = null;
        this.geocoder = null;
        this.markers = [];
        this.infoWindow = null;
    }

    /**
     * 初始化 Google Maps
     * @param {string} mapElementId - 地圖容器的 DOM ID
     */
    initMap(mapElementId) {
        // 設定預設位置（台北101）
        const defaultLocation = { lat: 25.0330, lng: 121.5654 };
        
        // 建立地圖
        this.map = new google.maps.Map(document.getElementById(mapElementId), {
            center: defaultLocation,
            zoom: 15,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
            zoomControl: true
        });

        // 初始化服務
        this.service = new google.maps.places.PlacesService(this.map);
        this.geocoder = new google.maps.Geocoder();
        this.infoWindow = new google.maps.InfoWindow();

        console.log('Google Maps 初始化完成');
    }

    /**
     * 將地址轉換為經緯度座標
     * @param {string} address - 要解析的地址
     * @returns {Promise<{lat: number, lng: number}>} 座標物件
     */
    async geocodeAddress(address) {
        return new Promise((resolve, reject) => {
            this.geocoder.geocode({ address: address }, (results, status) => {
                if (status === 'OK' && results[0]) {
                    const location = results[0].geometry.location;
                    resolve({
                        lat: location.lat(),
                        lng: location.lng()
                    });
                } else {
                    reject(new Error(`無法解析地址：${address}。請檢查地址格式是否正確。`));
                }
            });
        });
    }

    /**
     * 搜尋指定位置附近的餐廳
     * @param {string} address - 搜尋地址
     * @param {number} radius - 搜尋半徑（公尺）
     * @returns {Promise<Array>} 餐廳列表
     */
    async searchRestaurants(address, radius = 500) {
        try {
            // 將地址轉換為座標
            const location = await this.geocodeAddress(address);
            
            // 更新地圖中心
            this.map.setCenter(location);
            this.map.setZoom(16);

            // 清除舊的標記
            this.clearMarkers();

            // 首先嘗試使用 textSearch 方式
            let results;
            try {
                results = await this.performTextSearch(location, radius);
            } catch (textSearchError) {
                console.warn('文字搜尋失敗，嘗試附近搜尋：', textSearchError);
                // 如果文字搜尋失敗，則使用 nearbySearch
                results = await this.performNearbySearch(location, radius);
            }
            
            // 在地圖上添加標記
            this.addRestaurantMarkers(results);

            return results;
        } catch (error) {
            console.error('搜尋餐廳時發生錯誤：', error);
            throw error;
        }
    }

    /**
     * 執行文字搜尋
     * @param {Object} location - 位置座標
     * @param {number} radius - 搜尋半徑
     * @returns {Promise<Array>} 搜尋結果
     */
    performTextSearch(location, radius) {
        return new Promise((resolve, reject) => {
            const request = {
                location: new google.maps.LatLng(location.lat, location.lng),
                radius: radius,
                query: '餐廳 restaurant'
            };

            console.log('文字搜尋請求參數：', request);

            this.service.textSearch(request, (results, status) => {
                console.log('文字搜尋狀態：', status);
                console.log('文字搜尋結果：', results);

                if (status === google.maps.places.PlacesServiceStatus.OK && results.length > 0) {
                    const restaurants = results.map(place => this.formatRestaurantData(place));
                    resolve(restaurants);
                } else {
                    reject(new Error(`文字搜尋失敗：${status}`));
                }
            });
        });
    }

    /**
     * 執行附近搜尋
     * @param {Object} location - 位置座標  
     * @param {number} radius - 搜尋半徑
     * @returns {Promise<Array>} 搜尋結果
     */
    performNearbySearch(location, radius) {
        return new Promise((resolve, reject) => {
            const request = {
                location: new google.maps.LatLng(location.lat, location.lng),
                radius: radius,
                keyword: '餐廳 restaurant food'
            };

            console.log('附近搜尋請求參數：', request);

            this.service.nearbySearch(request, (results, status) => {
                console.log('附近搜尋狀態：', status);
                console.log('附近搜尋結果：', results);

                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    // 過濾並格式化結果
                    const restaurants = results.filter(place => 
                        place.business_status === 'OPERATIONAL' || !place.business_status
                    ).map(place => this.formatRestaurantData(place));

                    if (restaurants.length === 0) {
                        reject(new Error('在此地址附近沒有找到餐廳，請嘗試其他地址。'));
                    } else {
                        resolve(restaurants);
                    }
                } else {
                    // 詳細的錯誤狀態處理
                    let errorMessage = '搜尋餐廳時發生錯誤：';
                    
                    switch (status) {
                        case google.maps.places.PlacesServiceStatus.ZERO_RESULTS:
                            errorMessage = '在此地址附近沒有找到餐廳，請嘗試其他地址。';
                            break;
                        case google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT:
                            errorMessage = 'API 查詢次數已達上限，請稍後再試。';
                            break;
                        case google.maps.places.PlacesServiceStatus.REQUEST_DENIED:
                            errorMessage = 'API 請求被拒絕，請檢查 API Key 設定。';
                            break;
                        case google.maps.places.PlacesServiceStatus.INVALID_REQUEST:
                            errorMessage = '搜尋請求格式錯誤，請重新輸入地址。';
                            break;
                        case google.maps.places.PlacesServiceStatus.NOT_FOUND:
                            errorMessage = '找不到指定的地址，請檢查地址是否正確。';
                            break;
                        default:
                            errorMessage = `搜尋餐廳時發生錯誤：${status}，請稍後再試。`;
                    }
                    
                    console.error('Places API 錯誤：', status, errorMessage);
                    reject(new Error(errorMessage));
                }
            });
        });
    }

    /**
     * 執行 Places API 搜尋
     * @param {Object} request - 搜尋參數
     * @returns {Promise<Array>} 搜尋結果
     */
    performPlacesSearch(request) {
        return new Promise((resolve, reject) => {
            this.service.nearbySearch(request, (results, status) => {
                console.log('Places API 搜尋狀態：', status);
                console.log('搜尋結果：', results);

                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    // 過濾並格式化結果
                    const restaurants = results.filter(place => 
                        place.business_status === 'OPERATIONAL' || !place.business_status
                    ).map(place => this.formatRestaurantData(place));

                    if (restaurants.length === 0) {
                        reject(new Error('在此地址附近沒有找到餐廳，請嘗試其他地址。'));
                    } else {
                        resolve(restaurants);
                    }
                } else {
                    // 詳細的錯誤狀態處理
                    let errorMessage = '搜尋餐廳時發生錯誤：';
                    
                    switch (status) {
                        case google.maps.places.PlacesServiceStatus.ZERO_RESULTS:
                            errorMessage = '在此地址附近沒有找到餐廳，請嘗試其他地址。';
                            break;
                        case google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT:
                            errorMessage = 'API 查詢次數已達上限，請稍後再試。';
                            break;
                        case google.maps.places.PlacesServiceStatus.REQUEST_DENIED:
                            errorMessage = 'API 請求被拒絕，請檢查 API Key 設定。';
                            break;
                        case google.maps.places.PlacesServiceStatus.INVALID_REQUEST:
                            errorMessage = '搜尋請求格式錯誤，請重新輸入地址。';
                            break;
                        case google.maps.places.PlacesServiceStatus.NOT_FOUND:
                            errorMessage = '找不到指定的地址，請檢查地址是否正確。';
                            break;
                        default:
                            errorMessage = `搜尋餐廳時發生錯誤：${status}，請稍後再試。`;
                    }
                    
                    console.error('Places API 錯誤：', status, errorMessage);
                    reject(new Error(errorMessage));
                }
            });
        });
    }

    /**
     * 格式化餐廳資料
     * @param {Object} place - Google Places API 回傳的地點資料
     * @returns {Object} 格式化後的餐廳資料
     */
    formatRestaurantData(place) {
        try {
            return {
                id: place.place_id || `temp_${Date.now()}_${Math.random()}`,
                name: place.name || '未知餐廳',
                type: place.types?.[0]?.replace(/_/g, ' ') || '餐廳',
                address: place.vicinity || place.formatted_address || '地址未提供',
                rating: place.rating || 0,
                userRatingsTotal: place.user_ratings_total || 0,
                priceLevel: place.price_level,
                photoUrl: place.photos?.[0]?.getUrl({ maxWidth: 300, maxHeight: 200 }) || null,
                location: {
                    lat: place.geometry?.location?.lat() || 0,
                    lng: place.geometry?.location?.lng() || 0
                },
                place: place // 保留原始資料用於獲取詳細資訊
            };
        } catch (error) {
            console.warn('格式化餐廳資料時發生錯誤：', error, place);
            return {
                id: `error_${Date.now()}_${Math.random()}`,
                name: place.name || '餐廳資料異常',
                type: '餐廳',
                address: '地址未提供',
                rating: 0,
                userRatingsTotal: 0,
                priceLevel: null,
                photoUrl: null,
                location: { lat: 0, lng: 0 },
                place: place
            };
        }
    }

    /**
     * 在地圖上添加餐廳標記
     * @param {Array} restaurants - 餐廳列表
     */
    addRestaurantMarkers(restaurants) {
        restaurants.forEach((restaurant, index) => {
            const marker = new google.maps.Marker({
                position: restaurant.location,
                map: this.map,
                title: restaurant.name,
                icon: {
                    url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                    scaledSize: new google.maps.Size(32, 32)
                }
            });

            // 點擊標記顯示資訊視窗
            marker.addListener('click', () => {
                this.showRestaurantInfo(restaurant, marker);
            });

            this.markers.push({ marker, restaurant, index });
        });
    }

    /**
     * 顯示餐廳資訊視窗
     * @param {Object} restaurant - 餐廳資料
     * @param {google.maps.Marker} marker - 地圖標記
     */
    showRestaurantInfo(restaurant, marker) {
        const stars = this.generateStarRating(restaurant.rating);
        const priceLevel = this.getPriceLevelText(restaurant.priceLevel);
        
        const content = `
            <div style="max-width: 250px;">
                <h6 style="margin-bottom: 8px; color: #333;">${restaurant.name}</h6>
                <div style="margin-bottom: 4px;">
                    <span style="color: #6c757d; font-size: 12px;">${restaurant.type}</span>
                </div>
                <div style="margin-bottom: 4px;">
                    <span style="color: #ffc107;">${stars}</span>
                    <span style="color: #6c757d; font-size: 12px; margin-left: 4px;">
                        ${restaurant.rating.toFixed(1)} (${restaurant.userRatingsTotal} 評論)
                    </span>
                </div>
                ${priceLevel ? `<div style="margin-bottom: 4px; color: #28a745; font-size: 12px;">${priceLevel}</div>` : ''}
                <div style="color: #6c757d; font-size: 12px;">${restaurant.address}</div>
            </div>
        `;

        this.infoWindow.setContent(content);
        this.infoWindow.open(this.map, marker);
    }

    /**
     * 生成星星評分 HTML
     * @param {number} rating - 評分數值
     * @returns {string} 星星 HTML
     */
    generateStarRating(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars += '★';
            } else if (i - 0.5 <= rating) {
                stars += '☆';
            } else {
                stars += '☆';
            }
        }
        return stars;
    }

    /**
     * 取得價格等級文字
     * @param {number} priceLevel - 價格等級 (0-4)
     * @returns {string} 價格等級文字
     */
    getPriceLevelText(priceLevel) {
        const priceLevels = {
            0: '免費',
            1: '$ 便宜',
            2: '$$ 適中',
            3: '$$$ 昂貴',
            4: '$$$$ 非常昂貴'
        };
        return priceLevels[priceLevel] || '';
    }

    /**
     * 聚焦到指定餐廳並顯示資訊
     * @param {Object} restaurant - 餐廳資料
     */
    focusOnRestaurant(restaurant) {
        // 找到對應的標記
        const markerData = this.markers.find(m => m.restaurant.id === restaurant.id);
        if (markerData) {
            // 移動地圖中心到餐廳位置
            this.map.setCenter(restaurant.location);
            this.map.setZoom(18);
            
            // 顯示資訊視窗
            this.showRestaurantInfo(restaurant, markerData.marker);
            
            // 標記動畫效果
            markerData.marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(() => {
                markerData.marker.setAnimation(null);
            }, 1500);
        }
    }

    /**
     * 清除所有地圖標記
     */
    clearMarkers() {
        this.markers.forEach(markerData => {
            markerData.marker.setMap(null);
        });
        this.markers = [];
        this.infoWindow.close();
    }

    /**
     * 獲取餐廳詳細資訊（電話號碼等）
     * @param {string} placeId - 地點 ID
     * @returns {Promise<Object>} 詳細資訊
     */
    async getRestaurantDetails(placeId) {
        return new Promise((resolve, reject) => {
            const request = {
                placeId: placeId,
                fields: ['name', 'formatted_phone_number', 'website', 'opening_hours']
            };

            this.service.getDetails(request, (place, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    resolve({
                        phone: place.formatted_phone_number,
                        website: place.website,
                        openingHours: place.opening_hours
                    });
                } else {
                    resolve({}); // 如果無法獲取詳細資訊，回傳空物件
                }
            });
        });
    }
}

// 匯出 API 類別
export default GoogleMapsAPI;
