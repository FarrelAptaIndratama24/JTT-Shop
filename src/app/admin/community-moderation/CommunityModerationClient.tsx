'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Modal } from '@/components/ui/Modal';
import {
  getModerationItems,
  updateModerationStatus,
  deleteModerationItem,
} from '@/lib/actions/adminModerationActions';
import type { DbCommunityModeration, ModerationStatus } from '@/types/database';
import {
  Search,
  MessageSquare,
  FileText,
  Trash2,
  Eye,
  Calendar,
  User,
  CheckCircle2,
  XCircle,
  Flag,
  ShieldCheck,
  MessageCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';

type StatusFilter = ModerationStatus | 'all';

// ─── Status badge config ────────────────────────────────────────────────────

const STATUS_CONFIG: Record<ModerationStatus, { label: string; className: string }> = {
  pending: {
    label: 'Menunggu',
    className: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  },
  approved: {
    label: 'Disetujui',
    className: 'bg-green-500/10 text-green-500 border-green-500/20',
  },
  rejected: {
    label: 'Ditolak',
    className: 'bg-red-500/10 text-red-500 border-red-500/20',
  },
  reported: {
    label: 'Dilaporkan',
    className: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  },
};

const CONTENT_TYPE_CONFIG: Record<string, { label: string; icon: typeof FileText; className: string }> = {
  post: {
    label: 'Postingan',
    icon: FileText,
    className: 'bg-blue-500/10 text-blue-500',
  },
  comment: {
    label: 'Komentar',
    icon: MessageCircle,
    className: 'bg-violet-500/10 text-violet-500',
  },
};

export function CommunityModerationClient() {
  const [items, setItems] = useState<DbCommunityModeration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<DbCommunityModeration | null>(null);

  // ─── Fetch ────────────────────────────────────────────────────────────────

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getModerationItems(searchTerm || undefined, statusFilter);
      console.log('[CommunityModeration] fetch result:', { success: result.success, count: result.data?.length, error: result.error });
      if (result.success && result.data) {
        setItems(result.data);
      } else {
        toast.error(result.error || 'Gagal memuat data moderasi.');
      }
    } catch {
      toast.error('Gagal memuat data moderasi.');
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchItems();
    }, 300);
    return () => clearTimeout(debounce);
  }, [fetchItems]);

  // ─── Actions ──────────────────────────────────────────────────────────────

  const handleUpdateStatus = async (item: DbCommunityModeration, newStatus: ModerationStatus) => {
    setActionLoadingId(item.id);
    try {
      const result = await updateModerationStatus(item.id, newStatus);
      if (result.success) {
        setItems((prev) =>
          prev.map((m) => (m.id === item.id ? { ...m, status: newStatus, updated_at: new Date().toISOString() } : m))
        );
        if (selectedItem?.id === item.id) {
          setSelectedItem({ ...item, status: newStatus, updated_at: new Date().toISOString() });
        }
        const statusLabel = STATUS_CONFIG[newStatus].label;
        toast.success(`Status diperbarui menjadi "${statusLabel}".`);
      } else {
        toast.error(result.error || 'Gagal memperbarui status.');
      }
    } catch {
      toast.error('Gagal memperbarui status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus konten ini? Tindakan ini tidak dapat dibatalkan.')) {
      return;
    }
    setActionLoadingId(id);
    try {
      const result = await deleteModerationItem(id);
      if (result.success) {
        setItems((prev) => prev.filter((m) => m.id !== id));
        if (selectedItem?.id === id) setSelectedItem(null);
        toast.success('Konten berhasil dihapus.');
      } else {
        toast.error(result.error || 'Gagal menghapus konten.');
      }
    } catch {
      toast.error('Gagal menghapus konten.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleViewDetails = (item: DbCommunityModeration) => {
    setSelectedItem(item);
  };

  // ─── Helpers ──────────────────────────────────────────────────────────────

  const getUserDisplayName = (item: DbCommunityModeration): string => {
    return item.profiles?.full_name || item.profiles?.username || 'Anonim';
  };

  const getUserInitials = (item: DbCommunityModeration): string => {
    const name = getUserDisplayName(item);
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  // ─── Filter options ───────────────────────────────────────────────────────

  const statusFilterOptions: { label: string; value: StatusFilter }[] = [
    { label: 'Semua', value: 'all' },
    { label: 'Menunggu', value: 'pending' },
    { label: 'Disetujui', value: 'approved' },
    { label: 'Ditolak', value: 'rejected' },
    { label: 'Dilaporkan', value: 'reported' },
  ];

  const pendingCount = items.filter((m) => m.status === 'pending').length;

  return (
    <>
      <div className="space-y-6">
        {/* ─── Toolbar ─── */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                id="search-moderation"
                placeholder="Cari berdasarkan pengguna, judul, atau isi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {statusFilterOptions.map((opt) => (
                <Button
                  key={opt.value}
                  variant={statusFilter === opt.value ? 'default' : 'outline'}
                  size="sm"
                  className="rounded-full"
                  onClick={() => setStatusFilter(opt.value)}
                >
                  {opt.label}
                  {opt.value === 'pending' && pendingCount > 0 && (
                    <span className="ml-1.5 bg-white/20 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                      {pendingCount}
                    </span>
                  )}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Content Table ─── */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="Belum ada aktivitas komunitas"
            description={
              searchTerm || statusFilter !== 'all'
                ? 'Coba sesuaikan pencarian atau filter Anda.'
                : 'Postingan dan komentar komunitas akan muncul di sini.'
            }
          />
        ) : (
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-background/50">
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">
                      Pengguna
                    </th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">
                      Jenis
                    </th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">
                      Judul
                    </th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">
                      Status
                    </th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">
                      Tanggal
                    </th>
                    <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {items.map((item) => {
                    const isActionLoading = actionLoadingId === item.id;
                    const statusCfg = STATUS_CONFIG[item.status];
                    const typeCfg = CONTENT_TYPE_CONFIG[item.content_type] || CONTENT_TYPE_CONFIG.post;
                    const TypeIcon = typeCfg.icon;

                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-white/[0.02] transition-colors ${
                          item.status === 'pending' ? 'bg-primary/[0.02]' : ''
                        }`}
                      >
                        {/* Pengguna */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`h-9 w-9 shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${
                                item.status === 'pending'
                                  ? 'bg-primary/10 text-primary'
                                  : 'bg-muted/50 text-muted-foreground'
                              }`}
                            >
                              {getUserInitials(item)}
                            </div>
                            <span className={`text-sm ${item.status === 'pending' ? 'font-semibold' : 'font-medium'}`}>
                              {getUserDisplayName(item)}
                            </span>
                          </div>
                        </td>

                        {/* Jenis */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${typeCfg.className}`}>
                              <TypeIcon className="h-3.5 w-3.5" />
                            </div>
                            <span className="text-sm text-muted-foreground">{typeCfg.label}</span>
                          </div>
                        </td>

                        {/* Judul */}
                        <td className="px-6 py-4 max-w-[200px]">
                          <span className={`text-sm truncate block ${item.status === 'pending' ? 'font-semibold' : ''}`}>
                            {item.title || item.content.slice(0, 50) + (item.content.length > 50 ? '...' : '')}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusCfg.className}`}
                          >
                            {statusCfg.label}
                          </span>
                        </td>

                        {/* Tanggal */}
                        <td className="px-6 py-4">
                          <div className="text-sm text-muted-foreground">
                            <div>{format(new Date(item.created_at), 'dd MMM yyyy')}</div>
                            <div className="text-xs opacity-70">
                              {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                            </div>
                          </div>
                        </td>

                        {/* Aksi */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="rounded-full h-8 w-8 p-0"
                              onClick={() => handleViewDetails(item)}
                              title="Lihat Detail"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>

                            {item.status !== 'approved' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="rounded-full h-8 w-8 p-0 text-green-500 hover:text-green-400"
                                onClick={() => handleUpdateStatus(item, 'approved')}
                                disabled={isActionLoading}
                                title="Setujui"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                            )}

                            {item.status !== 'rejected' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="rounded-full h-8 w-8 p-0 text-amber-500 hover:text-amber-400"
                                onClick={() => handleUpdateStatus(item, 'rejected')}
                                disabled={isActionLoading}
                                title="Tolak"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            )}

                            {item.status !== 'reported' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="rounded-full h-8 w-8 p-0 text-orange-500 hover:text-orange-400"
                                onClick={() => handleUpdateStatus(item, 'reported')}
                                disabled={isActionLoading}
                                title="Tandai Dilaporkan"
                              >
                                <Flag className="h-4 w-4" />
                              </Button>
                            )}

                            <Button
                              variant="ghost"
                              size="sm"
                              className="rounded-full h-8 w-8 p-0 text-red-500 hover:text-red-400"
                              onClick={() => handleDelete(item.id)}
                              disabled={isActionLoading}
                              title="Hapus"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Layout */}
            <div className="md:hidden divide-y divide-border/50">
              {items.map((item) => {
                const isActionLoading = actionLoadingId === item.id;
                const statusCfg = STATUS_CONFIG[item.status];
                const typeCfg = CONTENT_TYPE_CONFIG[item.content_type] || CONTENT_TYPE_CONFIG.post;
                const TypeIcon = typeCfg.icon;

                return (
                  <div
                    key={item.id}
                    className={`p-4 ${item.status === 'pending' ? 'bg-primary/[0.02]' : ''}`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div
                        className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${
                          item.status === 'pending'
                            ? 'bg-primary/10 text-primary'
                            : 'bg-muted/50 text-muted-foreground'
                        }`}
                      >
                        {getUserInitials(item)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-sm ${item.status === 'pending' ? 'font-semibold' : 'font-medium'}`}>
                            {getUserDisplayName(item)}
                          </span>
                          <span
                            className={`inline-flex items-center px-2 py-0 rounded-full text-[10px] font-semibold border ${statusCfg.className}`}
                          >
                            {statusCfg.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <TypeIcon className="h-3 w-3" />
                          <span>{typeCfg.label}</span>
                        </div>
                      </div>
                    </div>

                    <p className={`text-sm mb-2 truncate ${item.status === 'pending' ? 'font-semibold' : ''}`}>
                      {item.title || item.content.slice(0, 60) + (item.content.length > 60 ? '...' : '')}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                      </span>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-full h-8 w-8 p-0"
                          onClick={() => handleViewDetails(item)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {item.status !== 'approved' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-full h-8 w-8 p-0 text-green-500"
                            onClick={() => handleUpdateStatus(item, 'approved')}
                            disabled={isActionLoading}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        )}
                        {item.status !== 'rejected' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-full h-8 w-8 p-0 text-amber-500"
                            onClick={() => handleUpdateStatus(item, 'rejected')}
                            disabled={isActionLoading}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                        {item.status !== 'reported' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-full h-8 w-8 p-0 text-orange-500"
                            onClick={() => handleUpdateStatus(item, 'reported')}
                            disabled={isActionLoading}
                          >
                            <Flag className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-full h-8 w-8 p-0 text-red-500"
                          onClick={() => handleDelete(item.id)}
                          disabled={isActionLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Results count */}
            <div className="px-6 py-3 border-t border-border/50 bg-background/30">
              <p className="text-xs text-muted-foreground">
                Menampilkan {items.length} konten{items.length !== 1 ? '' : ''}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ─── View Details Modal ─── */}
      <Modal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title="Detail Konten"
        className="max-w-2xl"
        footer={
          selectedItem ? (
            <div className="flex flex-wrap gap-2 w-full">
              {selectedItem.status !== 'approved' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => handleUpdateStatus(selectedItem, 'approved')}
                  disabled={actionLoadingId === selectedItem.id}
                >
                  <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Setujui
                </Button>
              )}
              {selectedItem.status !== 'rejected' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => handleUpdateStatus(selectedItem, 'rejected')}
                  disabled={actionLoadingId === selectedItem.id}
                >
                  <XCircle className="mr-1.5 h-3.5 w-3.5" /> Tolak
                </Button>
              )}
              <Button
                variant="destructive"
                size="sm"
                className="rounded-full ml-auto"
                onClick={() => handleDelete(selectedItem.id)}
                disabled={actionLoadingId === selectedItem.id}
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Hapus
              </Button>
            </div>
          ) : undefined
        }
      >
        {selectedItem && (
          <div className="space-y-5">
            {/* Info grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Nama Pengguna</p>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {getUserDisplayName(selectedItem)}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Jenis Konten</p>
                <div className="flex items-center gap-2">
                  {selectedItem.content_type === 'post' ? (
                    <FileText className="h-4 w-4 text-blue-500" />
                  ) : (
                    <MessageSquare className="h-4 w-4 text-violet-500" />
                  )}
                  <span className="text-sm">
                    {CONTENT_TYPE_CONFIG[selectedItem.content_type]?.label ?? selectedItem.content_type}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tanggal Dibuat</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {format(new Date(selectedItem.created_at), 'dd MMMM yyyy, HH:mm')}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status Saat Ini</p>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${STATUS_CONFIG[selectedItem.status].className}`}
                >
                  {STATUS_CONFIG[selectedItem.status].label}
                </span>
              </div>
            </div>

            {/* Judul */}
            {selectedItem.title && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Judul</p>
                <p className="text-sm font-semibold">{selectedItem.title}</p>
              </div>
            )}

            {/* Isi Lengkap */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Isi Lengkap</p>
              <div className="bg-background/50 rounded-xl p-4 border border-border/50">
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {selectedItem.content}
                </p>
              </div>
            </div>

            {/* Laporan */}
            {selectedItem.report_count > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Jumlah Laporan</p>
                <div className="flex items-center gap-2">
                  <Flag className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-semibold text-orange-500">
                    {selectedItem.report_count} laporan
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}
