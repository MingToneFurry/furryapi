let currentTab = 'preview';

function switchTab(tab) {
  currentTab = tab;

  const previewPanel = document.getElementById('tab-panel-preview');
  const jsonPanel = document.getElementById('tab-panel-json');
  const btnPreview = document.getElementById('tab-btn-preview');
  const btnPreviewEn = document.getElementById('tab-btn-preview-en');
  const btnJson = document.getElementById('tab-btn-json');
  const btnJsonEn = document.getElementById('tab-btn-json-en');

  if (tab === 'preview') {
    previewPanel.classList.add('active');
    jsonPanel.classList.remove('active');
    btnPreview.classList.add('active');
    btnPreviewEn.classList.add('active');
    btnJson.classList.remove('active');
    btnJsonEn.classList.remove('active');
  } else {
    jsonPanel.classList.add('active');
    previewPanel.classList.remove('active');
    btnJson.classList.add('active');
    btnJsonEn.classList.add('active');
    btnPreview.classList.remove('active');
    btnPreviewEn.classList.remove('active');
  }
}

async function parseDouyin(presetUrl) {
  const input = document.getElementById('douyin-url-input');
  const urlToQuery = presetUrl || input.value.trim();

  if (presetUrl) {
    input.value = presetUrl;
  }

  const resultArea = document.getElementById('douyin-result-area');
  const errorPanel = document.getElementById('douyin-error-panel');
  const previewContent = document.getElementById('douyin-preview-content');
  const rawJsonEl = document.getElementById('douyin-raw-json');

  resultArea.style.display = 'block';
  errorPanel.style.display = 'none';
  previewContent.style.display = 'none';
  rawJsonEl.textContent = '加载中… / Loading…';

  switchTab('preview');
  errorPanel.textContent = '加载中… / Loading…';
  errorPanel.style.display = 'block';

  const apiUrl = 'https://api.furry.ist/douyin?url=' + encodeURIComponent(urlToQuery);

  let data;
  try {
    const res = await fetch(apiUrl);
    data = await res.json();
  } catch (e) {
    errorPanel.textContent = '请求失败，请稍后再试。/ Request failed, please try again later.';
    rawJsonEl.textContent = 'Fetch error: ' + e.message;
    return;
  }

  rawJsonEl.textContent = JSON.stringify(data, null, 2);

  if (!data.ok) {
    const msg = data.message || data.code || '未知错误 / Unknown error';
    errorPanel.textContent = '解析失败：' + msg + '  (code: ' + (data.code || '-') + ')';
    previewContent.style.display = 'none';
    return;
  }

  errorPanel.style.display = 'none';
  previewContent.style.display = 'flex';

  const d = data.data;

  // Cover image
  const coverImg = document.getElementById('douyin-cover-img');
  coverImg.src = d.cover || '';
  coverImg.alt = d.desc || (currentLanguage === 'en' ? 'Cover' : '封面');

  // Description
  document.getElementById('douyin-desc').textContent = d.desc || '';

  // Author
  const authorEl = document.getElementById('douyin-author');
  const nickname = (d.author && d.author.nickname) || d.nickname || '';
  const signature = (d.author && d.author.signature) || d.signature || '';
  authorEl.innerHTML = '';
  if (nickname) {
    const nameSpan = document.createElement('strong');
    nameSpan.textContent = '@' + nickname;
    authorEl.appendChild(nameSpan);
  }
  if (signature) {
    const sigP = document.createElement('p');
    sigP.style.cssText = 'margin:0.3rem 0 0; white-space:pre-wrap; word-break:break-word;';
    sigP.textContent = signature;
    authorEl.appendChild(sigP);
  }

  // Stats
  const statsEl = document.getElementById('douyin-stats');
  statsEl.innerHTML = '';
  const stats = [
    { icon: '❤️', zh: '点赞', en: 'Likes', key: 'digg_count' },
    { icon: '💬', zh: '评论', en: 'Comments', key: 'comment_count' },
    { icon: '🔁', zh: '分享', en: 'Shares', key: 'share_count' },
    { icon: '⭐', zh: '收藏', en: 'Collects', key: 'collect_count' },
    { icon: '▶', zh: '播放', en: 'Plays', key: 'play_count' },
  ];
  stats.forEach(s => {
    const val = d[s.key] != null ? d[s.key] : (d.statistics && d.statistics[s.key] != null ? d.statistics[s.key] : null);
    if (val == null) return;
    const item = document.createElement('span');
    item.className = 'douyin-stat-item';
    item.innerHTML = '<span aria-hidden="true">' + s.icon + '</span><span data-lang="zh">' + s.zh + ' ' + val.toLocaleString() + '</span><span data-lang="en" class="en-hidden">' + s.en + ' ' + val.toLocaleString() + '</span>';
    statsEl.appendChild(item);
  });

  // Video link
  const videoLink = document.getElementById('douyin-video-link');
  const videoLinkEn = document.getElementById('douyin-video-link-en');
  if (d.type === 'video' && d.video_url) {
    videoLink.href = d.video_url;
    videoLink.style.display = 'inline-block';
    videoLinkEn.href = d.video_url;
    videoLinkEn.style.display = 'inline-block';
  } else {
    videoLink.style.display = 'none';
    videoLinkEn.style.display = 'none';
  }

  // Image grid (for image posts)
  const imageGrid = document.getElementById('douyin-image-grid');
  imageGrid.innerHTML = '';
  if (d.type === 'image' && Array.isArray(d.image_url_list) && d.image_url_list.length > 0) {
    d.image_url_list.forEach(imgUrl => {
      const img = document.createElement('img');
      img.src = imgUrl;
      img.alt = '图集图片';
      img.referrerPolicy = 'no-referrer';
      imageGrid.appendChild(img);
    });
  }

  // Meta info
  const metaEl = document.getElementById('douyin-meta');
  const isEn = typeof currentLanguage !== 'undefined' && currentLanguage === 'en';
  const parts = [];
  if (d.create_time) parts.push((isEn ? 'Published: ' : '发布时间：') + d.create_time);
  if (d.duration_ms) parts.push((isEn ? 'Duration: ' : '时长：') + (d.duration_ms / 1000).toFixed(1) + 's');
  if (d.aweme_id) parts.push((isEn ? 'ID: ' : 'ID：') + d.aweme_id);
  metaEl.textContent = parts.join('　');

  // Re-apply language state for dynamically added elements
  if (typeof setLanguage === 'function') {
    setLanguage(typeof currentLanguage !== 'undefined' ? currentLanguage : 'zh');
  }
}
