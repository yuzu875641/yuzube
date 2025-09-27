import axios from 'axios';

const INVIDIOUS_INSTANCE_URL = 'https://raw.githubusercontent.com/yuzu875641/yuzube/refs/heads/main/invidious.txt';
let invidiousInstances = { search: [], channel: [] };

async function fetchInvidiousInstances() {
  if (invidiousInstances.channel.length === 0) {
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
    res.status(200).json(response.data);
  } catch (error) {
    console.error(`チャンネルAPIエラー: ${error.message}`);
    res.status(500).json({ error: 'チャンネル情報の取得中にエラーが発生しました。' });
  }
}
