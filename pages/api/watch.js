import axios from 'axios';

const VKR_DOWNLOADER_API_KEY = 'vkrdownloader';
const VKR_DOWNLOADER_BASE_URL = 'https://vkrdownloader.xyz/server/';

export default async function handler(req, res) {
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

    res.status(200).json({
      title: videoData.title,
      thumbnail: videoData.thumbnail,
      author: videoData.author,
      formats: availableFormats,
    });
  } catch (error) {
    console.error(`動画情報取得APIエラー: ${error.message}`);
    res.status(500).json({ error: '動画情報の取得中にエラーが発生しました。' });
  }
}
