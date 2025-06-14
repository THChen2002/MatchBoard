function fetchResultsData() {
    fetchData('results', function(response) {
        // console.log('獲取賽程資料成功:', response);
		
		// 循環賽隊伍 & 分數
		$('.round-robin-match').each(function() {
            const $this = $(this);
            const matchNo = $this.data('match-no');
            const matchData = response.matches.find(match => match.matchNo === matchNo);
            if (matchData) {
                // 場次
                $this.find('.match-number').text(`(${matchData.matchNo})`);
                // 時間
                $this.find('.match-time').text(matchData.time);
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

        // 複決賽隊伍列表 - 從場次19開始的比賽中獲取隊伍
        const $teamsList = $('.round-robin-teams-list');
        const qualifiedTeams = new Set(); // 使用Set來避免重複的隊伍名稱
        
        // 從場次19開始的比賽中獲取隊伍
        response.matches.forEach(match => {
            const matchNum = chineseNumberMap[match.matchNo];
            if (matchNum >= 19) {
                if (match.teams && match.teams.length >= 2) {
                    qualifiedTeams.add(match.teams[0]);
                    qualifiedTeams.add(match.teams[1]);
                }
            }
        });
        
        // 迭代現有的隊伍卡片並更新內容
        const teamNamesArray = Array.from(qualifiedTeams);
        $teamsList.find('.round-robin-team-card').each(function(index) {
            if (index < teamNamesArray.length) {
                $(this).text(teamNamesArray[index]);
            }
        });

        $('#resultsContainer').show();
        $('#loadingContainer').hide();
        $('body').removeClass('loading-active');
    }, function(xhr, status, error) {
        $('#loadingContainer').hide();
        $('body').removeClass('loading-active');
        console.error('獲取隊伍資料失敗:', error);
    });
}

$(document).ready(function() {
    $('#resultsContainer').hide();
    $('#loadingContainer').show();
    $('body').addClass('loading-active');
    fetchResultsData();
}); 