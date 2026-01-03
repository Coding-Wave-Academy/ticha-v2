import supabase from "../config/supabase.js";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// Educational keywords to append to searches
const EDUCATIONAL_KEYWORDS = "tutorial lecture course lesson explanation";

export const getRecommendations = async (req, res) => {
  try {
    const userId = req.user.userId;

    // 1. Get User Profile for context
    const { data: profile } = await supabase
      .from("student_profiles")
      .select("major, level")
      .eq("user_id", userId)
      .single();

    // 2. Get latest material
    const { data: materials } = await supabase
      .from("materials")
      .select("title, summary_data")
      .eq("student_id", userId)
      .order("created_at", { ascending: false })
      .limit(1);

    // 3. Construct Educational Query
    let query = "educational lecture course";
    if (req.query.q) {
      // Add educational context to user query
      query = `${req.query.q} ${EDUCATIONAL_KEYWORDS}`;
    } else if (materials && materials.length > 0) {
      query = `${materials[0].title} ${EDUCATIONAL_KEYWORDS}`;
    } else if (profile) {
      query = `${profile.major} ${profile.level} course ${EDUCATIONAL_KEYWORDS}`;
    }

    console.log(`Fetching educational videos for query: ${query}`);

    // 4. Call YouTube with educational filters
    if (!YOUTUBE_API_KEY) {
      // Mock result if no key, for development safety
      console.warn("No YOUTUBE_API_KEY provided. Returning Mock Data.");
      return res.json({
        query,
        videos: [
          {
            id: "dQw4w9WgXcQ",
            title: "Mock Video: API Key Missing",
            description:
              "Please add YOUTUBE_API_KEY to backend .env to fetch real videos.",
            thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
            channel: "System",
            publishedAt: new Date().toISOString(),
          },
        ],
      });
    }

    // Build YouTube API URL with educational filters
    const params = new URLSearchParams({
      part: "snippet",
      q: query,
      type: "video",
      maxResults: "20", // Get more to filter
      key: YOUTUBE_API_KEY,
      videoDuration: "medium", // Prefer medium-length educational content (4-20 min)
      relevanceLanguage: "en", // English content
      safeSearch: "strict", // Only safe content
      order: "relevance", // Most relevant first
    });

    const url = `https://www.googleapis.com/youtube/v3/search?${params}`;

    const ytRes = await fetch(url);
    const ytData = await ytRes.json();

    if (ytData.error) {
      console.error("YouTube API Error:", ytData.error);
      throw new Error(ytData.error.message || "YouTube API Error");
    }

    // 5. Filter for educational content
    const educationalKeywords = [
      "tutorial",
      "GCE O/L",
      "GCE A/L",
      "University Of Buea",
      "lecture",
      "course",
      "lesson",
      "explanation",
      "learn",
      "education",
      "teaching",
      "study",
      "university",
      "school",
      "professor",
      "instructor",
      "academy",
      "class",
      "demonstration",
      "guide",
      "howto",
    ];

    const videos = (ytData.items || [])
      .filter((item) => {
        const title = item.snippet.title.toLowerCase();
        const description = item.snippet.description.toLowerCase();
        const channel = item.snippet.channelTitle.toLowerCase();

        // Check if content contains educational keywords
        const hasEducationalKeyword = educationalKeywords.some(
          (keyword) =>
            title.includes(keyword) ||
            description.includes(keyword) ||
            channel.includes(keyword)
        );

        // Filter out music videos, entertainment, vlogs, etc.
        const nonEducationalKeywords = [
          "music video",
          "official video",
          "lyric",
          "vlog",
          "review",
          "unboxing",
          "reaction",
          "funny",
          "prank",
          "trailer",
          "gameplay",
        ];

        const isNonEducational = nonEducationalKeywords.some(
          (keyword) => title.includes(keyword) || description.includes(keyword)
        );

        return hasEducationalKeyword && !isNonEducational;
      })
      .slice(0, 10) // Limit to 10 educational videos
      .map((item) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.medium.url,
        channel: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
      }));

    res.json({ query, videos });
  } catch (error) {
    console.error("Video Fetch Error:", error);
    res.status(500).json({ error: error.message });
  }
};
