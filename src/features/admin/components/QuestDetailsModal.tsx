import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Chip,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  EmojiEvents as EmojiEventsIcon,
  Campaign as CampaignIcon,
  Image as ImageIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import useBadge from '@features/admin/hooks/useBadge';
import useCampaign from '@features/admin/hooks/useCampaign';
import useVoucher from '@features/admin/hooks/useVoucher';
import type { Badge } from '@features/admin/types/badge';
import type { Campaign } from '@features/admin/types/campaign';
import {
  type Quest,
  QuestRewardType,
  QUEST_REWARD_TYPE_LABELS,
  QUEST_TASK_TYPE_LABELS,
} from '@features/admin/types/quest';
import { useCallback, useEffect, useMemo, useState, type JSX } from 'react';
import type { Voucher } from '@custom-types/voucher';

interface QuestDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  quest: Quest | null;
}

const formatVNDatetime = (isoStr?: string): string => {
  if (!isoStr) return '—';
  const date = new Date(isoStr);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/** Tiny muted label + value card */
const InfoCard = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}): JSX.Element => (
  <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
    <p className="mb-0.5 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
      {label}
    </p>
    <p className="text-sm font-semibold text-gray-800">{value}</p>
  </div>
);

/** Section heading with left accent bar */
const SectionHeading = ({
  icon,
  title,
}: {
  icon: JSX.Element;
  title: string;
}): JSX.Element => (
  <div className="mb-4 flex items-center gap-2">
    <span
      className="flex h-7 w-7 items-center justify-center rounded-lg text-white"
      style={{ background: '#8bcf3f' }}
    >
      {icon}
    </span>
    <h3 className="text-sm font-bold tracking-wide text-gray-600 uppercase">
      {title}
    </h3>
  </div>
);

