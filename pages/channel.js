import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import axios from 'axios';

export default function ChannelPage() {
  const router = useRouter();
  const { id: channelId } = router.query;
  const [channelData, setChannelData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (channelId) {
      const fetchChannelData = async () => {
        setIsLoading(true);
        try {
          const response = await axios.get(`/api/channel?id=${channelId}`);
          setChannelData(response.data);
        } catch (error) {
          console.error('チャンネル情報の取得に失敗しました:', error);
          setChannelData(null);
        } finally {
          setIsLoading(false);
        }
      };
      fetchChannelData();
    }
  }, [channelId]);

  if (isLoading) {
    return <div style={{ padding: '20px' }}>読み込み中...</div>;
  }

  if (!channelData) {
    return <div style={{ padding: '20px' }}>チャンネルが見つかりませんでした。</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <Head>
        <title>{channelData.author} | YuzuTube</title>
      </Head>
      <h1>{channelData.author}</h1>
      <p>{channelData.subCount} subscribers</p>
      
      {channelData.authorThumbnails && (
        <img src={channelData.authorThumbnails[0]?.url} alt={`${channelData.author}'s profile`} style={{ borderRadius: '50%', width: '100px', height: '100px' }} />
      )}
      
      {/* TODO: チャンネルの動画リストなどを表示する */}
    </div>
  );
}
