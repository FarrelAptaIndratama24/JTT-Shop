'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Modal } from '@/components/ui/Modal';
import {
  getContactMessages,
  updateMessageStatus,
  deleteContactMessage,
} from '@/lib/actions/adminContactActions';
import type { DbContactMessage, ContactMessageStatus } from '@/types/database';
import {
  Search,
  Inbox,
  Mail,
  MailOpen,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  User,
  Reply,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';

type StatusFilter = ContactMessageStatus | 'all';

// ─── Status badge config ────────────────────────────────────────────────────

const STATUS_CONFIG: Record<ContactMessageStatus, { label: string; className: string }> = {
  unread: {
    label: 'New',
    className: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  },
  read: {
    label: 'Read',
    className: 'bg-green-500/10 text-green-500 border-green-500/20',
  },
  replied: {
    label: 'Replied',
    className: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  },
};

export function ContactMessagesClient() {
  const [messages, setMessages] = useState<DbContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<DbContactMessage | null>(null);

  // ─── Fetch ────────────────────────────────────────────────────────────────

  const fetchMessages = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getContactMessages(searchTerm || undefined, statusFilter);
      if (result.success && result.data) {
        setMessages(result.data);
      } else {
        toast.error(result.error || 'Failed to fetch messages.');
      }
    } catch {
      toast.error('Failed to fetch messages.');
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchMessages();
    }, 300);
    return () => clearTimeout(debounce);
  }, [fetchMessages]);

  // ─── Actions ──────────────────────────────────────────────────────────────

  const handleMarkAsRead = async (msg: DbContactMessage) => {
    setActionLoadingId(msg.id);
    try {
      const result = await updateMessageStatus(msg.id, 'read');
      if (result.success) {
        setMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, status: 'read' as ContactMessageStatus } : m))
        );
        if (selectedMessage?.id === msg.id) {
          setSelectedMessage({ ...msg, status: 'read' });
        }
        toast.success('Message marked as read.');
      } else {
        toast.error(result.error || 'Failed to update status.');
      }
    } catch {
      toast.error('Failed to update status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message? This action cannot be undone.')) {
      return;
    }
    setActionLoadingId(id);
    try {
      const result = await deleteContactMessage(id);
      if (result.success) {
        setMessages((prev) => prev.filter((m) => m.id !== id));
        if (selectedMessage?.id === id) setSelectedMessage(null);
        toast.success('Message deleted successfully.');
      } else {
        toast.error(result.error || 'Failed to delete message.');
      }
    } catch {
      toast.error('Failed to delete message.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleViewDetails = (msg: DbContactMessage) => {
    setSelectedMessage(msg);
    // Auto-mark as read when viewing
    if (msg.status === 'unread') {
      handleMarkAsRead(msg);
    }
  };

  // ─── Filter options ───────────────────────────────────────────────────────

  const statusFilterOptions: { label: string; value: StatusFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'New', value: 'unread' },
    { label: 'Read', value: 'read' },
    { label: 'Replied', value: 'replied' },
  ];

  const unreadCount = messages.filter((m) => m.status === 'unread').length;

  return (
    <>
      <div className="space-y-6">
        {/* ─── Toolbar ─── */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                id="search-messages"
                placeholder="Search by email or subject..."
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
                  {opt.value === 'unread' && unreadCount > 0 && (
                    <span className="ml-1.5 bg-white/20 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Messages Table ─── */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : messages.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No messages found"
            description={
              searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'No contact messages have been received yet.'
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
                      Sender
                    </th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">
                      Email
                    </th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">
                      Subject
                    </th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">
                      Status
                    </th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">
                      Date
                    </th>
                    <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {messages.map((msg) => {
                    const isActionLoading = actionLoadingId === msg.id;
                    const statusCfg = STATUS_CONFIG[msg.status];

                    return (
                      <tr
                        key={msg.id}
                        className={`hover:bg-white/[0.02] transition-colors ${
                          msg.status === 'unread' ? 'bg-primary/[0.02]' : ''
                        }`}
                      >
                        {/* Sender */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`h-9 w-9 shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${
                                msg.status === 'unread'
                                  ? 'bg-primary/10 text-primary'
                                  : 'bg-muted/50 text-muted-foreground'
                              }`}
                            >
                              {msg.first_name[0]}{msg.last_name[0]}
                            </div>
                            <span className={`text-sm ${msg.status === 'unread' ? 'font-semibold' : 'font-medium'}`}>
                              {msg.first_name} {msg.last_name}
                            </span>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-6 py-4">
                          <span className="text-sm text-muted-foreground">{msg.email}</span>
                        </td>

                        {/* Subject */}
                        <td className="px-6 py-4 max-w-[200px]">
                          <span className={`text-sm truncate block ${msg.status === 'unread' ? 'font-semibold' : ''}`}>
                            {msg.subject}
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

                        {/* Date */}
                        <td className="px-6 py-4">
                          <div className="text-sm text-muted-foreground">
                            <div>{format(new Date(msg.created_at), 'dd MMM yyyy')}</div>
                            <div className="text-xs opacity-70">
                              {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                            </div>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="rounded-full h-8 w-8 p-0"
                              onClick={() => handleViewDetails(msg)}
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>

                            {msg.status === 'unread' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="rounded-full h-8 w-8 p-0 text-green-500 hover:text-green-400"
                                onClick={() => handleMarkAsRead(msg)}
                                disabled={isActionLoading}
                                title="Mark as Read"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                            )}

                            <Button
                              variant="ghost"
                              size="sm"
                              className="rounded-full h-8 w-8 p-0 text-red-500 hover:text-red-400"
                              onClick={() => handleDelete(msg.id)}
                              disabled={isActionLoading}
                              title="Delete"
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
              {messages.map((msg) => {
                const isActionLoading = actionLoadingId === msg.id;
                const statusCfg = STATUS_CONFIG[msg.status];

                return (
                  <div
                    key={msg.id}
                    className={`p-4 ${msg.status === 'unread' ? 'bg-primary/[0.02]' : ''}`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div
                        className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${
                          msg.status === 'unread'
                            ? 'bg-primary/10 text-primary'
                            : 'bg-muted/50 text-muted-foreground'
                        }`}
                      >
                        {msg.first_name[0]}{msg.last_name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-sm ${msg.status === 'unread' ? 'font-semibold' : 'font-medium'}`}>
                            {msg.first_name} {msg.last_name}
                          </span>
                          <span
                            className={`inline-flex items-center px-2 py-0 rounded-full text-[10px] font-semibold border ${statusCfg.className}`}
                          >
                            {statusCfg.label}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{msg.email}</p>
                      </div>
                    </div>

                    <p className={`text-sm mb-2 truncate ${msg.status === 'unread' ? 'font-semibold' : ''}`}>
                      {msg.subject}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                      </span>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-full h-8 w-8 p-0"
                          onClick={() => handleViewDetails(msg)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {msg.status === 'unread' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-full h-8 w-8 p-0 text-green-500"
                            onClick={() => handleMarkAsRead(msg)}
                            disabled={isActionLoading}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-full h-8 w-8 p-0 text-red-500"
                          onClick={() => handleDelete(msg.id)}
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
                Showing {messages.length} message{messages.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ─── View Details Modal ─── */}
      <Modal
        isOpen={!!selectedMessage}
        onClose={() => setSelectedMessage(null)}
        title="Message Details"
        className="max-w-2xl"
        footer={
          selectedMessage ? (
            <div className="flex flex-wrap gap-2 w-full">
              {selectedMessage.status === 'unread' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => handleMarkAsRead(selectedMessage)}
                  disabled={actionLoadingId === selectedMessage.id}
                >
                  <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Mark as Read
                </Button>
              )}
              <a
                href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}`}
                className="inline-flex"
              >
                <Button variant="outline" size="sm" className="rounded-full">
                  <Reply className="mr-1.5 h-3.5 w-3.5" /> Reply via Email
                </Button>
              </a>
              <Button
                variant="destructive"
                size="sm"
                className="rounded-full ml-auto"
                onClick={() => handleDelete(selectedMessage.id)}
                disabled={actionLoadingId === selectedMessage.id}
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
              </Button>
            </div>
          ) : undefined
        }
      >
        {selectedMessage && (
          <div className="space-y-5">
            {/* Sender info grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Sender</p>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {selectedMessage.first_name} {selectedMessage.last_name}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</p>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={`mailto:${selectedMessage.email}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {selectedMessage.email}
                  </a>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {format(new Date(selectedMessage.created_at), 'dd MMMM yyyy, HH:mm')}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</p>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${STATUS_CONFIG[selectedMessage.status].className}`}
                >
                  {STATUS_CONFIG[selectedMessage.status].label}
                </span>
              </div>
            </div>

            {/* Subject */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Subject</p>
              <p className="text-sm font-semibold">{selectedMessage.subject}</p>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Message</p>
              <div className="bg-background/50 rounded-xl p-4 border border-border/50">
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {selectedMessage.message}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