export default function QuestDetailsModal({
  isOpen,
  onClose,
  quest,
}: QuestDetailsModalProps): JSX.Element {
  const { onGetCampaigns } = useCampaign();
  const { onGetAllBadges } = useBadge();
  const { onGetVouchers } = useVoucher();

  const [campaignOptions, setCampaignOptions] = useState<Campaign[]>([]);
  const [badgeOptions, setBadgeOptions] = useState<Badge[]>([]);
  const [voucherOptions, setVoucherOptions] = useState<Voucher[]>([]);

  const fetchReferenceData = useCallback(async (): Promise<void> => {
    try {
      const [campaignResponse, badges, vouchers] = await Promise.all([
        onGetCampaigns(1, 200),
        onGetAllBadges(),
        onGetVouchers(),
      ]);
      setCampaignOptions(campaignResponse.items ?? []);
      setBadgeOptions(badges);
      setVoucherOptions(vouchers);
    } catch (error) {
      console.error('Failed to fetch quest reference data', error);
      setCampaignOptions([]);
      setBadgeOptions([]);
      setVoucherOptions([]);
    }
  }, [onGetAllBadges, onGetCampaigns, onGetVouchers]);

  useEffect(() => {
    if (!isOpen) return;
    void fetchReferenceData();
  }, [fetchReferenceData, isOpen]);

  const campaignName = useMemo((): string => {
    if (quest?.isStandalone) return '—';
    if (!quest?.campaignId) return '—';
    return (
      campaignOptions.find((c) => c.campaignId === quest.campaignId)?.name ??
      `#${quest.campaignId}`
    );
  }, [campaignOptions, quest?.campaignId, quest?.isStandalone]);

  const rewardValueLabelByTask = useMemo((): Record<number, string> => {
    if (!quest?.tasks?.length) return {};
    return quest.tasks.reduce<Record<number, string>>((acc, task) => {
      if (task.rewardType === QuestRewardType.POINTS) {
        acc[task.questTaskId] = String(task.rewardValue);
        return acc;
      }
      if (task.rewardType === QuestRewardType.BADGE) {
        const name = badgeOptions.find(
          (b) => b.badgeId === task.rewardValue
        )?.badgeName;
        acc[task.questTaskId] = name ?? `#${task.rewardValue}`;
        return acc;
      }
      const name = voucherOptions.find(
        (v) => v.voucherId === task.rewardValue
      )?.name;
      acc[task.questTaskId] = name ?? `#${task.rewardValue}`;
      return acc;
    }, {});
  }, [badgeOptions, quest?.tasks, voucherOptions]);

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
      PaperProps={{
        sx: {
          maxHeight: '90vh',
          borderRadius: '16px',
          overflow: 'hidden',
        },
      }}
    >
      {/* ── Header ── */}
      <DialogTitle
        sx={{
          p: 0,
          background: 'linear-gradient(135deg, #8bcf3f 0%, #6aaa28 100%)',
        }}
      >
        <div className="flex items-start gap-4 px-6 py-5">
          {/* Quest image or placeholder */}
          <div className="flex-shrink-0">
            {quest?.imageUrl ? (
              <img
                src={quest.imageUrl}
                alt={quest.title}
                className="h-16 w-16 rounded-xl border-2 border-white/40 object-cover shadow-md"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-xl border-2 border-white/30 bg-white/20">
                <ImageIcon sx={{ color: 'white', fontSize: 28 }} />
              </div>
            )}
          </div>

          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-semibold tracking-widest text-white/70 uppercase">
              Chi tiết nhiệm vụ
            </p>
            <h2 className="mt-0.5 truncate text-xl font-bold text-white">
              {quest?.title ?? '—'}
            </h2>
            <div className="mt-2 flex flex-wrap gap-2">
              <Chip
                icon={
                  quest?.isActive ? (
                    <CheckCircleIcon style={{ color: '#fff', fontSize: 14 }} />
                  ) : (
                    <CancelIcon style={{ color: '#fff', fontSize: 14 }} />
                  )
                }
                label={quest?.isActive ? 'Đang hoạt động' : 'Tạm ngưng'}
                size="small"
                sx={{
                  bgcolor: quest?.isActive
                    ? 'rgba(255,255,255,0.25)'
                    : 'rgba(239,68,68,0.5)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  border: '1px solid rgba(255,255,255,0.3)',
                  '& .MuiChip-icon': { ml: '6px' },
                }}
              />
              <Chip
                label={quest?.isStandalone ? 'Độc lập' : 'Theo chiến dịch'}
                size="small"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  border: '1px solid rgba(255,255,255,0.3)',
                }}
              />
            </div>
          </div>
        </div>
      </DialogTitle>

      {/* ── Body ── */}
      <DialogContent
        dividers
        sx={{ overflowY: 'auto', maxHeight: 'calc(90vh - 200px)', p: 3 }}
      >
        <div className="flex flex-col gap-6">
          {/* ── Stats row ── */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <InfoCard
              label="Số nhiệm vụ con"
              value={quest?.taskCount ?? quest?.tasks?.length ?? 0}
            />
            <InfoCard
              label="Ngày tạo"
              value={formatVNDatetime(quest?.createdAt)}
            />
            <InfoCard
              label="Cập nhật lần cuối"
              value={formatVNDatetime(quest?.updatedAt)}
            />
          </div>

          {/* ── Thông tin chung ── */}
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <SectionHeading
              icon={<AssignmentIcon sx={{ fontSize: 16 }} />}
              title="Thông tin chung"
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Campaign */}
              {!quest?.isStandalone && (
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex-shrink-0 rounded-lg bg-blue-50 p-1.5 text-blue-500">
                    <CampaignIcon sx={{ fontSize: 16 }} />
                  </span>
                  <div>
                    <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                      Chiến dịch
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-gray-800">
                      {campaignName}
                    </p>
                  </div>
                </div>
              )}

              {/* Description */}
              <div
                className={
                  !quest?.isStandalone ? 'sm:col-span-2' : 'sm:col-span-2'
                }
              >
                <p className="mb-1 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                  Mô tả
                </p>
                <p className="text-sm leading-relaxed text-gray-700">
                  {quest?.description ?? (
                    <span className="text-gray-400 italic">Không có mô tả</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* ── Task list ── */}
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <SectionHeading
              icon={<EmojiEventsIcon sx={{ fontSize: 16 }} />}
              title="Danh sách nhiệm vụ con"
            />

            {quest?.tasks?.length ? (
              <div className="space-y-3">
                {quest.tasks.map((task, index) => (
                  <div
                    key={task.questTaskId}
                    className="rounded-xl border border-gray-100 bg-gray-50 p-4 transition-shadow hover:shadow-sm"
                  >
                    {/* Task header */}
                    <div className="mb-3 flex items-center gap-2">
                      <span
                        className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                        style={{ background: '#8bcf3f' }}
                      >
                        {index + 1}
                      </span>
                      <p className="text-sm font-bold text-gray-800">
                        {QUEST_TASK_TYPE_LABELS[task.type]}
                      </p>
                    </div>

                    {/* Task details grid */}
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      <div className="rounded-lg border border-gray-200 bg-white px-3 py-2">
                        <p className="text-[10px] font-bold tracking-wide text-gray-400 uppercase">
                          Mục tiêu
                        </p>
                        <p className="mt-0.5 text-sm font-semibold text-gray-800">
                          {task.targetValue}
                        </p>
                      </div>

                      <div className="rounded-lg border border-gray-200 bg-white px-3 py-2">
                        <p className="text-[10px] font-bold tracking-wide text-gray-400 uppercase">
                          Loại thưởng
                        </p>
                        <p className="mt-0.5 text-sm font-semibold text-gray-800">
                          {QUEST_REWARD_TYPE_LABELS[task.rewardType]}
                        </p>
                      </div>

                      <div className="col-span-2 rounded-lg border border-gray-200 bg-white px-3 py-2 sm:col-span-1">
                        <p className="text-[10px] font-bold tracking-wide text-gray-400 uppercase">
                          Giá trị thưởng
                        </p>
                        <p className="mt-0.5 text-sm font-semibold text-gray-800">
                          {rewardValueLabelByTask[task.questTaskId] ??
                            task.rewardValue}
                        </p>
                      </div>
                    </div>

                    {task.description && (
                      <p className="mt-3 text-xs leading-relaxed text-gray-500">
                        <span className="font-semibold">Mô tả:</span>{' '}
                        {task.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-8 text-center">
                <EmojiEventsIcon sx={{ fontSize: 36, color: '#d1d5db' }} />
                <p className="mt-2 text-sm text-gray-400">
                  Chưa có công việc nào trong nhiệm vụ này.
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>

      {/* ── Footer ── */}
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit" variant="outlined">
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
}
