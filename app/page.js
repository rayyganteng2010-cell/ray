// app/page.js
'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Home() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [detailData, setDetailData] = useState(null);
  const [view, setView] = useState('home');

  const fetchHome = async (pageNum = 1) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/scrape?type=home&page=${pageNum}`);
      setData(res.data);
      setView('home');
      setDetailData(null);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGenre = async (genre, pageNum = 1) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/scrape?genre=${genre}&page=${pageNum}`);
      setData(res.data);
      setView('genre');
      setSelectedGenre(genre);
      setDetailData(null);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDetail = async (url) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/scrape?url=${encodeURIComponent(url)}`);
      setDetailData(res.data);
      setView('detail');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHome();
  }, []);

  const renderHome = () => (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Nekopoi Scraper</h1>
      
      {/* Genre List */}
      {data?.data?.genres && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Genres</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => fetchHome(1)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Home
            </button>
            {data.data.genres.map((genre, idx) => (
              <button
                key={idx}
                onClick={() => fetchGenre(genre.slug)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                {genre.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {data?.data?.items?.map((item, idx) => (
          <div
            key={idx}
            className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition"
            onClick={() => fetchDetail(item.link)}
          >
            <img
              src={item.thumbnail}
              alt={item.title}
              className="w-full h-48 object-cover"
              onError={(e) => e.target.src = '/placeholder.jpg'}
            />
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2 line-clamp-2">{item.title}</h3>
              <div className="flex flex-wrap gap-1">
                {item.genres?.slice(0, 3).map((genre, gIdx) => (
                  <span key={gIdx} className="px-2 py-1 bg-gray-100 text-xs rounded">
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {data?.data?.pagination && (
        <div className="flex justify-center mt-8 gap-2">
          <button
            onClick={() => {
              const newPage = page > 1 ? page - 1 : 1;
              setPage(newPage);
              if (view === 'home') fetchHome(newPage);
              if (view === 'genre') fetchGenre(selectedGenre, newPage);
            }}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">Page {page}</span>
          <button
            onClick={() => {
              const newPage = page + 1;
              setPage(newPage);
              if (view === 'home') fetchHome(newPage);
              if (view === 'genre') fetchGenre(selectedGenre, newPage);
            }}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );

  const renderDetail = () => (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => {
          if (view === 'detail' && data) {
            if (selectedGenre) fetchGenre(selectedGenre, page);
            else fetchHome(page);
          }
        }}
        className="mb-6 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
      >
        ← Back
      </button>

      {detailData?.data && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Title and Thumbnail */}
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <img
              src={detailData.data.thumbnail}
              alt={detailData.data.title}
              className="w-full md:w-1/3 rounded-lg"
              onError={(e) => e.target.src = '/placeholder.jpg'}
            />
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-4">{detailData.data.title}</h1>
              
              {/* Genres */}
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Genres:</h3>
                <div className="flex flex-wrap gap-2">
                  {detailData.data.genres?.map((genre, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {genre}
                    </span>
                  ))}
                </div>
              </div>

              {/* Stream Players */}
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Stream Players:</h3>
                <div className="space-y-3">
                  {detailData.data.streams?.map((stream, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded">
                      <p className="font-medium">{stream.player}</p>
                      <a
                        href={stream.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm break-all"
                      >
                        {stream.url}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Downloads */}
          {detailData.data.downloads?.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Download Links</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {detailData.data.downloads.map((dl, idx) => (
                  <a
                    key={idx}
                    href={dl.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-green-50 border border-green-200 rounded hover:bg-green-100"
                  >
                    <span className="font-medium">{dl.quality}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Episodes */}
          {detailData.data.episodes?.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Episode List</h3>
              <div className="space-y-2">
                {detailData.data.episodes.map((ep, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-gray-50 rounded flex justify-between items-center"
                  >
                    <span>{ep.title}</span>
                    <span className="text-sm text-gray-500">{ep.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Posts */}
          {detailData.data.related?.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Related Posts</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {detailData.data.related.map((rel, idx) => (
                  <div
                    key={idx}
                    className="cursor-pointer"
                    onClick={() => fetchDetail(rel.link)}
                  >
                    <img
                      src={rel.thumbnail}
                      alt={rel.title}
                      className="w-full h-32 object-cover rounded mb-2"
                      onError={(e) => e.target.src = '/placeholder.jpg'}
                    />
                    <p className="text-sm line-clamp-2">{rel.title}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {view === 'detail' ? renderDetail() : renderHome()}
    </div>
  );
    }
