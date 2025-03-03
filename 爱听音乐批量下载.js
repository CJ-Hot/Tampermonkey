// ==UserScript==
// @name         2t58音乐下载器
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  为2t58.com添加音乐下载功能
// @author       CJ-Hot
// @match        https://www.2t58.com/*
// @grant        GM_download
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_cookie
// @grant        GM_xmlhttpRequest
// @connect      2t58.com
// @connect      kuwo.cn
// @icon         https://imge.kugou.com/commendpic/20160923/20160923162707215688.png
// @homepage     https://gh.llkk.cc/https://github.com/CJ-Hot/Tampermonkey/blob/main/爱听音乐批量下载.js
// ==/UserScript==

(function() {
    'use strict';

    // 添加样式
    const style = document.createElement('style');
    style.textContent = `
        .floating-window {
            position: fixed;
            right: 20px;
            top: 20px;
            width: 300px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 10000;
            overflow: hidden;
            resize: both;
            min-width: 250px;
            min-height: 200px;
        }
        .window-header {
            background: #2196F3;
            color: white;
            padding: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: move;
        }
        .window-title {
            font-weight: bold;
            font-size: 14px;
        }
        .window-controls {
            display: flex;
            gap: 8px;
        }
        .window-control {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            color: #2196F3;
            background: white;
        }
        .window-tabs {
            display: flex;
            background: #f5f5f5;
            border-bottom: 1px solid #e0e0e0;
        }
        .window-tab {
            padding: 8px 15px;
            cursor: pointer;
            border: none;
            background: none;
            font-size: 13px;
        }
        .window-tab.active {
            background: white;
            border-bottom: 2px solid #2196F3;
            color: #2196F3;
        }
        .window-content {
            padding: 15px;
            max-height: 400px;
            overflow-y: auto;
        }
        .download-btn {
            background: #2196F3;
            color: white;
            border: none;
            padding: 6px 15px;
            border-radius: 4px;
            cursor: pointer;
            margin: 5px 0;
            font-size: 13px;
            transition: all 0.3s ease;
            width: 100%;
        }
        .download-btn:hover {
            background: #1976D2;
        }
        .download-list {
            margin-top: 10px;
        }
        .download-item {
            padding: 8px;
            border-bottom: 1px solid #f0f0f0;
            font-size: 13px;
        }
        .download-progress {
            height: 4px;
            width: 100%;
            background: #e0e0e0;
            border-radius: 2px;
            margin-top: 5px;
        }
        .download-progress-bar {
            height: 100%;
            background: #2196F3;
            border-radius: 2px;
            width: 0%;
            transition: width 0.3s ease;
        }
        .debug-log {
            font-family: monospace;
            font-size: 12px;
            white-space: pre-wrap;
            background: #f8f8f8;
            padding: 10px;
            border-radius: 4px;
            margin-top: 10px;
        }
    `;
    document.head.appendChild(style);

    // 创建浮动窗口
    function createFloatingWindow() {
        const window = document.createElement('div');
        window.className = 'floating-window';
        window.innerHTML = `
            <div class="window-header">
                <div class="window-title">2t58音乐下载器</div>
                <div class="window-controls">
                    <button class="window-control minimize">_</button>
                    <button class="window-control close">×</button>
                </div>
            </div>
            <div class="window-tabs">
                <button class="window-tab active" data-tab="download">下载管理</button>
                <button class="window-tab" data-tab="debug">调试信息</button>
            </div>
            <div class="window-content">
                <div class="tab-panel" id="download-panel">
                    <button class="download-btn" id="downloadCurrent">下载当前歌曲</button>
                    <button class="download-btn" id="downloadAll" style="margin-top: 10px;">批量下载全部</button>
                    <div class="download-list"></div>
                </div>
                <div class="tab-panel" id="debug-panel" style="display: none;">
                    <div class="debug-log"></div>
                </div>
            </div>
        `;
        document.body.appendChild(window);

        // 实现窗口拖动
        const header = window.querySelector('.window-header');
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;

        header.addEventListener('mousedown', (e) => {
            isDragging = true;
            initialX = e.clientX - window.offsetLeft;
            initialY = e.clientY - window.offsetTop;
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
                window.style.left = `${currentX}px`;
                window.style.top = `${currentY}px`;
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });

        // 实现标签页切换
        const tabs = window.querySelectorAll('.window-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const panels = window.querySelectorAll('.tab-panel');
                panels.forEach(panel => panel.style.display = 'none');
                const targetPanel = document.getElementById(`${tab.dataset.tab}-panel`);
                if (targetPanel) targetPanel.style.display = 'block';
            });
        });

        // 实现最小化和关闭
        const minimizeBtn = window.querySelector('.minimize');
        const closeBtn = window.querySelector('.close');
        let isMinimized = false;

        minimizeBtn.addEventListener('click', () => {
            const content = window.querySelector('.window-content');
            const tabs = window.querySelector('.window-tabs');
            if (isMinimized) {
                content.style.display = 'block';
                tabs.style.display = 'flex';
                window.style.height = 'auto';
            } else {
                content.style.display = 'none';
                tabs.style.display = 'none';
                window.style.height = 'auto';
            }
            isMinimized = !isMinimized;
        });

        closeBtn.addEventListener('click', () => {
            window.style.display = 'none';
        });

        return window;
    }

    // 添加调试日志
    function addDebugLog(message) {
        // 只显示重要信息
        if (!message.includes('错误') && 
            !message.includes('失败') && 
            !message.includes('完成') && 
            !message.includes('Cookie') && 
            !message.includes('开始下载')) {
            return;
        }

        const debugLog = document.querySelector('.debug-log');
        if (!debugLog) return;

        const timestamp = new Date().toLocaleTimeString();
        debugLog.innerHTML += `[${timestamp}] ${message}\n`;
        debugLog.scrollTop = debugLog.scrollHeight;
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
               path.includes('/so/') ||
               path.includes('/mvlist/');
    }

    // 获取音频URL
    async function getAudioUrl(songId, format = '320kmp3') {
        if (!songId) {
            const audioPlayer = document.querySelector('audio');
            return audioPlayer ? audioPlayer.src : null;
        }
        const formats = {
            '320kmp3': '320kmp3',
            'flac': 'flac',
            'mp4': 'mp4'
        };

        // 获取保存的Cookie
        const savedCookies = GM_getValue('savedCookies', []);
        const cookieString = savedCookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
        //addDebugLog('使用保存的Cookie: ' + cookieString);

        if (format === 'mp4') {
            return new Promise((resolve, reject) => {
                const vplayUrl = `https://www.2t58.com/plug/down.php?ac=vplay&id=${songId}&q=1080`;
                GM_xmlhttpRequest({
                    method: 'GET',
                    url: vplayUrl,
                    headers: {
                        'Cookie': cookieString,
                        'Referer': 'https://www.2t58.com/'
                    },
                    onload: function(response) {
                        addDebugLog(`请求状态: ${response.status} ${response.statusText}`);
                        const realUrl = response.finalUrl || response.responseHeaders.match(/location: (.+)\r\n/i)?.[1];
                        if (realUrl && !realUrl.includes('login.php')) {
                            addDebugLog('成功获取真实下载地址');
                            resolve(realUrl);
                        } else {
                            reject('无法获取MP4真实下载地址，请检查登录状态');
                        }
                    },
                    onerror: function(error) {
                        addDebugLog('请求失败: ' + error);
                        reject('获取MP4下载地址失败: ' + error);
                    }
                });
            });
        }

        // 对于非MP4格式，也添加Cookie信息
        return new Promise((resolve, reject) => {
            const musicUrl = `https://www.2t58.com/plug/down.php?ac=music&id=${songId}&k=${formats[format]}`;
            GM_xmlhttpRequest({
                method: 'GET',
                url: musicUrl,
                headers: {
                    'Cookie': cookieString,
                    'Referer': 'https://www.2t58.com/'
                },
                onload: function(response) {
                    addDebugLog(`请求状态: ${response.status} ${response.statusText}`);
                    if (response.finalUrl && !response.finalUrl.includes('login.php')) {
                        addDebugLog('成功获取真实下载地址');
                        resolve(response.finalUrl);
                    } else {
                        reject('无法获取下载地址，请检查登录状态');
                    }
                },
                onerror: function(error) {
                    addDebugLog('请求失败: ' + error);
                    reject('获取下载地址失败: ' + error);
                }
            });
        });
    }

    // 获取当前歌曲信息
    function getSongInfo() {
        const titleElement = document.querySelector('#jp_container_1 > div.jp_right > div.djname > h1');
        let songTitle = '';
        
        if (titleElement) {
            // 获取h1的直接文本内容（不包含子元素的文本）
            songTitle = Array.from(titleElement.childNodes)
                .filter(node => node.nodeType === Node.TEXT_NODE)
                .map(node => node.textContent.trim())
                .join('')
                .trim();
        }

        const songId = extractSongId(window.location.href);

        if (!songTitle || !songId) {
            addDebugLog('无法获取歌曲信息');
            return null;
        }

        return {
            title: songTitle,
            id: songId
        };
    }

    // 从URL中提取歌曲ID
    function extractSongId(url) {
        const match = url.match(/\/song\/([^.]+)\.html/);
        return match ? match[1] : null;
    }

    // 检查是否有MV标签
    function hasMVTag(songLink) {
        // 查找包含该链接的列表项
        const listItem = songLink.closest('li');
        if (!listItem) return false;

        // 在列表项内查找MV标签
        const mvTags = listItem.querySelectorAll('.mv');
        return mvTags.length > 0;
    }

    // 下载单首歌曲
    async function downloadSong(songInfo, format = '320kmp3') {
        // 检查MP4格式下载条件
        if (format === 'mp4' && !hasMVTag(document.querySelector(`a[href*="/song/${songInfo.id}"]`))) {
            addDebugLog(`跳过下载：${songInfo.title} - 不支持MP4格式（无MV标签）`);
            return;
        }

        const formats = {
            '320kmp3': '.mp3',
            'flac': '.flac',
            'mp4': '.mp4'
        };
        const url = await getAudioUrl(songInfo.id, format);

        if (!url) {
            addDebugLog('错误：无法获取音频地址');
            alert('无法获取音频地址');
            return;
        }

        // 同步获取并处理实际文件扩展名
        const urlPath = new URL(url).pathname;
        const urlExtension = urlPath.split('.').pop().toLowerCase();
        const fileExtension = '.' + urlExtension;
        if (format === 'flac' && urlExtension !== 'flac') {
            addDebugLog(`警告：请求FLAC格式但实际获得${urlExtension}格式`);
        }

        // 使用正确的文件扩展名
        const filename = `${songInfo.title}${fileExtension}`;

        addDebugLog(`开始下载: ${filename}\n格式: ${format}\n下载地址: ${url}`);

        let retryCount = 0;
        const maxRetries = 3;

        const downloadWithRetry = () => {
            GM_download({
                url: url,
                name: filename,
                onprogress: (progress) => {
                    if (!progress.lengthComputable) {
                        addDebugLog('警告：无法获取文件大小信息');
                        return;
                    }
                    const percent = (progress.loaded / progress.total) * 100;
                    const progressBar = document.querySelector('.download-progress-bar');
                    if (progressBar) {
                        progressBar.style.width = `${percent}%`;
                    }
                    addDebugLog(`下载进度: ${Math.round(percent)}% (${progress.loaded}/${progress.total} 字节)`);
                },
                onerror: (error) => {
                    addDebugLog(`下载失败: ${error}`);
                    if (retryCount < maxRetries) {
                        retryCount++;
                        addDebugLog(`尝试第 ${retryCount} 次重试...`);
                        setTimeout(downloadWithRetry, 1000 * retryCount);
                    } else {
                        addDebugLog('达到最大重试次数，下载失败');
                        alert(`下载失败: ${error}\n请检查网络连接或刷新页面后重试`);
                    }
                },
                onload: () => {
                    addDebugLog(`下载完成: ${filename}`);
                    const progressBar = document.querySelector('.download-progress-bar');
                    if (progressBar) {
                        progressBar.style.width = '100%';
                        setTimeout(() => {
                            progressBar.style.width = '0%';
                        }, 2000);
                    }
                }
            });
        };

        downloadWithRetry();
    }

    // 创建并显示浮动窗口
    const floatingWindow = createFloatingWindow();

    // 修改下载按钮UI
    // Cookie管理功能
    function saveCookies() {
        GM_cookie.list({ domain: '2t58.com' }, function(cookies) {
            const saveTime = new Date().toLocaleString();
            GM_setValue('savedCookies', cookies);
            GM_setValue('cookieSaveTime', saveTime);
            addDebugLog(`Cookies已保存 - 保存时间: ${saveTime}`);
        });
    }

    function loadCookies() {
        const savedCookies = GM_getValue('savedCookies', []);
        const saveTime = GM_getValue('cookieSaveTime', '未知');
        if (savedCookies.length > 0) {
            savedCookies.forEach(cookie => {
                GM_cookie.set({
                    domain: '2t58.com',
                    name: cookie.name,
                    value: cookie.value,
                    path: cookie.path || '/',
                    secure: cookie.secure,
                    httpOnly: cookie.httpOnly
                });
            });
            addDebugLog(`Cookies已恢复 - 上次保存时间: ${saveTime}`);
        } else {
            addDebugLog('没有找到已保存的Cookies');
        }
    }

    function refreshCookies() {
        saveCookies();
        loadCookies();
        addDebugLog('Cookies已刷新');
    }
    // 修改下载按钮UI，添加Cookie管理按钮
        const downloadPanel = document.getElementById('download-panel');
        downloadPanel.innerHTML = `
            <div class="format-selector" style="margin-bottom: 10px;">
                <select id="formatSelect" class="download-btn" style="background: white; color: #2196F3;">
                    <option value="320kmp3">MP3 320K</option>
                    <option value="flac">FLAC</option>
                    <option value="mp4">MP4</option>
                </select>
            </div>
            ${isPlayPage() ? `
                <button class="download-btn" id="downloadCurrent">下载当前歌曲</button>
            ` : ''}
            ${isListPage() ? `
                <button class="download-btn" id="downloadAll" style="margin-top: 10px;">批量下载全部</button>
            ` : ''}
            <div class="cookie-controls" style="margin-top: 10px;">
                <button class="download-btn" id="refreshAndSaveCookies">刷新并保存Cookie</button>
            </div>
            <div class="download-progress">
                <div class="download-progress-bar"></div>
            </div>
            <div class="download-list"></div>
        `;
    // 添加Cookie管理按钮事件
    const refreshAndSaveCookiesBtn = document.getElementById('refreshAndSaveCookies');
    if (refreshAndSaveCookiesBtn) {
        refreshAndSaveCookiesBtn.addEventListener('click', () => {
            saveCookies();
            loadCookies();
            addDebugLog('Cookie已刷新并保存');
        });
    }
    // 页面加载时自动加载保存的Cookies
    loadCookies();
    // 添加下载按钮事件
    const downloadCurrentBtn = document.getElementById('downloadCurrent');
    if (downloadCurrentBtn) {
        downloadCurrentBtn.addEventListener('click', () => {
            const format = document.getElementById('formatSelect').value;
            const songInfo = getSongInfo();
            if (songInfo.id) {
                downloadSong(songInfo, format);
            } else {
                addDebugLog('无法获取歌曲信息');
            }
        });
    }
    // 添加批量下载按钮事件
    const downloadAllBtn = document.getElementById('downloadAll');
    if (downloadAllBtn) {
        downloadAllBtn.addEventListener('click', async () => {
            // ... 原有的批量下载逻辑 ...
        });
    }
    let isDownloading = false;
    let downloadQueue = [];
    let currentDownloadIndex = 0;

    document.getElementById('downloadAll').addEventListener('click', async () => {
        if (!isListPage()) {
            addDebugLog('当前不是列表页面，无法批量下载');
            return;
        }

        if (isDownloading) {
            // 如果正在下载，则停止下载
            isDownloading = false;
            document.getElementById('downloadAll').textContent = '继续下载';
            addDebugLog('下载已暂停');
            return;
        }

        const format = document.getElementById('formatSelect').value;
        const songLinks = Array.from(document.querySelectorAll('a[href*="/song/"]'));
        if (songLinks.length === 0) {
            addDebugLog('未找到可下载的歌曲链接');
            return;
        }

        // 去重并过滤无效链接
        const uniqueSongs = new Map();
        songLinks.forEach(link => {
            const songId = extractSongId(link.href);
            // 如果是MP4格式，检查是否有MV标签
            if (format === 'mp4' && !hasMVTag(link)) {
                addDebugLog(`跳过：${link.textContent.trim()} - 不支持MP4格式（无MV标签）`);
                return;
            }
            if (songId && !uniqueSongs.has(songId)) {
                uniqueSongs.set(songId, {
                    title: link.textContent.trim(),
                    id: songId
                });
            }
        });

        const totalSongs = uniqueSongs.size;
        if (currentDownloadIndex === 0) {
            // 只有在新开始下载时才重置下载队列
            downloadQueue = Array.from(uniqueSongs.values());
            addDebugLog(`找到 ${totalSongs} 首不重复歌曲，开始批量下载...`);
        } else {
            addDebugLog(`继续下载剩余歌曲，进度：${currentDownloadIndex}/${totalSongs}`);
        }

        document.getElementById('downloadAll').textContent = '停止下载';
        isDownloading = true;

        while (currentDownloadIndex < downloadQueue.length && isDownloading) {
            const songInfo = downloadQueue[currentDownloadIndex];
            addDebugLog(`下载进度: ${currentDownloadIndex + 1}/${totalSongs} - ${songInfo.title}`);
            document.getElementById('downloadAll').textContent = `停止下载 (${currentDownloadIndex + 1}/${totalSongs})`;

            try {
                await new Promise((resolve, reject) => {
                    downloadSong(songInfo, format);
                    setTimeout(resolve, 2000); // 增加下载间隔，避免被限制
                });
            } catch (error) {
                addDebugLog(`下载失败: ${songInfo.title} - ${error.message}`);
            }

            currentDownloadIndex++;
        }

        if (currentDownloadIndex >= downloadQueue.length) {
            // 下载完成，重置状态
            isDownloading = false;
            currentDownloadIndex = 0;
            downloadQueue = [];
            document.getElementById('downloadAll').textContent = '批量下载全部';
            addDebugLog('批量下载任务已完成');
        } else if (!isDownloading) {
            // 下载被暂停
            document.getElementById('downloadAll').textContent = `继续下载 (${currentDownloadIndex}/${totalSongs})`;
        }
    });
})();