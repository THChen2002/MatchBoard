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