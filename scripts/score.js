// 紀錄是否為第一次載入
let isFirstLoad = true;
// 儲存之前的分數資料
let previousScores = {};
// 儲存即將更新的分數資料
let pendingScores = {};
// 儲存用戶投票記錄 (格式: {matchKey: teamIndex})
let userVotes = JSON.parse(sessionStorage.getItem('userVotes') || '{}');
// 儲存當前投票數據 (格式: {matchKey: [team1Votes, team2Votes]})
let currentVotesData = {};

function fetchMatchData() {
	// 載入動畫已經在HTML中預設顯示
	fetchData('score', function(response) {
		// console.log('獲取比賽資料成功:', response);
		
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
	$card.attr('data-field', match.field);
	$card.attr('data-set', match.set);
	$card.attr('data-match-no', match.matchNo);

	
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
	
	// 更新投票數據
	const team1Votes = match.votes[0];
	const team2Votes = match.votes[1];
	
	// 檢查是否需要跳過投票數據更新（避免樂觀更新被覆蓋）
	let shouldSkipVoteUpdate = false;
	if (userVotes[matchKey] !== undefined && currentVotesData[matchKey]) {
		const [prevTeam1, prevTeam2] = currentVotesData[matchKey];
		const prevTotal = prevTeam1 + prevTeam2;
		const newTotal = team1Votes + team2Votes;
		
		// 如果用戶已投票，但新數據的總票數沒有增加，說明後端還沒處理完
		if (newTotal <= prevTotal) {
			shouldSkipVoteUpdate = true;
		}
	}
	
	// 儲存真實票數到全域變數
	currentVotesData[matchKey] = [team1Votes, team2Votes];
	
	// 只有在不需要跳過時才更新投票顯示
	if (!shouldSkipVoteUpdate) {
		const totalVotes = team1Votes + team2Votes;
		const team1Percentage = totalVotes === 0 ? 50 : Math.round((team1Votes / totalVotes) * 100);
		const team2Percentage = 100 - team1Percentage;
		
		$card.find('[data-team1-percentage]').text(`${team1Percentage}%`);
		$card.find('[data-team2-percentage]').text(`${team2Percentage}%`);
		$card.find('[data-team1-bar]').css('width', `${team1Percentage}%`);
		$card.find('[data-team2-bar]').css('width', `${team2Percentage}%`);
	}
	
	// 更新投票按鈕狀態
	updateVotingButtonStates($card, matchKey);
}

// 更新投票按鈕狀態
function updateVotingButtonStates($card, matchKey) {
	const $team1Button = $card.find('[data-vote-team1]');
	const $team2Button = $card.find('[data-vote-team2]');
	const $votingTitle = $card.find('.voting-title');
	
	// 檢查用戶是否已投票
	const userVote = userVotes[matchKey];
	
	if (userVote !== undefined) {
		// 用戶已投票
		$team1Button.addClass('voted').prop('disabled', true);
		$team2Button.addClass('voted').prop('disabled', true);
		
		// 標記用戶投票的按鈕
		if (userVote === 0) {
			$team1Button.addClass('user-voted');
		} else if (userVote === 1) {
			$team2Button.addClass('user-voted');
		}
		
		// 更新投票標題（先檢查是否已存在）
		if ($votingTitle.find('.voted-indicator').length === 0) {
			$votingTitle.find('svg').after('<span class="voted-indicator">（已投票）</span>');
		}
	} else {
		// 用戶未投票，確保按鈕可用
		$team1Button.removeClass('voted user-voted').prop('disabled', false);
		$team2Button.removeClass('voted user-voted').prop('disabled', false);
		$votingTitle.find('.voted-indicator').remove();
	}
}

// 處理投票點擊
function handleVote(matchKey, teamIndex, $card) {
	// 檢查是否已投票
	if (userVotes[matchKey] !== undefined) {
		showVoteMessage('您已經為此場比賽投過票了！', 'warning');
		return;
	}
	
	// 記錄投票
	userVotes[matchKey] = teamIndex;
	sessionStorage.setItem('userVotes', JSON.stringify(userVotes));
	
	// 顯示投票成功訊息
	const teamName = teamIndex === 0 ? 
		$card.find('[data-team1-name]').text() : 
		$card.find('[data-team2-name]').text();
	showVoteMessage(`投票成功！您支持：${teamName}`, 'success');
	
	// 立即更新投票進度條（使用真實票數+1）
	if (currentVotesData[matchKey]) {
		let [team1Votes, team2Votes] = currentVotesData[matchKey];
		
		// 給投票的隊伍+1票
		if (teamIndex === 0) {
			team1Votes += 1;
		} else {
			team2Votes += 1;
		}
		
		// 重新計算百分比
		const newTotal = team1Votes + team2Votes;
		const newTeam1Percentage = Math.round((team1Votes / newTotal) * 100);
		const newTeam2Percentage = 100 - newTeam1Percentage;
		
		// 更新顯示
		$card.find('[data-team1-percentage]').text(`${newTeam1Percentage}%`);
		$card.find('[data-team2-percentage]').text(`${newTeam2Percentage}%`);
		$card.find('[data-team1-bar]').css('width', `${newTeam1Percentage}%`);
		$card.find('[data-team2-bar]').css('width', `${newTeam2Percentage}%`);
	}
	
	// 更新按鈕狀態
	updateVotingButtonStates($card, matchKey);
	
	// 發送投票數據到後端
	sendVoteToServer(matchKey, teamIndex);
}

// 發送投票到後端
function sendVoteToServer(matchKey, teamIndex) {
	$.ajax({
		url: API_URL,
		method: 'POST',
		data: {
			type: 'vote',
			matchKey, 
			teamIndex
		},
		success: function(response) {
			console.log('投票成功:', response);
		},
		error: function(error) {
			console.error('投票失敗:', error);
		}
	});
}

// 顯示投票訊息
function showVoteMessage(message, type = 'info') {
	// 移除之前的訊息
	$('.vote-message').remove();
	
	// 創建訊息元素
	const $message = $(`
		<div class="vote-message vote-message-${type}">
			<div class="vote-message-content">
				<span class="vote-message-text">${message}</span>
				<button class="vote-message-close">&times;</button>
			</div>
		</div>
	`);
	
	// 添加到頁面
	$('body').append($message);
	
	// 顯示動畫
	setTimeout(() => {
		$message.addClass('show');
	}, 10);
	
	// 自動隱藏
	setTimeout(() => {
		hideVoteMessage($message);
	}, 3000);
	
	// 點擊關閉
	$message.find('.vote-message-close').on('click', function() {
		hideVoteMessage($message);
	});
}

// 隱藏投票訊息
function hideVoteMessage($message) {
	$message.removeClass('show');
	setTimeout(() => {
		$message.remove();
	}, 300);
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
	
	// 綁定投票按鈕事件
	$(document).on('click', '[data-vote-team1], [data-vote-team2]', function(e) {
		e.preventDefault();
		
		const $button = $(this);
		const $card = $button.closest('.match-card');
		
		// 動態生成 matchKey：場地-場次
		const field = $card.data('field');
		const matchNo = $card.data('match-no');
		const matchKey = `${field}-${matchNo}`;
		
		const teamIndex = $button.hasClass('vote-team1') ? 0 : 1;
		
		// 檢查是否已被禁用
		if ($button.prop('disabled')) {
			return;
		}
		
		// 處理投票
		handleVote(matchKey, teamIndex, $card);
	});
}); 