const grid = document.getElementById('userGrid');

filteredUsers.forEach(user => {
  const card = document.createElement('div');
  card.className = 'user-card';

  card.innerHTML = `
    <h2>${user.name}</h2>
    <p><strong>@${user.screen_name}</strong></p>
    <p>${String(user.description || '').replace(/\n/g, '<br>')}</p>
  `;

  grid.appendChild(card);
});