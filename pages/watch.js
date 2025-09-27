import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import axios from 'axios';

export default function WatchPage() {
  const router = useRouter();
  const { v: videoId } = router.query;
  const [videoData, setVideoData] = useState(null);
  const [selectedUrl, setSelectedUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (videoId) {
      const fetchVideoData = async () => {
        setIsLoading(true);
        try {
          const response = await axios.get(`/api/watch?v=${videoId}`);
          setVideoData(response.data);
          const highestQuality = response.data.formats.find(f => f.format_id.includes('1080p') || f.format_id.includes('720p')) || response.data.formats[0];
          setSelectedUrl(highestQuality.url);
        } catch (error) {
          console.error('動画情報の取得に失敗しました:', error);
          setVideoData(null);
        } finally {
          setIsLoading(false);
        }
      };
      fetchVideoData();
    }
  }, [videoId]);

  if (isLoading) {
    return <div style={{ padding: '20px' }}>読み込み中...</div>;
  }

  if (!videoData) {
    return <div style={{ padding: '20px' }}>動画が見つかりませんでした。</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <Head>
        <title>{videoData.title} | YuzuTube</title>
      </Head>
      <h1>{videoData.title}</h1>
      <p>by {videoData.author}</p>

      <video controls width="100%" src={selectedUrl} key={selectedUrl} style={{ maxWidth: '800px' }}>
        お使いのブラウザは動画再生をサポートしていません。
      </video>

      <div style={{ marginTop: '10px' }}>
        <label>
          画質を選択:
          <select onChange={(e) => setSelectedUrl(e.target.value)} value={selectedUrl} style={{ marginLeft: '10px' }}>
            {videoData.formats.map((format) => (
              <option key={format.url} value={format.url}>
                {format.format_id}
              </option>
            ))}
          </select>
        </label>
      </div>

    </div>
  );
}
