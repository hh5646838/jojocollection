// 全局数据存储
let config = {};
let postsData = {};
let currentTrack = null;
let isPlaying = false;
let sortAscending = true;

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    // 检查当前页面类型
    const isIndexPage = window.location.pathname.includes('index.html') || window.location.pathname === '/';
    const isCollectionPage = window.location.pathname.includes('collection.html');
    
    if (isIndexPage) {
        loadConfig();
        loadPosts();
        handleHashScroll();
    } else if (isCollectionPage) {
        loadCollectionPage();
    }
});

// 处理 hash 滚动
function handleHashScroll() {
    if (window.location.hash) {
        const targetId = window.location.hash.substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            setTimeout(() => {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    }
}

// 加载配置文件
async function loadConfig() {
    try {
        const response = await fetch('config.json');
        config = await response.json();
        initVinylPlayer();
    } catch (error) {
        console.error('Error loading config:', error);
    }
}

// 加载文章数据
async function loadPosts() {
    try {
        const response = await fetch('posts.json');
        postsData = await response.json();
        initCollections();
        initTimeline();
    } catch (error) {
        console.error('Error loading posts:', error);
    }
}

// 初始化黑胶播放器
function initVinylPlayer() {
    if (!config.vinyl) return;
    
    const albumGrid = document.getElementById('album-grid');
    if (!albumGrid) return; // 如果不在首页，直接返回
    
    const tracks = config.vinyl.tracks;
    const defaultTrackId = config.vinyl.defaultTrackId;
    
    // 生成专辑封面网格
    albumGrid.innerHTML = '';
    
    tracks.forEach((track, index) => {
        const albumItem = document.createElement('div');
        albumItem.className = 'album-item';
        if (track.id === defaultTrackId) {
            albumItem.classList.add('active');
        }
        
        const img = document.createElement('img');
        img.src = track.cover;
        img.alt = track.title;
        
        albumItem.appendChild(img);
        albumItem.addEventListener('click', () => playTrack(track.id));
        albumGrid.appendChild(albumItem);
    });
    
    // 加载默认曲目
    playTrack(defaultTrackId);
    
    // 播放按钮事件
    const playBtn = document.getElementById('play-btn');
    if (playBtn) {
        playBtn.addEventListener('click', togglePlay);
    }
    
    // 音频播放结束事件
    const audioPlayer = document.getElementById('audio-player');
    if (audioPlayer) {
        audioPlayer.addEventListener('ended', () => {
            const playBtn = document.getElementById('play-btn');
            const vinylRecord = document.getElementById('vinyl-record');
            if (playBtn) playBtn.classList.remove('playing');
            if (vinylRecord) vinylRecord.classList.remove('playing');
            isPlaying = false;
        });
    }
}

// 播放指定曲目
function playTrack(trackId) {
    if (!config.vinyl) return;
    
    const track = config.vinyl.tracks.find(t => t.id === trackId);
    if (!track) return;
    
    currentTrack = track;
    
    // 更新黑胶中心图片
    const vinylCover = document.getElementById('vinyl-cover');
    if (vinylCover) vinylCover.src = track.cover;
    
    // 更新曲目信息
    const trackTitle = document.getElementById('track-title');
    const trackArtist = document.getElementById('track-artist');
    if (trackTitle) trackTitle.textContent = track.title;
    if (trackArtist) trackArtist.textContent = track.artist;
    
    // 更新音频源
    const audioPlayer = document.getElementById('audio-player');
    if (audioPlayer) audioPlayer.src = track.audio;
    
    // 更新专辑封面选中状态
    document.querySelectorAll('.album-item').forEach((item, index) => {
        if (config.vinyl.tracks[index].id === trackId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    // 如果正在播放，重新播放新曲目
    if (isPlaying && audioPlayer) {
        audioPlayer.play();
    }
}

// 切换播放/暂停
function togglePlay() {
    const audioPlayer = document.getElementById('audio-player');
    const playBtn = document.getElementById('play-btn');
    const vinylRecord = document.getElementById('vinyl-record');
    
    if (!currentTrack || !audioPlayer || !playBtn || !vinylRecord) return;
    
    if (isPlaying) {
        audioPlayer.pause();
        playBtn.classList.remove('playing');
        vinylRecord.classList.remove('playing');
    } else {
        audioPlayer.play();
        playBtn.classList.add('playing');
        vinylRecord.classList.add('playing');
    }
    
    isPlaying = !isPlaying;
}



// 初始化合集区（Bento 布局）
function initCollections() {
    if (!postsData.collections) return;
    
    const bentoGrid = document.getElementById('bento-grid');
    if (!bentoGrid) return; // 如果不在首页，直接返回
    
    bentoGrid.innerHTML = '';
    
    postsData.collections.forEach(collection => {
        const bentoItem = document.createElement('div');
        bentoItem.className = `bento-item ${collection.size}`;
        
        const cover = document.createElement('img');
        cover.src = collection.cover;
        cover.alt = collection.title;
        cover.className = 'bento-cover';
        
        const overlay = document.createElement('div');
        overlay.className = 'bento-overlay';
        
        const title = document.createElement('h3');
        title.className = 'bento-title';
        title.textContent = collection.title;
        
        const description = document.createElement('p');
        description.className = 'bento-description';
        description.textContent = collection.description;
        
        overlay.appendChild(title);
        overlay.appendChild(description);
        bentoItem.appendChild(cover);
        bentoItem.appendChild(overlay);
        
        bentoItem.addEventListener('click', () => {
            console.log('Clicked collection:', collection.id);
            // 记录用户从哪个区域点击的，用于返回时定位
            sessionStorage.setItem('lastSection', 'collections');
            window.location.href = `collection.html#id=${collection.id}`;
        });
        
        bentoGrid.appendChild(bentoItem);
    });
}

// 初始化时间流
function initTimeline() {
    if (!postsData.posts) return;
    
    const timelineList = document.getElementById('timeline-list');
    if (!timelineList) return; // 如果不在首页，直接返回
    
    renderTimeline();
    
    // 排序按钮事件
    const sortAscBtn = document.getElementById('sort-asc');
    const sortDescBtn = document.getElementById('sort-desc');
    
    if (sortAscBtn) {
        sortAscBtn.addEventListener('click', () => {
            sortAscending = true;
            updateSortButtons();
            renderTimeline();
        });
    }
    
    if (sortDescBtn) {
        sortDescBtn.addEventListener('click', () => {
            sortAscending = false;
            updateSortButtons();
            renderTimeline();
        });
    }
}

// 更新排序按钮状态
function updateSortButtons() {
    const ascBtn = document.getElementById('sort-asc');
    const descBtn = document.getElementById('sort-desc');
    
    if (!ascBtn || !descBtn) return;
    
    if (sortAscending) {
        ascBtn.classList.add('active');
        descBtn.classList.remove('active');
    } else {
        ascBtn.classList.remove('active');
        descBtn.classList.add('active');
    }
}

// 渲染时间流
function renderTimeline() {
    if (!postsData.posts) return;
    
    const timelineList = document.getElementById('timeline-list');
    if (!timelineList) return;
    
    timelineList.innerHTML = '';
    
    // 复制并排序文章
    const sortedPosts = [...postsData.posts].sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return sortAscending ? dateA - dateB : dateB - dateA;
    });
    
    sortedPosts.forEach(post => {
        const timelineItem = document.createElement('div');
        timelineItem.className = 'timeline-item';
        
        const date = document.createElement('div');
        date.className = 'timeline-date';
        date.textContent = formatDate(post.date);
        
        const title = document.createElement('h3');
        title.className = 'timeline-title';
        title.textContent = post.title;
        
        const excerpt = document.createElement('p');
        excerpt.className = 'timeline-excerpt';
        excerpt.textContent = post.excerpt;
        
        timelineItem.appendChild(date);
        timelineItem.appendChild(title);
        timelineItem.appendChild(excerpt);
        
        timelineItem.addEventListener('click', () => {
            // 记录用户从哪个区域点击的，用于返回时定位
            sessionStorage.setItem('lastSection', 'timeline');
            window.location.href = `article.html?id=${post.id}`;
        });
        
        timelineList.appendChild(timelineItem);
    });
}

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// 合集页面逻辑

async function loadCollectionPage() {
    try {
        console.log('Current URL:', window.location.href);
        console.log('Pathname:', window.location.pathname);
        
        // 初始化返回链接
        initCollectionBackLink();
        
        // 尝试从 query 参数获取
        let collectionId = new URLSearchParams(window.location.search).get('id');
        
        // 如果没有，尝试从 hash 获取
        if (!collectionId && window.location.hash) {
            const hashParams = new URLSearchParams(window.location.hash.substring(1));
            collectionId = hashParams.get('id');
        }
        
        console.log('Collection ID from URL:', collectionId);
        
        if (!collectionId) {
            console.error('No collection ID provided in URL');
            document.getElementById('article-list').innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">未指定合集 ID</p>';
            return;
        }
        
        const response = await fetch('posts.json');
        postsData = await response.json();
        
        console.log('Loaded posts data:', postsData);
        
        const collection = postsData.collections.find(c => c.id === collectionId);
        if (!collection) {
            console.error('Collection not found');
            return;
        }
        
        // 更新页面标题和描述
        document.getElementById('collection-title').textContent = collection.title;
        document.getElementById('collection-description').textContent = collection.description;
        
        // 筛选该合集的文章
        const collectionPosts = postsData.posts.filter(post => post.collectionId === collectionId);
        
        console.log('Collection ID:', collectionId);
        console.log('Collection posts:', collectionPosts);
        
        // 渲染文章列表
        const articleList = document.getElementById('article-list');
        articleList.innerHTML = '';
        
        if (collectionPosts.length === 0) {
            articleList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">该合集暂无文章</p>';
            return;
        }
        
        collectionPosts.forEach(post => {
            const articleItem = document.createElement('div');
            articleItem.className = 'article-list-item';
            
            const thumb = document.createElement('img');
            thumb.src = post.cover;
            thumb.alt = post.title;
            thumb.className = 'article-list-thumb';
            
            const info = document.createElement('div');
            info.className = 'article-list-info';
            
            const title = document.createElement('h3');
            title.className = 'article-list-title';
            title.textContent = post.title;
            
            const excerpt = document.createElement('p');
            excerpt.className = 'article-list-excerpt';
            excerpt.textContent = post.excerpt;
            
            info.appendChild(title);
            info.appendChild(excerpt);
            articleItem.appendChild(thumb);
            articleItem.appendChild(info);
            
            articleItem.addEventListener('click', () => {
                // 记录用户从合集页点击的，返回时回到合集区
                sessionStorage.setItem('lastSection', 'collections');
                window.location.href = `article.html?id=${post.id}`;
            });
            
            articleList.appendChild(articleItem);
        });
        
    } catch (error) {
        console.error('Error loading collection page:', error);
    }
}

// 初始化合集页面的返回链接
function initCollectionBackLink() {
    const backLink = document.getElementById('back-link');
    if (backLink) {
        backLink.href = 'index.html#collections';
    }
}
