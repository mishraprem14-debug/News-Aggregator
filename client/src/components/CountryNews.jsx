import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import EverythingCard from "./EverythingCard";
import CategoryTabs from "./CategoryTabs";
import FilterBar from "./FilterBar";
import NewsGridSkeleton from "./NewsSkeleton";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";
import countries from "./countries";
import { ChevronLeft, ChevronRight, Globe } from "lucide-react";

export default function CountryNews() {
  const params = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("publishedAt");

  const pageSize = 12;
  const BASE_URL = import.meta.env.VITE_API_URL || "https://news-aggregator-dusky.vercel.app";

  const isoCode = (params.iso || "us").toLowerCase();
  const countryObj = countries.find((c) => c.iso_2_alpha.toLowerCase() === isoCode);
  const countryName = countryObj ? countryObj.countryName : isoCode.toUpperCase();

  const fetchCountryHeadlines = () => {
    setIsLoading(true);
    setError(null);

    const url = `${BASE_URL}/country/${isoCode}?page=${page}&pageSize=${pageSize}`;

    fetch(url)
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error("Failed to connect to the news server");
      })
      .then((myJson) => {
        if (myJson.success) {
          setTotalResults(myJson.data.totalResults || 0);
          setData(myJson.data.articles || []);
        } else {
          setError(myJson.message || "An error occurred fetching regional news");
        }
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setError("Unable to retrieve regional headlines. Please try again later.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchCountryHeadlines();
  }, [page, params.iso]);

  const handlePrev = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNext = () => {
    if (page < Math.ceil(totalResults / pageSize)) setPage(page + 1);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSortOption("publishedAt");
    setPage(1);
  };

  const filteredArticles = data.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (item.title && item.title.toLowerCase().includes(q)) ||
      (item.description && item.description.toLowerCase().includes(q)) ||
      (item.source && typeof item.source === "object" ? item.source.name.toLowerCase().includes(q) : String(item.source).toLowerCase().includes(q))
    );
  });

  return (
    <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 min-h-screen">
      <CategoryTabs />

      {/* Title Header with Country Flag */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 my-6 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-4">
          {countryObj?.png && (
            <img
              src={countryObj.png}
              alt={countryName}
              className="w-10 h-7 object-cover rounded-md shadow-sm border border-slate-200 dark:border-slate-700"
            />
          )}
          <div>
            <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-0.5">
              <Globe className="w-3.5 h-3.5" />
              Regional Edition
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-serif-headline">
              {countryName} News
            </h1>
          </div>
        </div>

        {!isLoading && (
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {totalResults} Regional Updates
          </span>
        )}
      </div>

      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCountry={isoCode}
        onCountryChange={(val) => {
          if (val) navigate(`/country/${val}`);
        }}
        sortOption={sortOption}
        onSortChange={setSortOption}
        onClearFilters={handleClearFilters}
      />

      {error && <ErrorState error={error} onRetry={fetchCountryHeadlines} />}

      {!error && (
        <>
          {isLoading ? (
            <NewsGridSkeleton count={pageSize} />
          ) : filteredArticles.length === 0 ? (
            <EmptyState type="category" onAction={handleClearFilters} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 animate-fade-in">
              {filteredArticles.map((element, index) => (
                <EverythingCard
                  key={element.url || index}
                  title={element.title}
                  description={element.description}
                  imgUrl={element.urlToImage}
                  publishedAt={element.publishedAt}
                  url={element.url}
                  author={element.author}
                  source={element.source}
                  category={isoCode.toUpperCase()}
                />
              ))}
            </div>
          )}

          {!isLoading && filteredArticles.length > 0 && Math.ceil(totalResults / pageSize) > 1 && (
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
                Page {page} of {Math.ceil(totalResults / pageSize)}
              </span>

              <button
                disabled={page >= Math.ceil(totalResults / pageSize)}
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
