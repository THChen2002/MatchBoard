function fetchResultsData() {
    fetchData('results', function(response) {
        // console.log('獲取賽程資料成功:', response);
		
		// 循環賽隊伍
		$('.round-robin-match').each(function() {
            const $this = $(this);
            const matchNo = $this.data('match-no');
            const matchData = response.matches.find(match => match.matchNo === matchNo);
            if (matchData) {
                $this.children('.team-container').empty().append(
                    `<span class="team-box">${matchData.teams[0]} A1</span>
                    <span>vs</span>
                    <span class="team-box">${matchData.teams[1]} A2</span>`
                );
                $this.children('.score-container').empty().append(
                    `<span class="score-box">${matchData.gameScore.split(':')[0]}</span>
                    <span>:</span>
                    <span class="score-box">${matchData.gameScore.split(':')[1]}</span>`
                );
            }
        });

		// 循環賽分數
        $('#resultsContainer').show();
        $('#loading-container').hide();
    }, function(xhr, status, error) {
        $('#loading-container').hide();
        console.error('獲取隊伍資料失敗:', error);
    });
}

$(document).ready(function() {
    $('#resultsContainer').hide();
    $('#loading-container').show();
    fetchResultsData();
}); 