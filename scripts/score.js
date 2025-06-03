// 紀錄是否為第一次載入
let isFirstLoad = true;

function fetchMatchData() {
	// 第一次載入時顯示loading動畫
	if (isFirstLoad) {
		$('#loading-container').show();
	}

	$.ajax({
		url: "https://script.google.com/macros/s/AKfycbxYnlqqRN_VmZNhsLkc6BZ09VBzaE23o-FkY9KeL0p8Zhh74-bp9CmaOdUrduhCRXeP/exec?type=score",
		data: {
			"no": 1,
		},
		success: function (response) {
			// 隱藏loading動畫（僅在第一次載入時）
			if (isFirstLoad) {
				$('#loading-container').hide();
				isFirstLoad = false;
			}
			
			if (response) {
				const $container = $('#matches-container');
				$container.empty();

				let htmlContent = '';

				response.matches.forEach(match => {
					htmlContent += `
						<div class="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 relative">
							<div class="text-center font-extrabold text-2xl text-gray-800 mb-4 border-b-2 border-orange-200 pb-2">${match.field}場地</div>
							<div class="absolute top-4 right-4 bg-orange-200 text-orange-800 px-3 py-1 rounded-full font-semibold text-sm">第${match.set}局</div>
							<div class="absolute top-4 left-4 bg-blue-200 text-blue-800 px-3 py-1 rounded-full font-semibold text-sm">場次：${match.matchNo}</div>
							<div class="flex flex-row justify-around items-center gap-6">
								<div class="flex-1 text-center">
									<div class="text-xl font-semibold text-gray-700 mb-2 h-20 flex items-center justify-center">${match.teams[0]}</div>
									<div class="w-24 h-24 bg-blue-500 rounded-full text-white text-4xl font-extrabold flex items-center justify-center mx-auto shadow-md">
									${match.setScores[match.setScores.length - 1].split(':')[0]}</div>
								</div>
								<div class="text-5xl font-bold text-orange-500 flex flex-col items-center justify-center">
									${match.gameScore}
									<div class="mt-4 text-base font-semibold text-gray-700">各局比分</div>
									<div class="flex flex-col gap-1 text-sm text-gray-600 mt-2">
									${Array.from({ length: 3 }, (_, i) => {
										if (match.setScores[i]) {
											const [score1, score2] = match.setScores[i].split(':').map(Number);
											let bgColor = 'bg-gray-100';
											let textColor = 'text-gray-600';
											
											if (score1 > score2) {
												bgColor = 'bg-blue-100';
												textColor = 'text-blue-700';
											} else if (score2 > score1) {
												bgColor = 'bg-red-100';
												textColor = 'text-red-700';
											}
											
											return `<div class="${bgColor} ${textColor} px-2 py-1 rounded-md text-center w-16 font-semibold">
												${match.setScores[i]}
											</div>`;
										} else {
											return `<div class="bg-gray-100 px-2 py-1 rounded-md text-center w-16">
												-
											</div>`;
										}
									}).join('')}
									</div>
								</div>
								<div class="flex-1 text-center">
									<div class="text-xl font-semibold text-gray-700 mb-2 h-20 flex items-center justify-center">${match.teams[1]}</div>
									<div class="w-24 h-24 bg-red-500 rounded-full text-white text-4xl font-extrabold flex items-center justify-center mx-auto shadow-md">
									${match.setScores[match.setScores.length - 1].split(':')[1]}</div>
								</div>
							</div>
						</div>
					`;
				});

				$container.html(htmlContent);
			}
		},
		error: function (error) {
			// 隱藏loading動畫（僅在第一次載入時）
			if (isFirstLoad) {
				$('#loading-container').hide();
				isFirstLoad = false;
			}
			console.error('Error fetching data:', error);
			
			// 如果是第一次載入或容器為空，顯示錯誤提示
			if (isFirstLoad || $('#matches-container').children().length === 0) {
				const $container = $('#matches-container');
				$container.html(`
					<div class="col-span-full text-center py-12">
						<div class="text-red-500 text-xl font-semibold mb-2">載入失敗</div>
						<div class="text-gray-600">請檢查網路連線或稍後再試</div>
					</div>
				`);
			}
		}
	});
}

$(document).ready(function() {
	// 初始載入資料
	fetchMatchData();
	
	// 設定定時更新
	setInterval(() => {
		fetchMatchData();
	}, 5000);
}); 