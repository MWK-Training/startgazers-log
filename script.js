const repositoryList = document.querySelector('#repository-list');
const repositoryCount = document.querySelector('#repository-count');
const status = document.querySelector('#status');

if (!repositoryList || !repositoryCount || !status) {
  // If essential elements are missing, bail early and surface an error in the console.
  console.error('Required DOM elements (#repository-list, #repository-count, #status) are missing');
}

function formatDate(date) {
  try {
    return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(date));
  } catch (err) {
    return '';
  }
}

function renderRepositories(events) {
  if (!Array.isArray(events)) {
    throw new Error('Malformed events.json: expected an array');
  }

  const repositories = events.filter((event) =>
    event && event.type === 'WatchEvent' && event.repo && event.repo.name
  );

  // Clear any existing items before rendering to avoid duplicates on re-render.
  repositoryList.textContent = '';

  repositoryCount.textContent = `${repositories.length} ${repositories.length === 1 ? 'repository' : 'repositories'}`;
  status.hidden = repositories.length > 0;

  repositories.forEach((event) => {
    const item = document.createElement('li');
    item.className = 'repository';

    const info = document.createElement('div');

    const link = document.createElement('a');
    link.className = 'repository-name';
    link.href = event.repo.url || '#';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = event.repo.name;

    const desc = document.createElement('p');
    desc.className = 'repository-description';
    desc.textContent = event.repo.description || 'No description provided.';

    info.appendChild(link);
    info.appendChild(desc);

    const time = document.createElement('time');
    time.className = 'repository-date';
    if (event.created_at) {
      time.setAttribute('datetime', event.created_at);
      time.textContent = formatDate(event.created_at);
    }

    item.appendChild(info);
    item.appendChild(time);

    repositoryList.appendChild(item);
  });

  if (repositories.length === 0) {
    status.textContent = 'No starred repositories found.';
  }
}

fetch('events.json')
  .then((response) => {
    if (!response.ok) {
      throw new Error(`Could not load events.json (${response.status})`);
    }
    return response.json();
  })
  .then(renderRepositories)
  .catch((error) => {
    if (status) {
      status.hidden = false;
      status.classList.add('error');
      status.textContent = error.message;
    }
    // Also surface to console for debugging during development.
    console.error(error);
  });
