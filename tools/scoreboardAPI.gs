const SPREADSHEET_ID = "";

function doGet(e) {
  const type = e.parameter.type;

  if (type === "marquee"){
    return handleMarquee();
  } else if (type === "announcements"){
    return handleAnnouncements();
  } else if (type === 'score') {
    return handleScore();
  } else if (type === 'results') {
    return handleResults();
  } else if (type === 'teams') {
    return handleTeams();
  } else {
    return ContentService.createTextOutput(
      JSON.stringify({ error: "Missing or invalid type." }, null, 2)
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  const params = e.parameter;
  const type = params.type;

  if (type === "vote") {
    return handleVote(params);
  }

  // 你可以擴充其他 type 處理
  else {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, message: `Unknown type: ${type}` })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function handleVote(params) {
  const matchKey = params.matchKey;
  const teamIndex = parseInt(params.teamIndex);

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetById(0);
  const range = sheet.getRange("A1:O5");
  const values = range.getValues();

  for (let i = 1; i < values[0].length; i += 5) {
    const field = values[0][i];
    const matchNo = values[1][i];
    const currentMatchKey = `${field}-${matchNo}`;

    if (currentMatchKey === matchKey) {
      // votes 欄位在 i+3
      const voteRow = 4 + teamIndex; // row 4 or 5 (index base 1)
      const voteCol = i + 3 + 1;     // column index base 1

      const voteCell = sheet.getRange(voteRow, voteCol);
      const currentVotes = voteCell.getValue();
      voteCell.setValue((currentVotes || 0) + 1);

      return createCorsResponse(
        JSON.stringify({ success: true, message: `Vote added for ${matchKey} team ${teamIndex}` })
      );
    }
  }
  
  // 沒找到 match
  return createCorsResponse(
    JSON.stringify({ success: false, message: `Match ${matchKey} not found` })
  );
}

// 支援 CORS
function createCorsResponse(jsonString) {
  const output = ContentService.createTextOutput(jsonString)
    .setMimeType(ContentService.MimeType.JSON);

  output.getResponseHeaders = () => ({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });

  return output;
}

// 跑馬燈
function handleMarquee(){
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetById(1594512537);
  const data = sheet.getRange("B1").getValue();
  const results = {
    text: data
  };

  return ContentService
    .createTextOutput(JSON.stringify(results, null, 2))
    .setMimeType(ContentService.MimeType.JSON);
}

// 公告
function handleAnnouncements(){
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetById(1594512537);
  const lastRow = sheet.getLastRow();
  const range = sheet.getRange(`A3:D${lastRow}`);
  const values = range.getValues();

  const announcements = [];

  for (let i = 0; i < values.length; i++) {
    let [date, type, title, content] = values[i];
    date = Utilities.formatDate(date, Session.getScriptTimeZone(), "yyyy/MM/dd");

    // 跳過空白列（標題或日期為空）
    if (!date || !title) continue;

    announcements.push({
      date,     // 例如：2025/01/20
      type,     // 例如：重要、提醒、一般
      title,    // 例如：比賽報名截止日提醒
      content   // 公告內容文字
    });
  }

  return ContentService
    .createTextOutput(JSON.stringify({ announcements }, null, 2))
    .setMimeType(ContentService.MimeType.JSON);
}

// 即時比分
function handleScore() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetById(0); // 頁籤索引 0（通常是第一個工作表）
  const range = sheet.getRange("A1:O5");
  const values = range.getValues();

  const matches = [];

  for (let i = 1; i < values[0].length; i += 5) {
    const match = {
      field: values[0][i],
      matchNo: values[1][i],
      set: values[2][i],
      gameScore: values[2][i + 2],
      teams: [values[3][i - 1], values[4][i - 1]],
      setScores: [],
      votes: [values[3][i + 3], values[4][i + 3]]
    };

    for (let j = 0; j < 3; j++) {
      const scoreA = values[3][i + j];
      const scoreB = values[4][i + j];
      if (scoreA !== "" && scoreB !== "") {
        match.setScores.push(`${scoreA}:${scoreB}`);
      }
    }

    matches.push(match);
  }
  
  return ContentService
    .createTextOutput(JSON.stringify({ matches }, null, 2))
    .setMimeType(ContentService.MimeType.JSON);
}

// 賽程結果
function handleResults() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetById(1738601497);
  const data = sheet.getRange("A1:P37").getValues();

  const matches = [];

  for (let row = 1; row < data.length; row += 3) {
    const time = data[row][0]?.replace(/\n/g, '').replace(/[|｜]/, '～');;

    for (let col = 1; col < data[0].length; col += 5) {
      const field = data[0][col];
      const matchNo = data[row][col];
      const gameScore = `${data[row + 1][col]}:${data[row + 2]?.[col]}`;
      const teamA = data[row + 1][col + 1];
      const teamB = data[row + 2]?.[col + 1];

      if (
        typeof teamA !== 'string' || typeof teamB !== 'string' ||
        teamA.trim() === '' || teamB.trim() === ''
      ) continue;

      const setScores = [];
      const scoreA1 = data[row + 1][col + 2], scoreB1 = data[row + 2]?.[col + 2];
      const scoreA2 = data[row + 1][col + 3], scoreB2 = data[row + 2]?.[col + 3];
      const scoreA3 = data[row + 1][col + 4], scoreB3 = data[row + 2]?.[col + 4];

      if (scoreA1 !== "" && scoreB1 !== "") setScores.push(`${scoreA1}:${scoreB1}`);
      if (scoreA2 !== "" && scoreB2 !== "") setScores.push(`${scoreA2}:${scoreB2}`);
      if (scoreA3 !== "" && scoreB3 !== "") setScores.push(`${scoreA3}:${scoreB3}`);

      matches.push({
        field,
        matchNo,
        time,
        gameScore,
        teams: [teamA, teamB],
        setScores
      });
    }
  }
  const roundResults = handleRoundResults();
  return ContentService
    .createTextOutput(JSON.stringify({ matches, roundResults}, null, 2))
    .setMimeType(ContentService.MimeType.JSON);
}

// 循環賽結果
function handleRoundResults() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetById(566030344);
  const data = sheet.getRange("A2:I19").getValues();

  const roundResults = [];
  for (let row = 0; row < data.length; row += 3) {
    for (let i = 0; i < 3; i++) {
      roundResults.push({
        group: data[row][0],
        team: data[row + i][1],
        winGames: data[row + i][2],
        lossGames: data[row + i][3],
        lossSets: data[row + i][4],
        totalPoints: data[row + i][5],
        pointsAgainst: data[row + i][6],
        pointRatio: data[row + i][7],
        rank: data[row + i][8]
      })
    }
  }
  return roundResults;
}

// 參賽名單
function handleTeams() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetById(1021693251);
  const data = sheet.getDataRange().getValues();

  const teams = [];

  for (let col = 0; col < data[0].length; col += 4) {
    const teamName = data[0][col]; // 隊名
    const department = data[1][col] //系所
    const members = [];

    for (let row = 2; row < data.length; row++) {
      const number = data[row][col];
      const name = data[row][col + 1];
      const gender = data[row][col + 2];
      const status = data[row][col + 3];

      if (!name || name.toString().trim() === "") continue;

      members.push({ number, name, gender, status });
    }

    if (members.length > 0) {
      teams.push({ team: teamName, department, members });
    }
  }

  return ContentService
    .createTextOutput(JSON.stringify({ teams }, null, 2))
    .setMimeType(ContentService.MimeType.JSON);
}


