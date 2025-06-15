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

        // 複決賽隊伍列表 - 從 roundResults 中獲取每個組別前兩名
        const $teamsList = $('.round-robin-teams-list');
        const qualifiedTeams = new Set(); // 使用Set來避免重複的隊伍名稱
        
        // 檢查是否所有前兩名隊伍都有 rank
        let allRanksAvailable = true;
        const groupTopTeams = {};
        
        // 先整理每個組別的前兩名隊伍
        response.roundResults.forEach(result => {
            if (result.rank <= 2) {
                if (!groupTopTeams[result.group]) {
                    groupTopTeams[result.group] = [];
                }
                groupTopTeams[result.group].push(result);
                
                // 如果 rank 是空字串，標記為未完全準備好
                if (result.rank === '') {
                    allRanksAvailable = false;
                }
            }
        });
        
        // 只有在所有前兩名隊伍都有 rank 時才更新
        if (allRanksAvailable) {
            // 將每個組別的前兩名隊伍加入 Set
            Object.values(groupTopTeams).forEach(teams => {
                teams.forEach(team => {
                    qualifiedTeams.add(team.team);
                });
            });
            
            // 迭代現有的隊伍卡片並更新內容
            const teamNamesArray = Array.from(qualifiedTeams);
            $teamsList.find('.round-robin-team-card').each(function(index) {
                if (index < teamNamesArray.length) {
                    $(this).text(teamNamesArray[index]);
                }
            });
        }

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