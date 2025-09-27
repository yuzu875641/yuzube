import axios from 'axios';

const INVIDIOUS_INSTANCE_URL = 'https://raw.githubusercontent.com/yuzu875641/yuzube/refs/heads/main/invidious.txt';
let invidiousInstances = { search: [], channel: [] };

async function fetchInvidiousInstances() {
  if (invidiousInstances.search.length === 0) {
    try {
      const response = await axios.get(INVIDIOUS_INSTANCE_URL);
      invidiousInstances = response.data;
      console.log('Invidiousインスタンスリストを取得しました。');
    } catch (error) {
      console.error('Invidiousインスタンスリストの取得に失敗しました:', error.message);
    }
  }
}

function getRandomInstance(list) {
  if (!list || list.length === 0) {
    return null;
  }
  const randomIndex = Math.floor(Math.random() * list.length);
  return list[randomIndex];
}

export default async function handler(req, res) {
  await fetchInvidiousInstances();
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
    res.status(200).json(response.data);
  } catch (error) {
    console.error(`検索APIエラー: ${error.message}`);
    res.status(500).json({ error: '検索中にエラーが発生しました。' });
  }
}
