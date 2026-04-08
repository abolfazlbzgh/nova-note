'use client';

import {useQuery, useQueryClient} from '@tanstack/react-query';
import {apiClient} from '@/libs/api-client';
import {Plus, Sparkles, FileText, Trash2} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import {useModal} from '@/context/ModalContext';
import {useToast, ToastType} from '@/context/ToastContext';
import {deleteImageFromStorage} from '@/libs/image-utils';

interface DashboardData {
  stats: {
    notesUsed: number;
    maxNotes: number;
    remainingNotes: number;
    aiUsesUsed: number;
    maxAiUses: number;
    remainingAiUses: number;
  };
  notes: Array<{
    id: string;
    imageUrl: string;
    draftText: string;
    enhancedText: string;
    createdAt: string;
  }>;
}

export default function DashboardOverviewPage() {
  const queryClient = useQueryClient();
  const {showModal, hideModal} = useModal();
  const {addToast} = useToast();

  const {data, isLoading, isError} = useQuery({
    queryKey: ['dashboardData'],
    queryFn: () => apiClient.get<DashboardData>('/api/notes'),
  });

  const handleDelete = (id: string, imageUrl: string) => {
    showModal({
      title: 'Delete Entry',
      body: 'Are you sure you want to delete this entry? This action cannot be undone and the image will be permanently removed.',
      type: 'error',
      actions: [
        {
          label: 'Delete',
          className: 'btn-error text-white',
          onClick: async () => {
            try {
              await apiClient.delete(`/api/notes?id=${id}`);
              await deleteImageFromStorage(imageUrl);
              queryClient.invalidateQueries({queryKey: ['dashboardData']});
              addToast('Entry deleted successfully.', ToastType.SUCCESS);
            } catch (error) {
              addToast('Failed to delete the entry.', ToastType.ERROR);
            } finally {
              hideModal();
            }
          },
        },
        {
          label: 'Cancel',
          className: 'btn-ghost',
          onClick: hideModal,
        },
      ],
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="alert alert-error">
        <span>Failed to load dashboard data. Please refresh the page.</span>
      </div>
    );
  }

  const {stats, notes} = data;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-2 sm:gap-8 sm:p-0">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Dashboard</h1>
          <p className="text-base-content/60 mt-1 text-sm sm:text-base">Overview of your activity and limits.</p>
        </div>
        <Link href="/dashboard/new-note" className="btn btn-primary w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          Create New Entry
        </Link>
      </div>

      <div className="stats stats-vertical sm:stats-horizontal bg-base-100 border-base-200 w-full border shadow-sm">
        <div className="stat px-4 py-4 sm:px-6">
          <div className="stat-figure text-primary hidden sm:block">
            <FileText className="h-8 w-8" />
          </div>
          <div className="stat-title text-xs sm:text-sm">Remaining Notes</div>
          <div className="stat-value text-primary text-2xl sm:text-4xl">{stats.remainingNotes}</div>
          <div className="stat-desc mt-1 text-xs">
            {stats.notesUsed} of {stats.maxNotes} used
          </div>
        </div>

        <div className="stat px-4 py-4 sm:px-6">
          <div className="stat-figure text-secondary hidden sm:block">
            <Sparkles className="h-8 w-8" />
          </div>
          <div className="stat-title text-xs sm:text-sm">Remaining AI Enhancements</div>
          <div className="stat-value text-secondary text-2xl sm:text-4xl">{stats.remainingAiUses}</div>
          <div className="stat-desc mt-1 text-xs">
            {stats.aiUsesUsed} of {stats.maxAiUses} used
          </div>
        </div>
      </div>

      <div className="mt-2 flex flex-col gap-4">
        <h2 className="text-lg font-bold sm:text-xl">Your Entries</h2>

        {notes.length === 0 ? (
          <div className="bg-base-100 border-base-200 flex flex-col items-center justify-center rounded-xl border px-4 py-12 text-center shadow-sm sm:py-16">
            <FileText className="text-base-content/20 mb-4 h-10 w-10 sm:h-12 sm:w-12" />
            <h3 className="text-base font-bold sm:text-lg">No entries yet</h3>
            <p className="text-base-content/60 mt-2 max-w-xs text-sm sm:max-w-sm">
              You haven&apos;t created any notes. Click the button above to start capturing your thoughts.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {notes.map((note) => (
              <div
                key={note.id}
                className="card bg-base-100 border-base-200 overflow-hidden border shadow-sm transition-shadow hover:shadow-md"
              >
                <figure className="bg-base-200 group relative aspect-[3/4] w-full">
                  <Image src={note.imageUrl} alt="Note image" fill className="object-cover" />
                  <button
                    onClick={() => handleDelete(note.id, note.imageUrl)}
                    className="btn btn-sm btn-circle btn-error absolute top-2 right-2 opacity-90 transition-opacity hover:opacity-100 sm:top-3 sm:right-3"
                  >
                    <Trash2 className="h-4 w-4 text-white" />
                  </button>
                </figure>
                <div className="card-body p-4 sm:p-5">
                  <div className="text-base-content/50 text-[10px] font-medium sm:text-xs">
                    {new Date(note.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                  {note.enhancedText ? (
                    <p className="text-base-content text-sm leading-relaxed whitespace-pre-wrap">{note.enhancedText}</p>
                  ) : (
                    <p className="text-base-content/70 text-sm leading-relaxed whitespace-pre-wrap italic">
                      {note.draftText}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
