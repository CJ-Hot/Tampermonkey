// ==UserScript==
// @name         2t58音乐播放优化
// @namespace    http://tampermonkey.net/
// @version      0.9
// @description  为2t58.com添加音乐批量播放功能
// @author       CJ-Hot
// @match        https://www.2t58.com/*
// @grant        none
// @icon         https://imge.kugou.com/commendpic/20160923/20160923162707215688.png
// @homepage     https://gh.llkk.cc/https://github.com/CJ-Hot/Tampermonkey/blob/main/2t58%E9%9F%B3%E4%B9%90%E6%92%AD%E6%94%BE%E4%BC%98%E5%8C%96.js
// ==/UserScript==

(function() {
    'use strict';

    // 添加批量播放控制按钮的样式
    const style = document.createElement('style');
    style.textContent = `
        .batch-play-controls {
            margin-top: 10px;
            padding: 10px;
            border-radius: 5px;
            background: rgba(255, 255, 255, 0.9);
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100%;
            box-sizing: border-box;
        }
        .batch-play-btn {
            background: #4CAF50;
            color: white;
            border: none;
            padding: 6px 15px;
            border-radius: 4px;
            cursor: pointer;
            margin: 0 3px;
            font-size: 13px;
            transition: all 0.3s ease;
            min-width: 150px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        .batch-play-btn:hover {
            background: #45a049;
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        .playlist-container {
            width: 100%;
            max-height: 300px;
            overflow-y: auto;
            margin-top: 15px;
            border-radius: 5px;
            background: rgba(255, 255, 255, 0.8);
            box-shadow: inset 0 0 5px rgba(0,0,0,0.1);
        }
        .playlist-container::-webkit-scrollbar {
            width: 8px;
        }
        .playlist-container::-webkit-scrollbar-track {
            background: rgba(0,0,0,0.05);
            border-radius: 4px;
        }
        .playlist-container::-webkit-scrollbar-thumb {
            background: rgba(69, 160, 73, 0.5);
            border-radius: 4px;
        }
        .playlist-container::-webkit-scrollbar-thumb:hover {
            background: rgba(69, 160, 73, 0.7);
        }
        .playlist-item {
            padding: 10px 15px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 10px;
            transition: all 0.3s ease;
            border-bottom: 1px solid rgba(0,0,0,0.05);
        }
        .playlist-item:hover {
            background: rgba(69, 160, 73, 0.1);
        }
        .playlist-item.current {
            background: rgba(69, 160, 73, 0.2);
            font-weight: bold;
            color: #45a049;
        }
        .playlist-item-index {
            min-width: 30px;
            text-align: center;
            color: #666;
        }
        .playlist-item-title {
            flex: 1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .batch-play-btn:hover {
            background: #3d8b40;
        }
        .song-details {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-top: 10px;
            padding: 10px;
            background: rgba(0, 0, 0, 0.05);
            border-radius: 5px;
        }
        .song-details img {
            width: 60px;
            height: 60px;
            border-radius: 4px;
            object-fit: cover;
        }
        .song-details-info {
            flex: 1;
            min-width: 0;
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            align-items: center;
        }
        .song-details-info p {
            margin: 3px 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            flex: 1;
            min-width: 150px;
            padding: 5px 10px;
            background: rgba(0, 0, 0, 0.03);
            border-radius: 4px;
        }
        .title {
            display: flex;
            align-items: center;
            gap: 10px;
            cursor: pointer;
            padding: 10px;
            border-radius: 5px;
            transition: background-color 0.3s;
        }
        .title:hover {
            background-color: rgba(69, 160, 73, 0.1);
        }
        .title h1 {
            margin: 0;
            flex: 1;
        }
        .navigation-controls {
            display: flex;
            gap: 5px;
            margin-top: 5px;
        }
        .song-info {
            margin-top: 10px;
            font-size: 14px;
            color: #333;
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 15px;
            padding: 10px;
            background: rgba(0, 0, 0, 0.05);
            border-radius: 5px;
        }
        .song-info p {
            margin: 0;
            flex: 1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            padding: 8px 15px;
            background: rgba(255, 255, 255, 0.8);
            border-radius: 4px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .song-details {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-top: 10px;
            padding: 10px;
            background: rgba(0, 0, 0, 0.05);
            border-radius: 5px;
        }
        .song-details img {
            width: 60px;
            height: 60px;
            border-radius: 4px;
            object-fit: cover;
        }
        .song-details-info {
            flex: 1;
            min-width: 0;
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            align-items: center;
        }
        .song-details-info p {
            margin: 3px 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            flex: 1;
            min-width: 150px;
            padding: 5px 10px;
            background: rgba(0, 0, 0, 0.03);
            border-radius: 4px;
        }
    `;
    document.head.appendChild(style);

    // 创建控制面板
    const controls = document.createElement('div');
    controls.className = 'batch-play-controls';

    // 根据页面类型选择不同的显示方式
    if (isListPage()) {
        // 在列表页面，将批量播放按钮添加到标题区域
        const playListTitle = document.querySelector('.play_list .title');
        const titleDiv = playListTitle || document.querySelector('.title');
        if (titleDiv) {
            const playButton = document.createElement('button');
            playButton.className = 'batch-play-btn';
            playButton.id = 'startBatchPlay';
            playButton.style.cssText = 'margin-left: 15px; vertical-align: middle; display: inline-block; font-size: 14px; line-height: 1.5; padding: 8px 20px; background-color: #45a049; border-radius: 6px; min-width: 100px; transition: all 0.3s ease;';
            playButton.textContent = '加载中...';
            playButton.disabled = true;
            
            // 将按钮插入到标题后面
            const h1 = titleDiv.querySelector('h1');
            if (h1) {
                h1.style.display = 'inline-block';
                h1.style.cursor = 'pointer';
                h1.insertAdjacentElement('afterend', playButton);
                
                // 为整个标题区域添加点击事件
                titleDiv.addEventListener('click', async (e) => {
                    // 如果点击的是按钮，不触发标题点击事件
                    if (e.target === playButton) return;
                    
                    // 模拟点击播放按钮
                    playButton.click();
                });

                const songTitle = document.querySelector('.play_singer h1');
                const artistLink = document.querySelector('.name a[href*="/singer/"]');
                const albumLink = document.querySelector('a[href*="/album/"]');
                const coverImg = document.querySelector('.play_singer img');

                if (songTitle) document.getElementById('songTitle').textContent = songTitle.textContent;
                if (artistLink) document.getElementById('artistName').textContent = artistLink.textContent;
                if (albumLink) document.getElementById('albumName').textContent = albumLink.textContent;
                if (coverImg) document.getElementById('songCover').src = coverImg.src;

                // 添加点击跳转逻辑
                const artistNameElement = document.getElementById('artistName');
                if (artistNameElement && artistLink) {
                    artistNameElement.style.cursor = 'pointer';
                    artistNameElement.style.color = '#45a049';
                    artistNameElement.addEventListener('click', (e) => {
                        e.preventDefault();
                        window.location.href = artistLink.href;
                    });
                }
                const albumNameElement = document.getElementById('albumName');
                if (albumNameElement && albumLink) {
                    albumNameElement.style.cursor = 'pointer';
                    albumNameElement.style.color = '#45a049';
                    albumNameElement.addEventListener('click', (e) => {
                        e.preventDefault();
                        window.location.href = albumLink.href;
                    });
                }
            } else {
                titleDiv.appendChild(playButton);
            }

            // 立即获取完整的音乐列表数量
            getMusicList().then(list => {
                playButton.textContent = `批量播放 ${list.length} 首音乐`;
                playButton.disabled = false;
            }).catch(() => {
                playButton.textContent = '批量播放';
                playButton.disabled = false;
            });

            // 为按钮添加点击事件监听器
            playButton.addEventListener('click', async () => {
                playButton.textContent = '加载中...';
                playButton.disabled = true;
                const newList = await getMusicList();
                if (newList.length === 0) {
                    alert('未找到可播放的音乐');
                    playButton.textContent = '批量播放';
                    playButton.disabled = false;
                    return;
                }
                isPlaying = true;
                currentIndex = 0;
                savePlayState();
                playMusic(playList[currentIndex]);
                updateSongInfo();
            });
        }
    } else {
        // 在播放页面，将控制面板添加到播放器区域
        const playLeft = document.querySelector('.play_left');
        if (playLeft) {
            controls.innerHTML = `
                <div class="navigation-controls">
                    <button class="batch-play-btn" id="prevSong">
                        <span class="nav-icon">⏮</span>
                        <span class="nav-song-title" id="prevSongTitle">上一首</span>
                    </button>
                    <button class="batch-play-btn" id="stopBatchPlay">停止播放</button>
                    <button class="batch-play-btn" id="nextSong">
                        <span class="nav-song-title" id="nextSongTitle">下一首</span>
                        <span class="nav-icon">⏭</span>
                    </button>
                </div>
                <div class="playlist-container" id="playlistContainer">
                    <div class="playlist-items" id="playlistItems"></div>
                </div>
                <div class="song-details">
                    <img id="songCover" src="" alt="封面" onerror="this.src='默认封面URL'">
                    <div class="song-details-info">
                        <p id="songTitle"></p>
                        <p id="artistName"></p>
                        <p id="albumName"></p>
                    </div>
                </div>
            `;
            playLeft.appendChild(controls);

            // 更新播放列表显示
            function updatePlaylistDisplay() {
                const container = document.getElementById('playlistItems');
                if (!container || !playList.length) return;

                container.innerHTML = playList.map((item, index) => `
                    <div class="playlist-item ${index === currentIndex ? 'current' : ''}" data-index="${index}">
                        <span class="playlist-item-index">${index + 1}</span>
                        <span class="playlist-item-title">${item.textContent || '未知歌曲'}</span>
                    </div>
                `).join('');

                // 添加点击事件监听
                container.querySelectorAll('.playlist-item').forEach(item => {
                    item.addEventListener('click', () => {
                        const index = parseInt(item.dataset.index);
                        if (index !== currentIndex) {
                            currentIndex = index;
                            playMusic(playList[currentIndex]);
                            updateSongInfo();
                            savePlayState();
                        }
                    });
                });

                // 确保当前播放项可见
                const currentItem = container.querySelector('.current');
                if (currentItem) {
                    currentItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }

            // 更新导航按钮显示
            function updateNavigationButtons() {
                const prevTitle = document.getElementById('prevSongTitle');
                const nextTitle = document.getElementById('nextSongTitle');

                if (playList.length > 0) {
                    const prevIndex = Math.max(0, currentIndex - 1);
                    const nextIndex = Math.min(playList.length - 1, currentIndex + 1);

                    prevTitle.textContent = currentIndex > 0 ? 
                        (playList[prevIndex].textContent || '上一首') : '已是第一首';
                    nextTitle.textContent = currentIndex < playList.length - 1 ? 
                        (playList[nextIndex].textContent || '下一首') : '已是最后一首';
                }
            }

            // 扩展updateSongInfo函数
            const originalUpdateSongInfo = updateSongInfo;
            updateSongInfo = function() {
                originalUpdateSongInfo();
                updatePlaylistDisplay();
                updateNavigationButtons();
            };
            const songTitle = document.querySelector('.play_singer h1');
            const artistLink = document.querySelector('.name a[href*="/singer/"]');
            const albumLink = document.querySelector('a[href*="/album/"]');
            const coverImg = document.querySelector('.play_singer img');

            if (songTitle) document.getElementById('songTitle').textContent = songTitle.textContent;
            if (artistLink) document.getElementById('artistName').textContent = artistLink.textContent;
            if (albumLink) document.getElementById('albumName').textContent = albumLink.textContent;
            if (coverImg) document.getElementById('songCover').src = coverImg.src;

            // 添加点击跳转逻辑
            const artistNameElement = document.getElementById('artistName');
            if (artistNameElement && artistLink) {
                artistNameElement.style.cursor = 'pointer';
                artistNameElement.style.color = '#45a049';
                artistNameElement.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.location.href = artistLink.href;
                });
            }
            const albumNameElement = document.getElementById('albumName');
            if (albumNameElement && albumLink) {
                albumNameElement.style.cursor = 'pointer';
                albumNameElement.style.color = '#45a049';
                albumNameElement.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.location.href = albumLink.href;
                });
            }
        }
    }

    let isPlaying = false;
    let currentIndex = 0;
    let playList = [];

    // 从localStorage加载播放状态
    function loadPlayState() {
        const savedState = localStorage.getItem('2t58_player_state');
        if (savedState) {
            const state = JSON.parse(savedState);
            isPlaying = state.isPlaying;
            currentIndex = state.currentIndex;
            playList = state.playList;
            // 恢复上一页URL
            if (state.previousPage) {
                localStorage.setItem('2t58_previous_page', state.previousPage);
            }
        }
    }

    // 保存播放状态到localStorage
    function savePlayState() {
        const state = {
            isPlaying,
            currentIndex,
            playList: playList.map(link => ({
                href: link.href,
                text: link.textContent
            })),
            previousPage: localStorage.getItem('2t58_previous_page') || document.referrer
        };
        localStorage.setItem('2t58_player_state', JSON.stringify(state));
    }

    // 恢复播放列表的DOM元素
    function restorePlayList() {
        if (playList.length > 0 && typeof playList[0] === 'object' && !playList[0].tagName) {
            playList = playList.map(item => {
                const a = document.createElement('a');
                a.href = item.href;
                a.textContent = item.text;
                return a;
            });
        }
    }

    // 播放音乐

    function playMusic(musicLink) {
        if (!musicLink) return;
        // 保存当前页面URL作为上一页
        if (!isPlayPage()) {
            localStorage.setItem('2t58_previous_page', window.location.href);
        }
        window.location.href = musicLink.href;
    }

    // 检查是否在播放页面
    function isPlayPage() {
        return window.location.pathname.includes('/song/') && 
               window.location.pathname.includes('.html');
    }

    // 检查是否在列表页面
    function isListPage() {
        const path = window.location.pathname;
        return path.includes('/playlist/') || 
               path.includes('/list/') || 
               path.includes('/music/') ||
               path.includes('/singer/') ||
               path.includes('/radio/') ||
               path.includes('/radiolist/') ||
               path.includes('/mvlist/');
    }

    // 获取音乐列表
    async function getMusicList() {
        let allLinks = [];
        
        // 获取当前页面的音乐链接
        const getCurrentPageLinks = () => {
            const songLinks = document.querySelectorAll('a[href*="/song/"]');
            const musicLinks = document.querySelectorAll('a[href*="/music/"]');
            return [...Array.from(songLinks), ...Array.from(musicLinks)].filter(link => {
                const href = link.getAttribute('href');
                return href && (href.match(/\/song\/.*\.html/) || href.match(/\/music\/\d+\.html/));
            });
        };

        // 获取分页信息
        const getPageInfo = () => {
            const pageDiv = document.querySelector('.page');
            if (!pageDiv) return { totalPages: 1 };

            const lastPageLink = pageDiv.querySelector('a[href*=".html"]:last-child');
            if (!lastPageLink) return { totalPages: 1 };

            const match = lastPageLink.getAttribute('href').match(/\/(\d+)\.html/);
            return { totalPages: match ? parseInt(match[1]) : 1 };
        };

        // 静默加载指定页面的内容并提取音乐链接
        const loadPageLinks = async (pageUrl) => {
            try {
                const response = await fetch(pageUrl, { 
                    method: 'GET',
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });
                const text = await response.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(text, 'text/html');
                
                const songLinks = doc.querySelectorAll('a[href*="/song/"]');
                const musicLinks = doc.querySelectorAll('a[href*="/music/"]');
                
                return [...Array.from(songLinks), ...Array.from(musicLinks)].filter(link => {
                    const href = link.getAttribute('href');
                    return href && (href.match(/\/song\/.*\.html/) || href.match(/\/music\/\d+\.html/));
                });
            } catch (error) {
                console.error('加载页面失败:', error);
                return [];
            }
        };

        // 获取当前页面的链接
        allLinks = getCurrentPageLinks();

        // 获取分页信息
        const { totalPages } = getPageInfo();

        // 如果有多个页面，静默加载其他页面的内容
        if (totalPages > 1) {
            const currentPath = window.location.pathname;
            const basePath = currentPath.replace(/\d*\.html$/, '');

            // 并行加载其他页面以提高效率
            const loadPromises = [];
            for (let page = 2; page <= totalPages; page++) {
                const pageUrl = `${window.location.origin}${basePath}${page}.html`;
                loadPromises.push(loadPageLinks(pageUrl));
            }

            // 等待所有页面加载完成
            const results = await Promise.all(loadPromises);
            results.forEach(links => {
                allLinks = allLinks.concat(links);
            });
        }

        // 更新播放列表
        playList = allLinks;
        
        if (playList.length > 0 && isListPage()) {
            localStorage.setItem('2t58_previous_page', window.location.href);
        }
        
        savePlayState();
        return playList;
    }

    // 自动播放下一首


    function playPrev() {
        if (!isPlaying || playList.length === 0) return;
        currentIndex = Math.max(0, currentIndex - 1);
        playMusic(playList[currentIndex]);
        updateSongInfo();
        savePlayState();
    }

    function playNext() {
        if (!isPlaying || playList.length === 0) return;
        currentIndex = Math.min(playList.length - 1, currentIndex + 1);
        if (currentIndex < playList.length) {
            playMusic(playList[currentIndex]);
            updateSongInfo();
            savePlayState();
        } else {
            // 播放列表结束
            isPlaying = false;
            savePlayState();
            updateSongInfo();
        }
    }



    // 更新歌曲信息显示
    function updateSongInfo() {
        const totalSongsElement = document.getElementById('totalSongs');
        const currentSongElement = document.getElementById('currentSong');
        const nextSongElement = document.getElementById('nextSongInfo');

        if (!totalSongsElement || !currentSongElement || !nextSongElement) return;

        if (playList && playList.length > 0) {
            totalSongsElement.textContent = `播放列表：共${playList.length}首`;
            if (isPlaying && currentIndex >= 0 && currentIndex < playList.length) {
                const currentSong = playList[currentIndex];
                const currentSongName = (currentSong.textContent || currentSong.text || '未知歌曲').split(' - ').pop();
                currentSongElement.textContent = `当前播放：第${currentIndex + 1}/${playList.length}首 - ${currentSongName}`;
                
                if (currentIndex + 1 < playList.length) {
                    const nextSong = playList[currentIndex + 1];
                    const nextSongName = (nextSong.textContent || nextSong.text || '未知歌曲').split(' - ').pop();
                    nextSongElement.textContent = `下一首：${nextSongName}`;
                } else {
                    nextSongElement.textContent = '下一首：播放列表结束';
                }
            } else {
                currentSongElement.textContent = '当前播放：未开始播放';
                nextSongElement.textContent = '下一首：无';
            }
        } else {
            totalSongsElement.textContent = '播放列表：暂无歌曲';
            currentSongElement.textContent = '当前播放：未开始播放';
            nextSongElement.textContent = '下一首：无';
        }
    }

    // 停止播放
    const stopButton = document.getElementById('stopBatchPlay');
    if (stopButton) {
        stopButton.addEventListener('click', () => {
            isPlaying = false;
            savePlayState();
            updateSongInfo();
            // 返回到保存的上一页URL
            const previousPage = localStorage.getItem('2t58_previous_page');
            if (previousPage) {
                window.location.href = previousPage;
            } else {
                history.back(); // 如果没有保存的页面，则使用浏览器后退
            }
        });
    }

    // 添加上一首下一首按钮的事件监听
    const prevButton = document.getElementById('prevSong');
    const nextButton = document.getElementById('nextSong');

    if (prevButton) {
        prevButton.addEventListener('click', playPrev);
    }
    if (nextButton) {
        nextButton.addEventListener('click', playNext);
    }

    // 开始批量播放
    const startButton = document.getElementById('startBatchPlay');
    if (startButton) {
        startButton.addEventListener('click', async () => {
            const newList = await getMusicList();
            if (newList.length === 0) {
                alert('未找到可播放的音乐');
                return;
            }
            isPlaying = true;
            currentIndex = 0;
            savePlayState();
            playMusic(playList[currentIndex]);
            updateSongInfo();
        });
    }

    // 初始化：加载保存的播放状态
    loadPlayState();
    restorePlayList();

    // 在播放页面，立即更新显示状态
    if (isPlayPage()) {
        // 先尝试更新一次显示状态
        updateSongInfo();
        
        // 等待音频元素加载
        const checkAudio = () => {
            const audioElement = document.querySelector('audio');
            if (audioElement) {
                audioElement.addEventListener('ended', playNext);
                // 监听音频源变化
                const downloadButton = document.getElementById('downloadSong');
                if (downloadButton) {
                    downloadButton.style.display = 'inline-block';
                    downloadButton.addEventListener('click', () => {
                        const audioElement = document.querySelector('audio');
                        if (audioElement && audioElement.src) {
                            const songTitle = document.querySelector('.play_singer h1')?.textContent?.trim() || '未知歌曲';
                            const artistName = document.querySelector('.name a[href*="/singer/"]')?.textContent?.trim() || '未知歌手';
                            const fileName = `${songTitle}-${artistName}.mp3`.replace(/[\\/:*?"<>|]/g, '_');
                            
                            const downloadLink = document.createElement('a');
                            downloadLink.href = audioElement.src;
                            downloadLink.download = fileName;
                            document.body.appendChild(downloadLink);
                            downloadLink.click();
                            document.body.removeChild(downloadLink);
                        }
                    });
                }
                audioElement.addEventListener('loadedmetadata', () => {
                    if (downloadButton) {
                        downloadButton.style.display = audioElement.src && audioElement.src.includes('.mp3') ? 'inline-block' : 'none';
                    }
                });
                // 初始检查
                updateDownloadButton();
                // 再次更新显示状态，确保信息正确
                updateSongInfo();
            } else {
                // 如果没有找到音频元素，继续尝试
                setTimeout(checkAudio, 1000);
            }
        };
        checkAudio();
    }
})();