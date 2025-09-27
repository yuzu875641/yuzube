import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import axios from 'axios';

export default function Home() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;

    try {
      const response = await axios.get(`/api/search?q=${encodeURIComponent(query)}`);
      setResults(response.data);
    } catch (error) {
      console.error('検索に失敗しました:', error);
      setResults([]);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <Head>
        <title>YuzuTube - 検索</title>
      </Head>
      <h1>YuzuTube</h1>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="動画やチャンネルを検索"
          style={{ width: '300px', padding: '10px', marginRight: '10px' }}
        />
        <button type="submit" style={{ padding: '10px' }}>検索</button>
      </form>

      <div style={{ marginTop: '20px' }}>
        {results.length > 0 ? (
          results.map((item) => (
            <div key={item.videoId || item.authorId} style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px' }}>
              {item.type === 'video' && (
                <div>
                  <Link href={`/watch?v=${item.videoId}`}>
                    <img src={item.videoThumbnails[0]?.url} alt={item.title} style={{ maxWidth: '200px', cursor: 'pointer' }} />
                  </Link>
                  <h3>
                    <Link href={`/watch?v=${item.videoId}`}>{item.title}</Link>
                  </h3>
                  <p>{item.author}</p>
                </div>
              )}
              {item.type === 'channel' && (
                <div>
                  <Link href={`/channel?id=${item.authorId}`}>
                    <h3>{item.author}</h3>
                  </Link>
                </div>
              )}
            </div>
          ))
        ) : (
          <p>検索結果がありません。</p>
        )}
      </div>
    </div>
  );
}
