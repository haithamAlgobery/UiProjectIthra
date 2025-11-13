// app/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { ContentFeed } from "@/components/content-feed";
import { FloatingActionButton } from "@/components/floating-action-button";
import { PostModal } from "@/components/post-modal";
import { fetchCategories } from "@/src/features/category";
import { fetchSortOptions } from "@/src/features/options";
import { fetchContentTypes } from "@/src/features/typecontent";
import { useState, useEffect } from "react";
import type { AppDispatch } from "@/src/store/store";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/src/store/store";
import { createContent } from "@/src/features/content";
import { useLoading } from "./providers/LoadingProvider";
import useAuth from "@/src/hooks/useAuth";
export default function HomePage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const { setLoading } = useLoading();
    const dispatch = useDispatch<AppDispatch>();
  const filters = useSelector((state: RootState) => state.filters);
const {isAuth}=useAuth();
  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchSortOptions());
    dispatch(fetchContentTypes());
  
  }, [dispatch]);

  const toggleSidebar = () => setIsSidebarOpen((s) => !s);
  const handleCreatePost = () => setIsPostModalOpen(true);
  const handleCreateResearch = () => {setLoading(true); router.push("/research/create")};

  const handlePostSubmit = async (data: {
    title: string
    details: string
    categoryId: string
    tags: string[]
    file?: File
    typeCode?: string
    description?: string
  }) => {
    try {
      await dispatch(createContent(data)).unwrap();
    } catch (err) {
      throw err;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} onCategorySelect={() => {}} selectedCategory={filters.categoryId} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar onToggleSidebar={toggleSidebar} onSortChange={() => {}} onTypeFilter={() => {}} currentSort={filters.sort} currentType={filters.type}/>
        
        <main className="flex-1 overflow-auto">
          <div style={{ marginTop: "60px" }} className="max-w-2xl mx-auto p-4">
            <ContentFeed categoryId={filters.categoryId} type={filters.type} sort={filters.sort} userName="" search={filters.search}/>
          </div>
        </main>
      </div>

      {isAuth &&<FloatingActionButton onCreatePost={handleCreatePost} onCreateResearch={handleCreateResearch} />}
      <PostModal isOpen={isPostModalOpen} onClose={() => setIsPostModalOpen(false)} onSubmit={handlePostSubmit} />

      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsSidebarOpen(false)} />}
    </div>
  );
}
