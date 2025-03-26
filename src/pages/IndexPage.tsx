
import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/home/AppHeader";
import SearchBar from "@/components/home/SearchBar";
import PopularCampsites from "@/components/home/PopularCampsites";
import RecentCampsites from "@/components/home/RecentCampsites";
import MonetizationSection from "@/components/home/MonetizationSection";
import TripPlannerButton from "@/components/home/TripPlannerButton";
import ProfileSummary from "@/components/home/ProfileSummary";

const IndexPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/map?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="bg-background min-h-screen">
      <AppHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar - Profile, Trip Planning, Popular Campsites */}
          <div className="lg:col-span-3 space-y-6">
            <ProfileSummary />
            <TripPlannerButton />
            <PopularCampsites />
          </div>

          {/* Center Column - Recent Campsites Feed */}
          <div className="lg:col-span-6">
            <SearchBar 
              searchQuery={searchQuery} 
              setSearchQuery={setSearchQuery} 
              handleSearch={handleSearch} 
            />
            <RecentCampsites />
          </div>

          {/* Right Sidebar - Monetization and Stats */}
          <div className="lg:col-span-3">
            <MonetizationSection />
          </div>
        </div>
      </main>
    </div>
  );
};

export default IndexPage;
