"use client";

import { useState } from "react";
import type { FlashcardResponse, Source } from "../../types";
import { useFlashcards } from "../../lib/hooks/useFlashcards";
import { FiltersAndSortingControls } from "./FiltersAndSortingControls";
import { FlashcardsList } from "./FlashcardsList";
import { PaginationControls } from "./PaginationControls";
import { AddFlashcardModal } from "./AddFlashcardModal";
import { EditFlashcardModal } from "./EditFlashcardModal";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Plus, CheckCircle2 } from "lucide-react";

interface Filters {
  source?: Source;
  generationId?: number;
}

interface Sorting {
  sortField: "created_at" | "updated_at";
  sortOrder: "asc" | "desc";
}

interface Notification {
  type: "success" | "error";
  message: string;
}

export function FlashcardsPage() {
  // State
  const [filters, setFilters] = useState<Filters>({});
  const [sorting, setSorting] = useState<Sorting>({
    sortField: "created_at",
    sortOrder: "desc",
  });
  const [page, setPage] = useState(1);
  const limit = 10;
  const [notification, setNotification] = useState<Notification | null>(null);

  // Fetch data
  const { data, pagination, loading, error, refetch } = useFlashcards({
    page,
    limit,
    ...filters,
    ...sorting,
  });

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedFlashcard, setSelectedFlashcard] = useState<FlashcardResponse | null>(null);

  // Handlers
  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  };

  const handleSortChange = (newSorting: Sorting) => {
    setSorting(newSorting);
    setPage(1); // Reset to first page when sorting changes
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleAddClick = () => {
    setIsAddModalOpen(true);
  };

  const handleEditClick = (flashcard: FlashcardResponse) => {
    setSelectedFlashcard(flashcard);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (flashcard: FlashcardResponse) => {
    setSelectedFlashcard(flashcard);
    setIsDeleteDialogOpen(true);
  };

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAddSuccess = () => {
    refetch();
    showNotification("success", "Flashcard created successfully");
  };

  const handleEditSuccess = () => {
    refetch();
    showNotification("success", "Flashcard updated successfully");
  };

  const handleDeleteSuccess = () => {
    refetch();
    showNotification("success", "Flashcard deleted successfully");
  };

  const totalPages = pagination ? Math.ceil(pagination.total / pagination.limit) : 1;

  return (
    <div className="space-y-6">
      {notification && (
        <Alert variant={notification.type === "success" ? "default" : "destructive"}>
          {notification.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <AlertDescription>{notification.message}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between items-center">
        <FiltersAndSortingControls
          currentFilters={filters}
          currentSorting={sorting}
          onFilterChange={handleFilterChange}
          onSortChange={handleSortChange}
        />
        <Button onClick={handleAddClick} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Flashcard
        </Button>
      </div>

      <FlashcardsList
        items={data || []}
        loading={loading}
        error={error}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
      />

      <div className="flex justify-center">
        <PaginationControls currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
      </div>

      <AddFlashcardModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
      />

      <EditFlashcardModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleEditSuccess}
        flashcard={selectedFlashcard}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onSuccess={handleDeleteSuccess}
        flashcard={selectedFlashcard}
      />
    </div>
  );
}
