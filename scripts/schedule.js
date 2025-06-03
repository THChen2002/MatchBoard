$(document).ready(function() {
	// 初始化賽程樹狀圖滾動位置
	const scrollBox = $('.tournament-scroll');
	if (scrollBox.length) {
	    scrollBox.scrollLeft((scrollBox[0].scrollWidth - scrollBox[0].clientWidth) / 2);
	}
}); 