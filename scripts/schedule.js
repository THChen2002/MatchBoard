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
				// 左上角右上角比分要對調
				if (!$this.hasClass('score-bottom-side')) {
					const scores = matchData.gameScore.split(':');
					const blueScore = parseInt(scores[0]);
					const redScore = parseInt(scores[1]);
					// 更新右上角比分
					$this.text(`${redScore}:${blueScore}`);
				} else {
					$this.text(matchData.gameScore);
				}
            }
		});

		// 小組排名
		$('.ranking-container').each(function() {
			const $this = $(this);
			const group = $this.data('group');
			$this.find('.ranking-box').each(function(idx) {
				const ranking = idx + 1;
				const $box = $(this);
				const teamName = response.roundResults.find(result => result.group === group && result.rank === ranking)?.team || '';

				$box.find('.rank-text').text(teamName);
			});

		});

		// 種子隊伍
		$('.node-content[data-seed]').each(function() {
			const $this = $(this);
			const seed = $this.data('seed');
			const matchData = response.matches.find(match => match.matchNo === seed);

			if (matchData) {
				// 更新種子隊伍名稱
				if (matchData.matchNo === '廿三' || matchData.matchNo === '廿四') {
					// 特別處理廿三和廿四的種子隊伍
					$this.find('.name').text(matchData.teams[0]);
				}
				else {
					$this.find('.name').text(matchData.teams[1]);
				}
			}
		}
		);
		
		// 複決賽隊伍及比分
		$('.node-content').each(function() {
			const $this = $(this);
			const matchNo = $this.data('match-no');
			const matchData = response.matches.find(match => match.matchNo === matchNo);

			if (matchData) {
				// 更新場次
				$this.find('.match-number-circle').text(matchData.matchNo);
				$this.find('.match-time-box').text(matchData.time);

				// 更新隊伍名稱
				$this.find('.team-blue .name').text(matchData.teams[0]);
				$this.find('.team-red .name').text(matchData.teams[1]);
				
				// 更新分數
				const scores = matchData.gameScore.split(':');
				const blueScore = parseInt(scores[0]);
				const redScore = parseInt(scores[1]);
				
				$this.find('.team-blue .score-blue').text(blueScore);
				$this.find('.team-red .score-red').text(redScore);
				
				// 判斷贏家並加上 winning-team class
				const $blueTeam = $this.find('.team-blue');
				const $redTeam = $this.find('.team-red');
				
				if (blueScore > redScore) {
					$blueTeam.addClass('winning-team');
				} else if (redScore > blueScore) {
					$redTeam.addClass('winning-team');
				}
			}
		});

		$('#scheduleContainer').show();
		$('#loadingContainer').hide();
		$('body').removeClass('loading-active');

        // 在數據載入且DOM渲染完成後，將滾動條置中
        const scrollBox = $('.tournament-scroll');
        if (scrollBox.length) {
            const scrollWidth = scrollBox[0].scrollWidth;
            const clientWidth = scrollBox[0].clientWidth;
            const centerPosition = (scrollWidth - clientWidth) / 2;
            scrollBox.scrollLeft(centerPosition);
        }

    }, function(xhr, status, error) {
        $('#loadingContainer').hide();
        $('body').removeClass('loading-active');
        console.error('獲取隊伍資料失敗:', error);
    });
}

$(document).ready(function() {
	$('#scheduleContainer').hide();
	$('#loadingContainer').show();
	$('body').addClass('loading-active');
	fetchScheduleData();
	
	// 放大縮小功能
	initZoomControls();
}); 

// 放大縮小功能
function initZoomControls() {
    let currentZoom = 1;
    const minZoom = 0.5;
    const maxZoom = 2.0;
    const zoomStep = 0.1;
    
    const $scrollContainer = $('.tournament-scroll');
    const $container = $('.tournament-container');
    const $zoomIn = $('.zoom-in');
    const $zoomOut = $('.zoom-out');
    const $zoomReset = $('.zoom-reset');
    
    function updateZoomState() {
        $zoomIn.prop('disabled', currentZoom >= maxZoom);
        $zoomOut.prop('disabled', currentZoom <= minZoom);
    }
    
    function applyZoom(newZoom) {
        const scrollBox = $scrollContainer[0];
        const oldScrollWidth = scrollBox.scrollWidth;
        const oldScrollLeft = scrollBox.scrollLeft;
        const viewportWidth = scrollBox.clientWidth;

        const centerPoint = oldScrollLeft + viewportWidth / 2;
        const centerRatio = oldScrollWidth > 0 ? centerPoint / oldScrollWidth : 0;

        currentZoom = parseFloat(newZoom.toFixed(2));
        $container.css('--zoom', currentZoom);
        updateZoomState();

        // 等待 DOM 更新縮放等級後再計算新的滾動位置
        setTimeout(() => {
            const newScrollWidth = scrollBox.scrollWidth;
            let newScrollLeft = (newScrollWidth * centerRatio) - (viewportWidth / 2);
            
            // 限制值在可滾動範圍內
            newScrollLeft = Math.max(0, Math.min(newScrollLeft, newScrollWidth - viewportWidth));
            
            // 重置時使用動畫以獲得更平滑的過渡效果
            if (newZoom === 1) {
                $scrollContainer.animate({ scrollLeft: newScrollLeft }, 300);
            } else {
                $scrollContainer.scrollLeft(newScrollLeft);
            }
        }, 0); // 使用 timeout 0 等待下一個渲染週期
    }
    
    $zoomIn.on('click', function() {
        if (currentZoom < maxZoom) {
            applyZoom(currentZoom + zoomStep);
        }
    });
    
    $zoomOut.on('click', function() {
        if (currentZoom > minZoom) {
            applyZoom(currentZoom - zoomStep);
        }
    });
    
    $zoomReset.on('click', function() {
        if (currentZoom === 1) return;
        applyZoom(1);
    });
    
    $(document).on('keydown', function(e) {
        if (window.location.pathname.includes('schedule.html')) {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === '=' || e.key === '+') {
                    e.preventDefault();
                    $zoomIn.click();
                } else if (e.key === '-') {
                    e.preventDefault();
                    $zoomOut.click();
                } else if (e.key === '0') {
                    e.preventDefault();
                    $zoomReset.click();
                }
            }
        }
    });
    
    $scrollContainer.on('wheel', function(e) {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const delta = e.originalEvent.deltaY > 0 ? -1 : 1;
            const newZoom = currentZoom + delta * zoomStep;
            
            if (newZoom >= minZoom && newZoom <= maxZoom) {
                applyZoom(newZoom);
            }
        }
    });

    // 設定初始縮放
    $container.css('--zoom', currentZoom);
    updateZoomState();
}