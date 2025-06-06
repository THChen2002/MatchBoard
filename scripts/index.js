// 跑馬燈文字資料
let marqueeData = {};

// 設置跑馬燈文字
function setMarqueeText(text) {
	marqueeData.text = text;
	updateMarqueeDisplay();
}

// 設置跑馬燈顯示狀態
function setMarqueeVisible(visible) {
	marqueeData.isVisible = visible;
	updateMarqueeDisplay();
}

// 更新跑馬燈顯示
function updateMarqueeDisplay() {
	const $marqueeContainer = $('.marquee-container').parent().parent().parent();
	const $marqueeText = $('.marquee-text');
	
	if (marqueeData.text) {
		$marqueeText.text(marqueeData.text);
		$marqueeContainer.show();
	} else {
		$marqueeContainer.hide();
	}
}

// 取得並儲存跑馬燈資料
function getMarqueeData() {
	fetchAndStoreData('marquee', function(data) {
		setMarqueeText(data.text);
		setMarqueeVisible(true);
	}, function(xhr, status, error) {
		console.error('獲取跑馬燈資料失敗:', error);
	});
}

// 公告資料
let announcements = [];

// 公告類型map
const announcementTypeMap = {
	"重要": {
		typeClass: "bg-red-500",
		bgClass: "bg-red-50 border-red-400"
	},
	"一般": {
		typeClass: "bg-blue-500",
		bgClass: "bg-blue-50 border-blue-400"
	},
	"活動": {
		typeClass: "bg-green-500",
		bgClass: "bg-green-50 border-green-400"
	},
	"提醒": {
		typeClass: "bg-orange-500",
		bgClass: "bg-orange-50 border-orange-400"
	}
};

// 取得並儲存公告資料
function getAnnouncements() {
	// 顯示公告載入動畫，隱藏公告列表
	$('#announcementLoading').show();
	$('#announcementList').hide();
	
	fetchAndStoreData('announcements', function(data) {
		announcements = data.announcements.map(item => {
			const typeConfig = announcementTypeMap[item.type] || announcementTypeMap["一般"];
			return {
				...item,
				typeClass: typeConfig.typeClass,
				bgClass: typeConfig.bgClass
			};
		});
		renderAllAnnouncements();
		
		// 隱藏載入動畫，顯示公告列表
		$('#announcementLoading').hide();
		$('#announcementList').show();
	}, function(xhr, status, error) {
		console.error('獲取公告資料失敗:', error);
		const $listContainer = $('#announcementList');
		$listContainer.empty();
		const $errorElement = $('<div></div>')
			.addClass('text-red-500 text-center p-4')
			.text('無法獲取公告資料，請稍後再試。');
		$listContainer.append($errorElement);
		
		// 隱藏載入動畫，顯示公告列表（即使有錯誤）
		$('#announcementLoading').hide();
		$('#announcementList').show();
	});
}

// 渲染所有公告
function renderAllAnnouncements() {
	const $listContainer = $('#announcementList');
	$listContainer.empty();
	
	if (!announcements || announcements.length === 0) {
		// 如果沒有公告，顯示空狀態
		const $emptyElement = $('<div></div>')
			.addClass('text-gray-500 text-center p-8')
			.html(`
				<svg class="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-4.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 009.586 13H7"/>
				</svg>
				<p class="text-lg font-medium mb-2">暫無公告</p>
				<p class="text-sm">目前沒有新的公告資訊</p>
			`);
		$listContainer.append($emptyElement);
		return;
	}
	
	$.each(announcements, function(index, announcement) {
		const $announcementElement = $('<div></div>')
			.addClass(`border-l-4 ${announcement.bgClass} p-3 sm:p-4 rounded-r-lg`)
			.html(`
				<div class="flex items-start justify-between">
					<div class="flex-1 min-w-0">
						<div class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
							<span class="${announcement.typeClass} text-white text-xs px-2 py-1 rounded self-start">${announcement.type}</span>
							<span class="text-gray-500 text-xs sm:text-sm">${announcement.date}</span>
						</div>
						<h4 class="font-semibold text-gray-800 mb-1 text-sm sm:text-base">${announcement.title}</h4>
						<p class="text-gray-600 text-xs sm:text-sm leading-relaxed">${announcement.content}</p>
					</div>
				</div>
			`);
		
		$listContainer.append($announcementElement);
	});
}

$(document).ready(function() {
	// 初始化跑馬燈（非阻塞載入）
	getMarqueeData();

	// 初始化公告（會顯示載入動畫）
	getAnnouncements();
});