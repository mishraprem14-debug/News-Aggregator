require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { z } = require("zod");

const app = express();

// Trust reverse proxy for Vercel / serverless deployment (crucial for client IP resolution)
app.set("trust proxy", 1);

// HTTP Security Headers via Helmet
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);

// Payload size limits to mitigate DoS attacks
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Dynamic CORS Allowlist Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server) or in dev
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== "production") {
        return callback(null, true);
      }
      return callback(new Error("CORS policy restriction: Origin not allowed"), false);
    },
    methods: ["GET", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// General Rate Limiter (100 requests per 15 minutes per IP)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many requests. Please try again later."
    });
  }
});

// Strict Rate Limiter for News API Search/Fetch endpoints (30 requests per minute per IP)
const newsLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many request attempts. Please slow down and try again later."
    });
  }
});

app.use(generalLimiter);

// Supported Country Codes & Categories Allowlists
const SUPPORTED_COUNTRIES = [
  "ae", "ar", "at", "au", "be", "bg", "br", "ca", "ch", "cn", "co", "cu", "cz", "de", "eg",
  "fr", "gb", "gr", "hk", "hu", "id", "ie", "il", "in", "it", "jp", "kr", "lt", "lv", "ma",
  "mx", "my", "ng", "nl", "no", "nz", "ph", "pl", "pt", "ro", "rs", "ru", "sa", "se", "sg",
  "si", "sk", "th", "tr", "tw", "ua", "us", "ve", "za"
];

const SUPPORTED_CATEGORIES = [
  "business", "entertainment", "general", "health", "science", "sports", "technology", "politics"
];

// Zod Validation Schemas
const allNewsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12),
  q: z.string().trim().max(100).default("world"),
  sortBy: z.enum(["publishedAt", "relevance", "popularity"]).optional()
});

const topHeadlinesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12),
  category: z.string().trim().toLowerCase().refine((val) => SUPPORTED_CATEGORIES.includes(val), {
    message: "Invalid news category"
  }).default("general"),
  language: z.string().trim().length(2).default("en")
});

const countryParamsSchema = z.object({
  iso: z.string().trim().toLowerCase().refine((val) => SUPPORTED_COUNTRIES.includes(val), {
    message: "Invalid or unsupported country ISO code"
  })
});

// Configure Axios Client with Request Timeout (10 seconds)
const axiosClient = axios.create({
  timeout: 10000,
  headers: {
    "User-Agent": "NewsAggregatorBackend/1.0"
  }
});

async function fetchFromNewsApi(endpoint, params) {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("[Server Error] Missing process.env.API_KEY environment variable");
    return {
      status: 500,
      success: false,
      message: "Server configuration error: News API Key missing."
    };
  }

  try {
    const response = await axiosClient.get(`https://newsapi.org/v2/${endpoint}`, {
      params: {
        ...params,
        apiKey
      }
    });

    return {
      status: 200,
      success: true,
      message: "Successfully fetched data",
      data: response.data
    };
  } catch (error) {
    if (error.code === "ECONNABORTED") {
      console.error(`[NewsAPI Timeout] Endpoint ${endpoint} timed out after 10s`);
      return {
        status: 504,
        success: false,
        message: "News service timed out. Please try again later."
      };
    }

    const statusCode = error.response?.status || 500;
    console.error(`[NewsAPI Error] ${endpoint} status ${statusCode}:`, error.message);

    return {
      status: statusCode >= 500 ? 502 : 400,
      success: false,
      message: "Unable to retrieve news articles at this time."
    };
  }
}

// Health Check Endpoint for Deployment Monitoring
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "news-aggregator-backend",
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.get("/all-news", newsLimiter, async (req, res, next) => {
  try {
    const query = allNewsQuerySchema.parse(req.query);
    const result = await fetchFromNewsApi("everything", {
      q: query.q,
      page: query.page,
      pageSize: query.pageSize,
      ...(query.sortBy ? { sortBy: query.sortBy } : {})
    });
    res.status(result.status).json(result);
  } catch (err) {
    next(err);
  }
});

app.get("/top-headlines", newsLimiter, async (req, res, next) => {
  try {
    const query = topHeadlinesQuerySchema.parse(req.query);
    const newsApiCategory = query.category === "politics" ? "general" : query.category;
    const result = await fetchFromNewsApi("top-headlines", {
      category: newsApiCategory,
      language: query.language,
      page: query.page,
      pageSize: query.pageSize,
      ...(query.category === "politics" ? { q: "politics" } : {})
    });
    res.status(result.status).json(result);
  } catch (err) {
    next(err);
  }
});

app.get("/country/:iso", newsLimiter, async (req, res, next) => {
  try {
    const params = countryParamsSchema.parse(req.params);
    const query = allNewsQuerySchema.pick({ page: true, pageSize: true, q: true }).parse(req.query);

    const apiParams = {
      country: params.iso,
      page: query.page,
      pageSize: query.pageSize
    };

    if (req.query.q && typeof req.query.q === "string" && req.query.q.trim()) {
      apiParams.q = req.query.q.trim().slice(0, 100);
    }

    const result = await fetchFromNewsApi("top-headlines", apiParams);
    res.status(result.status).json(result);
  } catch (err) {
    next(err);
  }
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  if (err instanceof z.ZodError) {
    return res.status(400).json({
      success: false,
      message: "Invalid request parameters",
      errors: err.errors.map((e) => ({ field: e.path.join("."), message: e.message }))
    });
  }

  if (err.message && err.message.includes("CORS")) {
    return res.status(403).json({
      success: false,
      message: "CORS Forbidden: Origin not allowed"
    });
  }

  console.error("[Unhandled Server Error]:", err);
  res.status(500).json({
    success: false,
    message: "An internal server error occurred."
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running securely on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
});
