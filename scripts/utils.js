// Utility function to fetch data from the API
const API_URL = 'https://script.google.com/macros/s/AKfycbwrf8osm_3pH2_E8cJGwUnXGqBqrcIZzLFrRCd2_HDpJlKLaPoJwRofMH06bY4S0aD2/exec';
function fetchData(type, successCallback, errorCallback, data = {}) {
    $.ajax({
        url: `${API_URL}?type=${type}`,
        method: 'GET',
        data: data,
        success: successCallback,
        error: errorCallback
    });
}

// 取得並儲存資料到 localStorage
function fetchAndStoreData(type, successCallback, errorCallback, data = {}) {
    const storedData = localStorage.getItem(type);
    if (storedData) {
        successCallback(JSON.parse(storedData));
    } else {
        $.ajax({
            url: `${API_URL}?type=${type}`,
            method: 'GET',
            data: data,
            success: function(response) {
                localStorage.setItem(type, JSON.stringify(response));
                successCallback(response);
            },
            error: errorCallback
        });
    }
}

// 初始化所有資料
function initializeData() {
    const dataTypes = ['marquee', 'announcements', 'schedule', 'results', 'teams'];

    dataTypes.forEach(type => {
        if (!localStorage.getItem(type)) {
            fetchAndStoreData(type, function(data) {
                console.log(`${type} data fetched and stored.`);
            }, function(xhr, status, error) {
                console.error(`Failed to fetch ${type} data:`, error);
            });
        }
    });
}

// 初始化所有資料
initializeData();