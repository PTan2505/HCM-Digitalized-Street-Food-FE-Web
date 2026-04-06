import { Dialog, DialogContent } from '@mui/material';
import {
  EmojiEvents as EmojiEventsIcon,
  Campaign as CampaignIcon,
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
import AppModalHeader from '@components/AppModalHeader';

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
  tone,
}: {
  label: string;
  value: string | number;
  tone: 'lime' | 'sky' | 'violet' | 'amber';
}): JSX.Element => (
  <div
    className={`rounded-xl border px-4 py-3 shadow-sm ${
      tone === 'lime'
        ? 'border-lime-200 bg-lime-50'
        : tone === 'sky'
          ? 'border-sky-200 bg-sky-50'
          : tone === 'violet'
            ? 'border-violet-200 bg-violet-50'
            : 'border-amber-200 bg-amber-50'
    }`}
  >
    <p className="mb-0.5 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
      {label}
    </p>
    <p className="text-sm font-bold text-gray-800">{value}</p>
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

const StatusBadge = ({
  label,
  type,
}: {
  label: string;
  type: 'success' | 'error' | 'warning' | 'default';
}): JSX.Element => {
  const colors = {
    success: 'bg-green-100 text-green-700 border-green-200',
    error: 'bg-red-100 text-red-700 border-red-200',
    warning: 'bg-amber-100 text-amber-700 border-amber-200',
    default: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <span
      className={`inline-flex min-w-25 items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-bold shadow-sm ${colors[type]}`}
    >
      {label}
    </span>
  );
};

const TaskTypeBadge = ({ label }: { label: string }): JSX.Element => (
  <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
    {label}
  </span>
);

const RewardTypeBadge = ({ label }: { label: string }): JSX.Element => (
  <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
    {label}
  </span>
);

const QuestTypeBadge = ({
  isStandalone,
}: {
  isStandalone?: boolean;
}): JSX.Element => (
  <span
    className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
      isStandalone
        ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
        : 'border-cyan-200 bg-cyan-50 text-cyan-700'
    }`}
  >
    {isStandalone ? 'Độc lập' : 'Theo chiến dịch'}
  </span>
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
      <AppModalHeader
        title="Chi tiết nhiệm vụ"
        subtitle={quest?.title ?? '—'}
        icon={<AssignmentIcon />}
        iconTone="admin"
        onClose={onClose}
      />

      {/* ── Body ── */}
      <DialogContent
        dividers
        sx={{
          overflowY: 'auto',
          maxHeight: 'calc(90vh - 120px)',
          p: 3,
          backgroundColor: '#f8fafc',
        }}
      >
        <div className="flex flex-col gap-6">
          {/* <div className="rounded-2xl border border-slate-200 bg-linear-to-r from-white to-slate-50 p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="max-w-2xl">
                <p className="text-table-text-primary text-base font-bold">
                  {quest?.title ?? 'Nhiệm vụ'}
                </p>
                <p className="text-table-text-secondary mt-1 text-sm leading-6">
                  {quest?.description ?? 'Không có mô tả cho nhiệm vụ này.'}
                </p>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                <StatusBadge
                  label={quest?.isActive ? 'Đang hoạt động' : 'Tạm ngưng'}
                  type={quest?.isActive ? 'success' : 'error'}
                />
                <Chip
                  label={quest?.isStandalone ? 'Độc lập' : 'Theo chiến dịch'}
                  size="small"
                  color="default"
                  variant="outlined"
                />
              </div>
            </div>
          </div> */}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <InfoCard
              label="Số nhiệm vụ con"
              value={quest?.taskCount ?? quest?.tasks?.length ?? 0}
              tone="lime"
            />
            <InfoCard label="Chiến dịch" value={campaignName} tone="sky" />
            <InfoCard
              label="Ngày tạo"
              value={formatVNDatetime(quest?.createdAt)}
              tone="violet"
            />
            <InfoCard
              label="Cập nhật lần cuối"
              value={formatVNDatetime(quest?.updatedAt)}
              tone="amber"
            />
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <SectionHeading
              icon={<AssignmentIcon sx={{ fontSize: 16 }} />}
              title="Thông tin chung"
            />

            <div className="flex flex-col gap-4">
              <div className="space-y-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="mb-1 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                    Tiêu đề
                  </p>
                  <p className="text-base font-bold text-gray-800">
                    {quest?.title ?? '—'}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                  <p className="mb-1 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                    Mô tả
                  </p>
                  <p className="min-h-16 text-sm leading-relaxed text-gray-700">
                    {quest?.description ?? (
                      <span className="text-gray-400 italic">
                        Không có mô tả
                      </span>
                    )}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-3">
                    <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                      Trạng thái
                    </p>
                    <div className="mt-2 min-h-7">
                      <StatusBadge
                        label={quest?.isActive ? 'Đang hoạt động' : 'Tạm ngưng'}
                        type={quest?.isActive ? 'success' : 'error'}
                      />
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-3">
                    <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                      Kiểu nhiệm vụ
                    </p>
                    <div className="mt-2 min-h-7">
                      <QuestTypeBadge isStandalone={quest?.isStandalone} />
                    </div>
                  </div>

                  {!quest?.isStandalone && (
                    <div className="rounded-xl border border-blue-100 bg-blue-50/60 px-3 py-3 sm:col-span-2 xl:col-span-1">
                      <div className="flex items-start gap-2.5">
                        <span className="mt-0.5 shrink-0 rounded-lg bg-blue-100 p-1.5 text-blue-600">
                          <CampaignIcon sx={{ fontSize: 16 }} />
                        </span>
                        <div>
                          <p className="text-[10px] font-bold tracking-widest text-blue-500 uppercase">
                            Chiến dịch
                          </p>
                          <p className="mt-1 line-clamp-2 text-sm font-semibold text-gray-800">
                            {campaignName}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <p className="mb-2 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                  Ảnh quest
                </p>
                <div className="mx-auto w-full max-w-4xl overflow-hidden rounded-xl border border-gray-200 bg-gray-50 shadow-sm">
                  {quest?.imageUrl ? (
                    <img
                      src={quest.imageUrl}
                      alt={
                        quest?.title
                          ? `Ảnh nhiệm vụ ${quest.title}`
                          : 'Ảnh nhiệm vụ'
                      }
                      className="aspect-video w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex aspect-video items-center justify-center px-4 text-center text-sm text-gray-400">
                      Chưa có ảnh cho nhiệm vụ này.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

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
                    className="rounded-xl border border-gray-100 bg-linear-to-r from-white to-slate-50 p-4 transition-shadow hover:shadow-sm"
                  >
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                          style={{ background: '#8bcf3f' }}
                        >
                          {index + 1}
                        </span>
                        <p className="text-sm font-bold text-gray-800">
                          Nhiệm vụ {index + 1}
                        </p>
                      </div>

                      <TaskTypeBadge
                        label={QUEST_TASK_TYPE_LABELS[task.type]}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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
                        <div className="mt-1">
                          <RewardTypeBadge
                            label={QUEST_REWARD_TYPE_LABELS[task.rewardType]}
                          />
                        </div>
                      </div>

                      <div className="rounded-lg border border-gray-200 bg-white px-3 py-2">
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
                      <div className="mt-3 rounded-lg border border-gray-200 bg-white px-3 py-2">
                        <p className="text-[10px] font-bold tracking-wide text-gray-400 uppercase">
                          Mô tả nhiệm vụ con
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-gray-600">
                          {task.description}
                        </p>
                      </div>
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
    </Dialog>
  );
}
