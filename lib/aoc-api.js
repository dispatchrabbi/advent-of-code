import suppressExperimentalWarnings from '#lib/suppress-experimental-warnings';

// fetch() is experimental and emits a warning. This suppresses it.
suppressExperimentalWarnings();

async function makeRequest(path, method = 'GET', body = undefined, headers = {}) {
  if(!process.env.AOC_SESSION_COOKIE) {
    throw new Error('No AOC_SESSION_COOKIE provided. Please supply one in .env, or set DOWNLOAD_INPUTS to 0.');
  }

  if(!process.env.USER_AGENT_CONTACT_INFO) {
    throw new Error('No USER_AGENT_CONTACT_INFO provided. Be a good netizen and set one in .env; see details why in the README.');
  }

  // NOTE: there is NO `www.` in the URL! Adding a `www.` causes the calls to fail.
  return fetch(`https://adventofcode.com/${path}`, {
    method,
    body,
    headers: {
      ...headers,
      'User-Agent': process.env.USER_AGENT_CONTACT_INFO,
      'Cookie': process.env.AOC_SESSION_COOKIE,
    },
  });
}

async function downloadPuzzleInput(year, day) {
  const response = await makeRequest(`${year}/day/${day}/input`);

  const bodyText = await response.text();
  if(!response.ok) {
    throw new Error(`Could not download input for ${year}/${day}: ${response.status} ${response.statusText} ${bodyText}`);
  }

  return bodyText;
}

async function submitPuzzleAnswer(year, day, part, answer) {
  const body = new URLSearchParams({ answer, level: part });
  const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
  const response = await makeRequest(`${year}/day/${day}/answer`, 'POST', body.toString(), headers);
  if(!response.ok) {
    throw new Error(`Could not submit answer ${year}/${day}: ${response.status} ${response.statusText}`);
  }

  const bodyText = await response.text();
  if(bodyText.includes(`That's the right answer!`)) {
    return { success: true };
  } else if(bodyText.includes(`That's not the right answer.`)) {
    return { success: false, reason: 'incorrect' };
  } else if(bodyText.includes(`You gave an answer too recently`)) {
    return { success: false, reason: 'timeout' };
  } else if(bodyText.includes(`You don't seem to be solving the right level.`)){
    return { success: false, reason: 'solved'};
  } else {
    return { success: false, reason: 'unknown' };
  }
}

async function fetchLeaderboard(year, leaderboardId) {
  const response = makeRequest(`${year}/leaderboard/private/view/${leaderboardId}.json`);

  if(!response.ok) {
    throw new Error(`Could not retrieve JSON for leaderboard ${leaderboardId}: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export { downloadPuzzleInput, submitPuzzleAnswer, fetchLeaderboard };
