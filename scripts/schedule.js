function fetchScheduleData() {
    fetchData('results', function(response) {
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
		
		// 複決賽隊伍及比分
		$('.node-content').each(function() {
			const $this = $(this);
			const matchNo = $this.data('match-no');
			const matchData = response.matches.find(match => match.matchNo === matchNo);

			if (matchData) {
				// 更新隊伍名稱
				$this.find('.team-blue .name').text(matchData.teams[0]);
				$this.find('.team-red .name').text(matchData.teams[1]);
				
				// 更新分數
				const scores = matchData.gameScore.split(':');
				const blueScore = parseInt(scores[0]);
				const redScore = parseInt(scores[1]);
				
				$this.find('.team-blue .score').text(blueScore);
				$this.find('.team-red .score').text(redScore);
				
				// 判斷贏家並加上 winning-team class
				const $blueTeam = $this.find('.team-blue');
				const $redTeam = $this.find('.team-red');
				
				// 給贏的隊伍加上 winning-team class
				if (blueScore > redScore) {
					$blueTeam.addClass('winning-team');
				} else if (redScore > blueScore) {
					$redTeam.addClass('winning-team');
				}
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