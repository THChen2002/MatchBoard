const API_URL = 'https://script.google.com/macros/s/AKfycbzOAcbnZQArA5Eb79aRWZWJY7wyTk5ni5hZsBC8tORcu3lDQhiKyc9-Hqc2YJ3z_xvr/exec';

// 將中文數字轉換為阿拉伯數字
const chineseNumberMap = {
    "一": 1, "二": 2, "三": 3, "四": 4, "五": 5,
    "六": 6, "七": 7, "八": 8, "九": 9, "十": 10,
    "十一": 11, "十二": 12, "十三": 13, "十四": 14, "十五": 15,
    "十六": 16, "十七": 17, "十八": 18, "十九": 19,
    "二十": 20, "廿": 20,
    "廿一": 21, "廿二": 22, "廿三": 23, "廿四": 24, "廿五": 25, "廿六": 26, "廿七": 27, "廿八": 28, "廿九": 29,
    "三十": 30, "卅": 30
  };

function fetchData(type, successCallback, errorCallback, data = {}) {
    $.ajax({
        url: `${API_URL}?type=${type}`,
        method: 'GET',
        data: data,
        success: successCallback,
        error: errorCallback
    });
}

// 取得並儲存資料到 sessionStorage
function fetchAndStoreData(type, successCallback, errorCallback, data = {}) {
    const storedData = sessionStorage.getItem(type);
    if (storedData) {
        successCallback(JSON.parse(storedData));
    } else {
        $.ajax({
            url: `${API_URL}?type=${type}`,
            method: 'GET',
            data: data,
            success: function(response) {
                sessionStorage.setItem(type, JSON.stringify(response));
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
                // console.log(`Fetched ${type} data successfully:`, data);
            }, function(xhr, status, error) {
                console.error(`Failed to fetch ${type} data:`, error);
            });
        }
    });
}

// 初始化所有資料
initializeData();