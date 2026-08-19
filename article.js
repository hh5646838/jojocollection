// 文章详情页逻辑
document.addEventListener('DOMContentLoaded', () => {
    loadArticle();
    initThemeToggle();
    initBackLink();
});

async function loadArticle() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const articleId = urlParams.get('id');
        
        const response = await fetch('posts.json');
        const postsData = await response.json();
        
        const post = postsData.posts.find(p => p.id === articleId);
        if (!post) {
            console.error('Article not found');
            return;
        }
        
        // 更新文章内容
        document.getElementById('article-cover').src = post.cover;
        document.getElementById('article-title').textContent = post.title;
        document.getElementById('article-date').textContent = formatDate(post.date);
        
        // 渲染标签
        const tagsContainer = document.getElementById('article-tags');
        tagsContainer.innerHTML = '';
        post.tags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = 'article-tag';
            tagElement.textContent = tag;
            tagsContainer.appendChild(tagElement);
        });
        
        // 渲染 Markdown 内容
        const articleBody = document.getElementById('article-body');
        articleBody.innerHTML = marked.parse(post.content);
        
        // 处理音频元素样式
        const audioElements = articleBody.querySelectorAll('audio');
        audioElements.forEach(audio => {
            audio.style.width = '100%';
            audio.style.margin = '1.5rem 0';
            audio.style.borderRadius = '8px';
        });
        
    } catch (error) {
        console.error('Error loading article:', error);
    }
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

// 主题切换
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const articlePage = document.querySelector('.article-page');
    
    // 检查本地存储的主题偏好
    const savedTheme = localStorage.getItem('article-theme');
    if (savedTheme === 'light') {
        articlePage.classList.add('light-theme');
    }
    
    themeToggle.addEventListener('click', () => {
        articlePage.classList.toggle('light-theme');
        
        // 保存主题偏好
        if (articlePage.classList.contains('light-theme')) {
            localStorage.setItem('article-theme', 'light');
        } else {
            localStorage.setItem('article-theme', 'dark');
        }
    });
}

// 初始化返回链接
function initBackLink() {
    const backLink = document.getElementById('back-link');
    const lastSection = sessionStorage.getItem('lastSection');
    
    if (lastSection) {
        backLink.href = `index.html#${lastSection}`;
    }
    
    // 清除存储的区域信息
    sessionStorage.removeItem('lastSection');
}
