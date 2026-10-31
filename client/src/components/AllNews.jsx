import React, { useState, useEffect, useCallback } from "react";
import EverythingCard from "./EverythingCard";
import FeaturedNews from "./FeaturedNews";
import TrendingNews from "./TrendingNews";
import CategoryTabs from "./CategoryTabs";
import FilterBar from "./FilterBar";
import NewsGridSkeleton, { HeroSkeleton } from "./NewsSkeleton";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function AllNews() {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [sortOption, setSortOption] = useState("publishedAt");

  const pageSize = 12;

  const BASE_URL =
    import.meta.env.VITE_API_URL ||
    "https://news-aggregator-dusky.vercel.app";

  const getCountryCode = (country) => {
    if (!country) return "";

    if (typeof country === "object") {
      return String(
        country.code ||
        country.value ||
        country.countryCode ||
        ""
      )
        .trim()
        .toLowerCase();
    }

    return String(country).trim().toLowerCase();
  };

  const fetchNews = useCallback(
    async (signal) => {
      setIsLoading(true);
      setError(null);

      try {
        const countryCode = getCountryCode(selectedCountry);

        let url;

        if (countryCode) {
          const params = new URLSearchParams({
            page: String(page),
            pageSize: String(pageSize),
          });

          // Only add search if the user actually searched
          if (searchQuery.trim()) {
            params.set("q", searchQuery.trim());
          }

          // Add sorting if your backend supports it
          if (sortOption) {
            params.set("sortBy", sortOption);
          }

          url = `${BASE_URL}/country/${encodeURIComponent(
            countryCode
          )}?${params.toString()}`;
        } else {
          const params = new URLSearchParams({
            page: String(page),
            pageSize: String(pageSize),
            q: searchQuery.trim() || "world",
          });

          if (sortOption) {
            params.set("sortBy", sortOption);
          }

          url = `${BASE_URL}/all-news?${params.toString()}`;
        }

        const response = await fetch(url, { signal });

        let responseData = null;

        try {
          responseData = await response.json();
        } catch {
          throw new Error(
            `Server returned invalid JSON. HTTP ${response.status}`
          );
        }

        if (!response.ok) {
          console.error("News API error:", {
            status: response.status,
            statusText: response.statusText,
            response: responseData,
            url,
          });

          throw new Error(
            responseData?.message ||
            responseData?.error ||
            `Server error: HTTP ${response.status}`
          );
        }

        if (!responseData?.success) {
          throw new Error(
            responseData?.message ||
            "Unable to fetch news articles."
          );
        }

        const articles = responseData?.data?.articles || [];
        const results = responseData?.data?.totalResults || 0;

        setData(Array.isArray(articles) ? articles : []);
        setTotalResults(results);
      } catch (err) {
        // Ignore aborted requests
        if (err.name === "AbortError") {
          return;
        }

        console.error("Fetch news error:", err);

        setData([]);
        setTotalResults(0);

        setError(
          err.message ||
          "Unable to load headlines right now. Please try again."
        );
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [
      BASE_URL,
      page,
      pageSize,
      searchQuery,
      selectedCountry,
      sortOption,
    ]
  );

  useEffect(() => {
    const controller = new AbortController();

    fetchNews(controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchNews]);

  // Listen for dynamic logo home refresh event
  useEffect(() => {
    const handleHomeRefresh = () => {
      setSearchQuery("");
      setSelectedCountry("");
      setSortOption("publishedAt");
      setPage(1);
      window.scrollTo({ top: 0, behavior: "smooth" });

      const controller = new AbortController();
      fetchNews(controller.signal);
    };

    window.addEventListener("refresh-home-news", handleHomeRefresh);
    return () => {
      window.removeEventListener("refresh-home-news", handleHomeRefresh);
    };
  }, [fetchNews]);

  const handlePrev = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    const totalPages = Math.ceil(totalResults / pageSize);

    if (page < totalPages) {
      setPage((prev) => prev + 1);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCountry("");
    setSortOption("publishedAt");
    setPage(1);
  };

  const handleRetry = () => {
    const controller = new AbortController();
    fetchNews(controller.signal);
  };

  const heroArticle = data.length > 0 ? data[0] : null;

  const remainingArticles =
    data.length > 1 ? data.slice(1) : data;

  const hasActiveCountry = Boolean(
    getCountryCode(selectedCountry)
  );

  const totalPages = Math.max(
    1,
    Math.ceil(totalResults / pageSize)
  );

  return (
    <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 min-h-screen">
      {/* Category Pills */}
      <CategoryTabs />

      {/* Search and Filters */}
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={(value) => {
          setSearchQuery(value);
          setPage(1);
        }}
        selectedCountry={selectedCountry}
        onCountryChange={(value) => {
          setSelectedCountry(value);
          setPage(1);
        }}
        sortOption={sortOption}
        onSortChange={(value) => {
          setSortOption(value);
          setPage(1);
        }}
        onClearFilters={handleClearFilters}
      />

      {/* Error State */}
      {error && (
        <ErrorState
          error={error}
          onRetry={handleRetry}
        />
      )}

      {/* Main Content */}
      {!error && (
        <>
          {/* Featured Article */}
          {page === 1 &&
            !searchQuery &&
            !hasActiveCountry &&
            (isLoading ? (
              <HeroSkeleton />
            ) : (
              heroArticle && (
                <FeaturedNews article={heroArticle} />
              )
            ))}

          {/* Trending */}
          {page === 1 &&
            !searchQuery &&
            !hasActiveCountry &&
            data.length > 3 && (
              <TrendingNews
                articles={data.slice(1, 6)}
              />
            )}

          {/* Section Header */}
          <div className="flex items-center justify-between my-6 pb-2 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-serif-headline">
              {searchQuery
                ? `Results for "${searchQuery}"`
                : hasActiveCountry
                  ? `Headlines in ${getCountryCode(
                    selectedCountry
                  ).toUpperCase()}`
                  : "Latest News Stream"}
            </h2>

            {!isLoading && (
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {totalResults} Articles
              </span>
            )}
          </div>

          {/* Loading */}
          {isLoading ? (
            <NewsGridSkeleton count={pageSize} />
          ) : data.length === 0 ? (
            <EmptyState
              type={searchQuery ? "search" : "category"}
              onAction={handleClearFilters}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 animate-fade-in">
              {(
                page === 1 &&
                  !searchQuery &&
                  !hasActiveCountry
                  ? remainingArticles
                  : data
              ).map((element, index) => (
                <EverythingCard
                  key={element.url || `${element.title}-${index}`}
                  title={element.title}
                  description={element.description}
                  imgUrl={element.urlToImage}
                  publishedAt={element.publishedAt}
                  url={element.url}
                  author={element.author}
                  source={element.source}
                  category="World"
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!isLoading &&
            data.length > 0 &&
            totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-12 pt-6 border-t border-slate-200 dark:border-slate-800">
                <button
                  disabled={page <= 1}
                  onClick={handlePrev}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl glass-card text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none transition-all active:scale-95 shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                  Page {page} of {totalPages}
                </span>

                <button
                  disabled={page >= totalPages}
                  onClick={handleNext}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl glass-card text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none transition-all active:scale-95 shadow-sm"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
        </>
      )}
    </main>
  );
}