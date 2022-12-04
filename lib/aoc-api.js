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

  return fetch(`https://www.adventofcode.com/${path}`, {
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
  const response = await makeRequest(`${year}/day/${day}/answer`, 'POST', body, headers);

  const bodyText = await response.text();
  if(!response.ok) {
    throw new Error(`Could not download input for ${year}-${day}: ${response.status} ${response.statusText} ${bodyText}`);
  }

  return bodyText;
}

export { downloadPuzzleInput, submitPuzzleAnswer };
