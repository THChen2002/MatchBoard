// 獲取隊伍資料
function fetchTeamsData() {
    fetchAndStoreData('teams', function(response) {
        // console.log('獲取隊伍資料成功:', response);
        $('#loadingContainer').hide();
        $('body').removeClass('loading-active');
        const teams = response.teams.map(team => ({
            ...team,
            captain: team.members[0].name // 隊長是 members 的第一個
        }));
        renderTeams(teams);
    }, function(xhr, status, error) {
        $('#loadingContainer').hide();
        $('body').removeClass('loading-active');
        console.error('獲取隊伍資料失敗:', error);
        showEmptyState();
    });
}


// 生成隊員 HTML
function generateMemberHTML(member) {
    const genderClass = member.gender === 'M' ? 'member-blue' : 'member-pink';
    const statusClass = member.status === '在校' ? 'status-studying' : 'status-working';
    
    return `
        <div class="member-item ${genderClass}">
            <span class="member-number">${member.number}</span>
            <span class="member-name">${member.name}</span>
            <span class="member-status ${statusClass}">${member.status}</span>
        </div>
    `;
}

// 生成隊伍卡片 HTML
function generateTeamCardHTML(team) {
    const membersHTML = team.members.map(member => generateMemberHTML(member)).join('');
    
    return `
        <div class="team-card">
            <div class="team-header">
                <h2 class="team-name">${team.team}</h2>
                <span class="department-tag department-tag-orange">${team.department}</span>
            </div>
            <div class="captain-info">
                <span class="captain-label">隊長:</span>
                <span class="captain-name">${team.captain}</span>
            </div>
            <div class="members-grid">
                ${membersHTML}
            </div>
        </div>
    `;
}

// 渲染隊伍列表
function renderTeams(teams) {
    const $teamsGrid = $('#teamsGrid');
    
    if (!teams || teams.length === 0) {
        showEmptyState();
        return;
    }
    
    const teamsHTML = teams.map(team => generateTeamCardHTML(team)).join('');
    $teamsGrid.html(teamsHTML);
    
    // 顯示容器
    showTeamsContainer();
}

// 顯示空狀態
function showEmptyState() {
    const $teamsGrid = $('#teamsGrid');
    $teamsGrid.html(`
        <div class="empty-state col-span-full">
            <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            <h3 class="text-lg font-semibold mb-2">暫無隊伍資料</h3>
            <p>目前沒有可顯示的隊伍資訊</p>
        </div>
    `);
    showTeamsContainer();
}

// 顯示隊伍容器
function showTeamsContainer() {
    $('#errorMessage').hide();
    $('#teamsContainer').show();
}


$(document).ready(function() {
    $('#loadingContainer').show();
    $('body').addClass('loading-active');
    fetchTeamsData();
});

