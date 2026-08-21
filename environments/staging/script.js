const repositoryList = document.querySelector('#repository-list');
const repositoryCount = document.querySelector('#repository-count');
const status = document.querySelector('#status');

const formatDate = (date) => new Intl.DateTimeFormat('en', {
  dateStyle: 'medium',
}).format(new Date(date));

const renderRepositories = (events) => {
  const repositories = events.filter((event) => event.type === 'WatchEvent');

  repositoryCount.textContent = `${repositories.length} ${repositories.length === 1 ? 'repository' : 'repositories'}`;
  status.hidden = repositories.length > 0;

  repositories.forEach((event) => {
    const item = document.createElement('li');
    item.className = 'repository';
    item.innerHTML = `
      <div>
        <a class="repository-name" href="${event.repo.url}" target="_blank" rel="noreferrer">${event.repo.name}</a>
        <p class="repository-description">${event.repo.description || 'No description provided.'}</p>
      </div>
      <time class="repository-date" datetime="${event.created_at}">${formatDate(event.created_at)}</time>
    `;
    repositoryList.append(item);
  });

  if (repositories.length === 0) {
    status.textContent = 'No starred repositories found.';
  }
};

fetch('events.json')
  .then((response) => {
    if (!response.ok) {
      throw new Error(`Could not load events.json (${response.status})`);
    }
    return response.json();
  })
  .then(renderRepositories)
  .catch((error) => {
    status.hidden = false;
    status.className = 'status error';
    status.textContent = error.message;
  });
