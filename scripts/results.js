function fetchResultsData() {
    fetchData('results', function(response) {
        // console.log('獲取賽程資料成功:', response);
		
		// 循環賽隊伍 & 分數
		$('.round-robin-match').each(function() {
            const $this = $(this);
            const matchNo = $this.data('match-no');
            const matchData = response.matches.find(match => match.matchNo === matchNo);
            if (matchData) {
                // 隊伍
                const $teamLeft = $this.find('.team-container .team-left');
                const $teamRight = $this.find('.team-container .team-right');
                $teamLeft.text(matchData.teams[0]);
                $teamRight.text(matchData.teams[1]);
                
                // 各局比分
                matchData.setScores.forEach((setScore, index) => {
                    const scores = setScore.split(':');
                    const leftSetScore = parseInt(scores[0], 10);
                    const rightSetScore = parseInt(scores[1], 10);
                    let setClass = '';
                    if (leftSetScore > rightSetScore) {
                        setClass = 'left-win';
                    } else if (rightSetScore > leftSetScore) {
                        setClass = 'right-win';
                    }
                    const $setScoreElement = $this.find('.set-scores .set-score').eq(index);
                    $setScoreElement.text(setScore).removeClass('unplayed').addClass(setClass);
                });
                
                // 總比分
                const leftScore = parseInt(matchData.gameScore.split(':')[0], 10);
                const rightScore = parseInt(matchData.gameScore.split(':')[1], 10);
                $this.find('.score-container .team-left').text(leftScore);
                $this.find('.score-container .team-right').text(rightScore);
            }
        });

        $('#resultsContainer').show();
        $('#loadingContainer').hide();
    }, function(xhr, status, error) {
        $('#loadingContainer').hide();
        console.error('獲取隊伍資料失敗:', error);
    });
}

$(document).ready(function() {
    $('#resultsContainer').hide();
    $('#loadingContainer').show();
    fetchResultsData();
}); 