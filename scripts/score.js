// 紀錄是否為第一次載入
let isFirstLoad = true;
// 儲存之前的分數資料
let previousScores = {};
// 儲存即將更新的分數資料
let pendingScores = {};

function fetchMatchData() {
	// 載入動畫已經在HTML中預設顯示

	fetchData('score', function(response) {
		// 隱藏loading動畫（僅在第一次載入時）
		if (isFirstLoad) {
			$('#loadingContainer').hide();
			$('body').removeClass('loading-active');
			// 顯示即時更新橫幅動畫
			$('#live-update-banner').addClass('fade-in-down');
			isFirstLoad = false;
		}
		
		if (response && response.matches) {
			updateMatchCards(response.matches);
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

function updateMatchCards(matches) {
	matches.forEach((match, index) => {
		const $card = $('.match-card[data-match-index="' + index + '"]');
		if ($card.length === 0) {
			// 如果沒有對應的預定義卡片，跳過
			return;
		}
		
		// 檢查分數變化
		const matchKey = `${match.field}-${match.matchNo}`;
		const currentScore = match.setScores[match.setScores.length - 1];
		const [currentScore1, currentScore2] = currentScore.split(':').map(Number);
		
		let hasScoreChanges = false;
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
		
		// 如果有分數變化，先觸發動畫，動畫結束後才更新數據
		if (hasScoreChanges) {
			triggerScoreAnimationForCard($card, matchKey, function() {
				// 動畫結束的回調函數中更新數據
				updateSingleCard($card, match, matchKey);
			});
		} else {
			// 沒有分數變化，直接更新卡片數據
			updateSingleCard($card, match, matchKey);
		}
		
		// 更新之前的分數記錄
		previousScores[matchKey] = currentScore;
	});
}

function updateSingleCard($card, match, matchKey) {
	// 更新場地和比賽訊息
	$card.find('[data-field]').text(`${match.field}場地`);
	$card.find('[data-set]').text(`第${match.set}局`);
	$card.find('[data-match-no]').text(`場次：${match.matchNo}`);
	
	// 更新隊伍名稱
	$card.find('[data-team1-name]').text(match.teams[0]);
	$card.find('[data-team2-name]').text(match.teams[1]);
	
	// 更新比賽分數
	$card.find('[data-game-score]').text(match.gameScore);
	
	// 更新當前局分數
	const currentScore = match.setScores[match.setScores.length - 1];
	const [currentScore1, currentScore2] = currentScore.split(':').map(Number);
	
	$card.find('[data-team1-score]').text(currentScore1);
	$card.find('[data-team2-score]').text(currentScore2);
	
	// 更新各局比分
	for (let i = 0; i < 3; i++) {
		const $setScore = $card.find(`[data-set-score="${i}"]`);
		if (match.setScores[i]) {
			const [score1, score2] = match.setScores[i].split(':').map(Number);
			let scoreClass = 'no-result';
			
			if (score1 > score2) {
				scoreClass = 'team1-win';
			} else if (score2 > score1) {
				scoreClass = 'team2-win';
			}
			
			$setScore.text(match.setScores[i])
				.removeClass('no-result team1-win team2-win')
				.addClass(scoreClass);
		} else {
			$setScore.text('-')
				.removeClass('team1-win team2-win')
				.addClass('no-result');
		}
	}
	
	// TODO: 更新投票數據 (模擬數據)
	const team1Votes = Math.floor(Math.random() * 100) + 20;
	const team2Votes = Math.floor(Math.random() * 100) + 20;
	const totalVotes = team1Votes + team2Votes;
	const team1Percentage = Math.round((team1Votes / totalVotes) * 100);
	const team2Percentage = 100 - team1Percentage;
	
	$card.find('[data-total-votes]').text(totalVotes);
	$card.find('[data-team1-percentage]').text(`${team1Percentage}%`);
	$card.find('[data-team2-percentage]').text(`${team2Percentage}%`);
	$card.find('[data-team1-bar]').css('width', `${team1Percentage}%`);
	$card.find('[data-team2-bar]').css('width', `${team2Percentage}%`);
}



function triggerScoreAnimationForCard($card, matchKey, callback) {
	if (pendingScores[matchKey]) {
		const scoreData = pendingScores[matchKey];
		let animationsCompleted = 0;
		let totalAnimations = 0;
		
		// 計算需要執行的動畫數量
		if (scoreData.team1Changed) totalAnimations++;
		if (scoreData.team2Changed) totalAnimations++;
		
		// 動畫完成的回調函數
		const onAnimationComplete = function() {
			animationsCompleted++;
			if (animationsCompleted === totalAnimations) {
				// 所有動畫都完成了，執行回調
				if (callback) callback();
				// 清除該比賽的待處理分數
				delete pendingScores[matchKey];
			}
		};
		
		// 找到對應的分數圓圈並執行動畫
		if (scoreData.team1Changed) {
			const $team1Circle = $card.find('[data-team1-score]');
			animateScoreChange($team1Circle, scoreData.newScore1, onAnimationComplete);
		}
		
		if (scoreData.team2Changed) {
			const $team2Circle = $card.find('[data-team2-score]');
			animateScoreChange($team2Circle, scoreData.newScore2, onAnimationComplete);
		}
		
		// 如果沒有需要動畫的分數變化，直接執行回調
		if (totalAnimations === 0) {
			if (callback) callback();
			delete pendingScores[matchKey];
		}
	} else {
		// 沒有待處理的分數，直接執行回調
		if (callback) callback();
	}
}


// 單個分數圓圈的動畫
function animateScoreChange($scoreCircle, newScore, callback) {
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
		// 動畫完成後執行回調
		if (callback) callback();
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