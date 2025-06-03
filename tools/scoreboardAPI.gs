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
  } else {
    return ContentService.createTextOutput(
      JSON.stringify({ error: "Missing or invalid type." }, null, 2)
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// 即時比分
function handleScore() {
  const ss = SpreadsheetApp.openById("1wcNSyGv0QQEnjr-5UHOqsmnniSeUSX2F1XNYW23ISZs");
  const sheet = ss.getSheetById(0); // 頁籤索引 0（通常是第一個工作表）
  const range = sheet.getRange("A1:L5");
  const values = range.getValues();

  const matches = [];

  for (let i = 1; i < values[0].length; i += 4) {
    const match = {
      field: values[0][i],
      matchNo: values[1][i],
      set: values[2][i],
      gameScore: values[2][i + 2],
      teams: [values[3][i - 1], values[4][i - 1]],
      setScores: []
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
  const ss = SpreadsheetApp.openById("1wcNSyGv0QQEnjr-5UHOqsmnniSeUSX2F1XNYW23ISZs");
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

  return ContentService
    .createTextOutput(JSON.stringify({ matches }, null, 2))
    .setMimeType(ContentService.MimeType.JSON);
}

// 跑馬燈
function handleMarquee(){
  const ss = SpreadsheetApp.openById("1wcNSyGv0QQEnjr-5UHOqsmnniSeUSX2F1XNYW23ISZs");
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
  const ss = SpreadsheetApp.openById("1wcNSyGv0QQEnjr-5UHOqsmnniSeUSX2F1XNYW23ISZs");
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

