function doGet(e) {
  const ss = SpreadsheetApp.openById("1wcNSyGv0QQEnjr-5UHOqsmnniSeUSX2F1XNYW23ISZs");
  const sheet = ss.getSheets()[0];
  const range = sheet.getRange("A1:L5");
  const values = range.getValues();

  const matches = [];

  // 每四欄（B-E, F-I, J-M）視為一場比賽
  for (let i = 1; i < values[0].length; i += 4) {
    const match = {
      field: values[0][i],           // 場地：甲、乙、丙
      matchNo: values[1][i],         // 場次：一、二、三
      set: values[2][i],             // 目前局數
      gameScore: values[2][i + 2],   // 大比分（如 1:0）
      teams: [values[3][i-1], values[4][i-1]], // 隊名
      setScores: [] // 每局比分格式為 "25:17"
    };

    // 每場最多 3 局（或依實際狀況改）
    for (let j = 0; j < 3; j++) {
      const scoreA = values[3][i + j];
      const scoreB = values[4][i + j];
      // 過濾空白或無效資料
      if (scoreA !== "" && scoreB !== "") {
        match.setScores.push(`${scoreA}:${scoreB}`);
      }
    }

    matches.push(match);
  }
  console.log(matches);

  const jsonOutput = JSON.stringify({ matches }, null, 2);
  console.log(jsonOutput)
  return ContentService
    .createTextOutput(jsonOutput)
    .setMimeType(ContentService.MimeType.JSON);
}
