// 紀錄是否為第一次載入
let isFirstLoad = true;
// 儲存之前的分數資料
let previousScores = {};
// 儲存即將更新的分數資料
let pendingScores = {};

function fetchMatchData() {
	// 第一次載入時顯示loading動畫
	if (isFirstLoad) {
		$('#loadingContainer').show();
		$('body').addClass('loading-active');
	}

	fetchData('score', function(response) {
		// 隱藏loading動畫（僅在第一次載入時）
		if (isFirstLoad) {
			$('#loadingContainer').hide();
			$('body').removeClass('loading-active');
			// 顯示即時更新橫幅
			$('#live-update-banner').removeClass('hidden').addClass('fade-in-down');
			isFirstLoad = false;
		}
		
		if (response) {
			const $container = $('#matches-container');
			
			// 如果不是第一次載入，檢查分數變化並觸發動畫
			if (Object.keys(previousScores).length > 0) {
				let hasScoreChanges = false;
				
				response.matches.forEach(match => {
					const matchKey = `${match.field}-${match.matchNo}`;
					const currentScore = match.setScores[match.setScores.length - 1];
					const [currentScore1, currentScore2] = currentScore.split(':').map(Number);
					
					if (previousScores[matchKey]) {
						const [prevScore1, prevScore2] = previousScores[matchKey].split(':').map(Number);
						if (currentScore1 > prevScore1 || currentScore2 > prevScore2) {
							hasScoreChanges = true;
							// 儲存新分數待更新
							pendingScores[matchKey] = {
								newScore1: currentScore1,
								newScore2: currentScore2,
								team1Changed: currentScore1 > prevScore1,
								team2Changed: currentScore2 > prevScore2
							};
						}
					}
				});
				
				if (hasScoreChanges) {
					// 先觸發動畫，在動畫過程中更新分數
					triggerScoreAnimations();
					return; // 不立即更新HTML
				}
			}
			
			$container.empty();

			let htmlContent = '';

			response.matches.forEach(match => {
				// 檢查每個隊伍的分數是否有變化
				const matchKey = `${match.field}-${match.matchNo}`;
				const currentScore = match.setScores[match.setScores.length - 1];
				const [currentScore1, currentScore2] = currentScore.split(':').map(Number);
				
				// 更新之前的分數記錄
				previousScores[matchKey] = currentScore;

				htmlContent += `
					<div class="match-card">
						<div class="field-title">${match.field}場地</div>
						<div class="match-label set-label">第${match.set}局</div>
						<div class="match-label match-number-label">場次：${match.matchNo}</div>
						<div class="match-content">
							<div class="team-container">
								<div class="team-name">${match.teams[0]}</div>
								<div class="score-circle team1" data-match="${matchKey}" data-team="0">
								${currentScore1}</div>
							</div>
							<div class="center-score">
								${match.gameScore}
								<div class="sets-title">各局比分</div>
								<div class="sets-container">
								${Array.from({ length: 3 }, (_, i) => {
									if (match.setScores[i]) {
										const [score1, score2] = match.setScores[i].split(':').map(Number);
										let scoreClass = 'no-result';
										
										if (score1 > score2) {
											scoreClass = 'team1-win';
										} else if (score2 > score1) {
											scoreClass = 'team2-win';
										}
										
										return `<div class="set-score ${scoreClass}">
											${match.setScores[i]}
										</div>`;
									} else {
										return `<div class="set-score no-result">
											-
										</div>`;
									}
								}).join('')}
								</div>
							</div>
							<div class="team-container">
								<div class="team-name">${match.teams[1]}</div>
								<div class="score-circle team2" data-match="${matchKey}" data-team="1">
								${currentScore2}</div>
							</div>
						</div>
					</div>
				`;
			});

			$container.html(htmlContent);
		}
	}, function(error) {
		// 隱藏loading動畫（僅在第一次載入時）
		if (isFirstLoad) {
			$('#loadingContainer').hide();
			$('body').removeClass('loading-active');
			// 顯示即時更新橫幅
			$('#live-update-banner').removeClass('hidden').addClass('fade-in-down');
			isFirstLoad = false;
		}
		console.error('Error fetching data:', error);
		
		// 如果是第一次載入或容器為空，顯示錯誤提示
		if (isFirstLoad || $('#matches-container').children().length === 0) {
			const $container = $('#matches-container');
			$container.html(`
				<div class="error-state">
					<div class="error-title">載入失敗</div>
					<div class="error-message">請檢查網路連線或稍後再試</div>
				</div>
			`);
		}
	});
}

// 觸發分數變化動畫
function triggerScoreAnimations() {
	// 找到所有需要更新的分數圓圈
	Object.keys(pendingScores).forEach(matchKey => {
		const scoreData = pendingScores[matchKey];
		
		// 找到對應的分數圓圈
		if (scoreData.team1Changed) {
			const $team1Circle = $(`.score-circle[data-match="${matchKey}"][data-team="0"]`);
			animateScoreChange($team1Circle, scoreData.newScore1);
		}
		
		if (scoreData.team2Changed) {
			const $team2Circle = $(`.score-circle[data-match="${matchKey}"][data-team="1"]`);
			animateScoreChange($team2Circle, scoreData.newScore2);
		}
		
		// 更新之前的分數記錄，避免重複觸發動畫
		previousScores[matchKey] = `${scoreData.newScore1}:${scoreData.newScore2}`;
	});
	
	// 清空待處理的分數
	pendingScores = {};
}

// 單個分數圓圈的動畫
function animateScoreChange($scoreCircle, newScore) {
	// 添加翻頁動畫
	$scoreCircle.addClass('score-flip');
	
	// 在動畫中間更新分數
	setTimeout(() => {
		$scoreCircle.text(newScore);
	}, 400);
	
	// 延遲添加高亮動畫
	setTimeout(() => {
		$scoreCircle.addClass('score-highlight');
	}, 500);
	
	// 清除動畫類別
	setTimeout(() => {
		$scoreCircle.removeClass('score-flip score-highlight');
	}, 1500);
}

$(document).ready(function() {
	// 初始載入資料
	fetchMatchData();
	
	// 設定定時更新
	setInterval(() => {
		fetchMatchData();
	}, 5000);
}); 