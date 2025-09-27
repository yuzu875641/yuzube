const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const INVIDIOUS_INSTANCE_URL = 'https://raw.githubusercontent.com/yuzu875641/yuzube/refs/heads/main/invidious.txt';
const VKR_DOWNLOADER_API_KEY = process.env.VKR_DOWNLOADER_API_KEY;
const VKR_DOWNLOADER_BASE_URL = 'https://vkrdownloader.xyz/server/';

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

let invidiousInstances = { search: [], channel: [] };

async function fetchInvidiousInstances() {
    try {
        const response = await axios.get(INVIDIOUS_INSTANCE_URL);
        invidiousInstances = response.data;
        console.log('Invidiousインスタンスリストを取得しました。');
    } catch (error) {
        console.error('Invidiousインスタンスリストの取得に失敗しました:', error.message);
    }
}

function getRandomInstance(list) {
    if (!list || list.length === 0) {
        return null;
    }
    const randomIndex = Math.floor(Math.random() * list.length);
    return list[randomIndex];
}

app.get('/search', async (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.status(400).json({ error: '検索クエリ（q）が必要です。' });
    }

    const instance = getRandomInstance(invidiousInstances.search);
    if (!instance) {
        return res.status(503).json({ error: '利用可能な検索インスタンスがありません。' });
    }

    try {
        const response = await axios.get(`${instance}/api/v1/search?q=${encodeURIComponent(query)}`);
        res.json(response.data);
    } catch (error) {
        console.error(`検索APIエラー: ${error.message}`);
        res.status(500).json({ error: '検索中にエラーが発生しました。' });
    }
});

app.get('/watch', async (req, res) => {
    const videoId = req.query.v;
    if (!videoId) {
        return res.status(400).json({ error: '動画ID（v）が必要です。' });
    }

    const vkrUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const apiUrl = `${VKR_DOWNLOADER_BASE_URL}?api_key=${VKR_DOWNLOADER_API_KEY}&vkr=${encodeURIComponent(vkrUrl)}`;

    try {
        const response = await axios.get(apiUrl);
        const videoData = response.data.data;

        if (!videoData) {
            return res.status(404).json({ error: '動画情報が見つかりませんでした。' });
        }

        const availableFormats = videoData.downloads.map(download => ({
            format_id: download.format_id,
            url: download.url,
            size: download.size
        }));

        res.json({
            title: videoData.title,
            thumbnail: videoData.thumbnail,
            author: videoData.author,
            formats: availableFormats,
        });
    } catch (error) {
        console.error(`動画情報取得APIエラー: ${error.message}`);
        res.status(500).json({ error: '動画情報の取得中にエラーが発生しました。' });
    }
});

app.get('/channel', async (req, res) => {
    const channelId = req.query.id;
    if (!channelId) {
        return res.status(400).json({ error: 'チャンネルID（id）が必要です。' });
    }

    const instance = getRandomInstance(invidiousInstances.channel);
    if (!instance) {
        return res.status(503).json({ error: '利用可能なチャンネルインスタンスがありません。' });
    }

    try {
        const response = await axios.get(`${instance}/api/v1/channels/${channelId}`);
        res.json(response.data);
    } catch (error) {
        console.error(`チャンネルAPIエラー: ${error.message}`);
        res.status(500).json({ error: 'チャンネル情報の取得中にエラーが発生しました。' });
    }
});

fetchInvidiousInstances().then(() => {
    app.listen(PORT, () => {
        console.log(`サーバーがポート ${PORT} で起動しました`);
    });
});
