import { useState, useEffect } from "react";
import "../styles/video.css";
import "../styles/variables.css";
import BottomNav from "../components/BottomNav";
import { apiFetch } from "../utils/api";
import MobileOnly from "../components/MobileOnly";

export default function VideoLibrary() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVideo, setSelectedVideo] = useState(null);

  const fetchVideos = async (q = "") => {
    setLoading(true);
    try {
      const url = q
        ? `/api/videos/recommendations?q=${encodeURIComponent(q)}`
        : "/api/videos/recommendations";
      const data = await apiFetch(url);
      setVideos(data.videos || []);
      if (data.query && !q) setQuery(data.query);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) fetchVideos(searchQuery);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleVideoClick = (video) => {
    setSelectedVideo(video);
  };

  const closeVideoPlayer = () => {
    setSelectedVideo(null);
  };

  return (
    <MobileOnly>
      <div className="video-screen">
        <div className="video-header">
          <h1 className="title" style={{ marginTop: 0 }}>
            VIDEO LESSONS
          </h1>
          <p style={{ fontSize: 14, marginBottom: 20 }}>
            {query ? (
              <span>
                Curated for: <strong>{query}</strong>
              </span>
            ) : (
              "Search for educational videos"
            )}
          </p>

          <div className="search-bar-container">
            <input
              className="search-input"
              placeholder="Topic, subject, or question..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <button className="search-btn" onClick={handleSearch}>
              🔍
            </button>
          </div>
        </div>

        <div className="video-grid">
          {loading && (
            <div style={{ textAlign: "center", padding: 40 }}>
              <div className="spinner" style={{ marginBottom: 10 }}></div>
              <div style={{ fontWeight: "bold" }}>Finding best videos...</div>
            </div>
          )}

          {!loading && videos.length === 0 && (
            <div style={{ textAlign: "center", padding: 20 }}>
              No videos found. Try a different search!
            </div>
          )}

          {!loading &&
            videos.map((v) => (
              <div
                key={v.id}
                className="video-card"
                onClick={() => handleVideoClick(v)}
              >
                <div style={{ position: "relative" }}>
                  <img
                    src={v.thumbnail}
                    alt={v.title}
                    className="video-thumb"
                  />
                  <div className="video-play-overlay">▶</div>
                </div>
                <div className="video-info">
                  <h3
                    className="video-title"
                    dangerouslySetInnerHTML={{ __html: v.title }}
                  ></h3>
                  <div className="video-meta">
                    <span>{v.channel}</span> •{" "}
                    <span>
                      {v.publishedAt
                        ? new Date(v.publishedAt).getFullYear()
                        : ""}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: 12,
                      marginTop: 8,
                      color: "#444",
                      height: "2.4em",
                      overflow: "hidden",
                    }}
                  >
                    {v.description}
                  </p>
                </div>
              </div>
            ))}
        </div>

        {/* In-app Video Player Modal */}
        {selectedVideo && (
          <div className="video-player-modal" onClick={closeVideoPlayer}>
            <div
              className="video-player-container"
              onClick={(e) => e.stopPropagation()}
            >
              <button className="video-close-btn" onClick={closeVideoPlayer}>
                ✕
              </button>
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1`}
                title={selectedVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        )}

        <BottomNav />
      </div>
    </MobileOnly>
  );
}
