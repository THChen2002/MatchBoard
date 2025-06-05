function fetchScheduleData() {
    fetchAndStoreData('results', function(response) {
		// console.log('獲取賽程資料成功:', response);

		// 循環賽隊伍
		$('.team-node').each(function() {
			const $this = $(this);
			const matchNo = $this.data('match-no');
			const matchData = response.matches.find(match => match.matchNo === matchNo);
			if (matchData) {
				// 隊伍名稱取第一個
				$this.text(matchData.teams[0]);
			}
		});

		// 循環賽分數
        $('.score-node').each(function() {
            const $this = $(this);
            const matchNo = $this.data('match-no');
            const matchData = response.matches.find(match => match.matchNo === matchNo);

            if (matchData) {
                $this.text(matchData.gameScore);
            }
		});

		$('.node-content').each(function() {
			const $this = $(this);
			const matchNo = $this.data('match-no');
			const matchData = response.matches.find(match => match.matchNo === matchNo);

			if (matchData) {
				$this.children('.match-box').empty().append(
					`<div class="team">
						<span class="name">${matchData.teams[0]}</span>
						<span class="score">${matchData.gameScore.split(':')[0]}</span>
					</div>
					<div class="team">
						<span class="name">${matchData.teams[1]}</span>
						<span class="score opponent">${matchData.gameScore.split(':')[1]}</span>
					</div>`
				);
			}
		});

		$('#scheduleContainer').show();
		$('#loadingContainer').hide();
    }, function(xhr, status, error) {
        console.error('獲取隊伍資料失敗:', error);
    });
}

$(document).ready(function() {
	// 初始化賽程樹狀圖滾動位置
	const scrollBox = $('.tournament-scroll');
	if (scrollBox.length) {
	    scrollBox.scrollLeft((scrollBox[0].scrollWidth - scrollBox[0].clientWidth) / 2);
	}

	$('#scheduleContainer').hide();
	$('#loadingContainer').show();
	// 獲取賽程資料
	fetchScheduleData();
}); 