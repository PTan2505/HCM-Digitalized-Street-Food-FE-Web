import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
} from '@mui/material';
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

const formatVNDatetime = (isoStr?: string): string => {
  if (!isoStr) {
    return '-';
  }

  const date = new Date(isoStr);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const InfoItem = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}): JSX.Element => {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
      <p className="text-table-text-secondary text-xs tracking-wide uppercase">
        {label}
      </p>
      <p className="text-table-text-primary mt-1 text-sm font-semibold">
        {value}
      </p>
    </div>
  );
};

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
    if (!isOpen) {
      return;
    }

    void fetchReferenceData();
  }, [fetchReferenceData, isOpen]);

  const campaignName = useMemo((): string => {
    if (quest?.isStandalone) {
      return '-';
    }

    if (!quest?.campaignId) {
      return '-';
    }

    return (
      campaignOptions.find(
        (campaign) => campaign.campaignId === quest.campaignId
      )?.name ?? `#${quest.campaignId}`
    );
  }, [campaignOptions, quest?.campaignId, quest?.isStandalone]);

  const rewardValueLabelByTask = useMemo((): Record<number, string> => {
    if (!quest?.tasks?.length) {
      return {};
    }

    return quest.tasks.reduce<Record<number, string>>((accumulator, task) => {
      if (task.rewardType === QuestRewardType.POINTS) {
        accumulator[task.questTaskId] = String(task.rewardValue);
        return accumulator;
      }

      if (task.rewardType === QuestRewardType.BADGE) {
        const badgeName = badgeOptions.find(
          (badge) => badge.badgeId === task.rewardValue
        )?.badgeName;
        accumulator[task.questTaskId] = badgeName ?? `#${task.rewardValue}`;
        return accumulator;
      }

      const voucherName = voucherOptions.find(
        (voucher) => voucher.voucherId === task.rewardValue
      )?.name;
      accumulator[task.questTaskId] = voucherName ?? `#${task.rewardValue}`;
      return accumulator;
    }, {});
  }, [badgeOptions, quest?.tasks, voucherOptions]);

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Chi tiết nhiệm vụ</DialogTitle>
      <DialogContent dividers>
        <div className="space-y-6 font-(--font-nunito)">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            <InfoItem
              label="Số lượng nhiệm vụ"
              value={quest?.taskCount ?? quest?.tasks?.length ?? 0}
            />
            <InfoItem
              label="Ngày tạo"
              value={formatVNDatetime(quest?.createdAt)}
            />
            <InfoItem
              label="Cập nhật lần cuối"
              value={formatVNDatetime(quest?.updatedAt)}
            />
          </div>

          <div className="space-y-3 rounded-lg border border-gray-200 p-4">
            <h3 className="text-table-text-primary text-base font-bold">
              Thông tin chung
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="text-table-text-secondary text-xs">Tiêu đề</p>
                <p className="text-table-text-primary text-sm font-semibold">
                  {quest?.title ?? '-'}
                </p>
              </div>
              <div>
                <p className="text-table-text-secondary text-xs">
                  Tên chiến dịch
                </p>
                <p className="text-table-text-primary text-sm font-semibold">
                  {campaignName}
                </p>
              </div>
              <div>
                <p className="text-table-text-secondary mb-1 text-xs">
                  Trạng thái
                </p>
                <StatusBadge
                  label={quest?.isActive ? 'Đang hoạt động' : 'Tạm ngưng'}
                  type={quest?.isActive ? 'success' : 'error'}
                />
              </div>
              <div>
                <p className="text-table-text-secondary mb-1 text-xs">
                  Kiểu nhiệm vụ
                </p>
                <StatusBadge
                  label={quest?.isStandalone ? 'Độc lập' : 'Theo chiến dịch'}
                  type={quest?.isStandalone ? 'warning' : 'default'}
                />
              </div>
            </div>

            <div>
              <p className="text-table-text-secondary text-xs">Mô tả</p>
              <p className="text-table-text-primary text-sm">
                {quest?.description ?? 'Không có mô tả'}
              </p>
            </div>

            <div>
              <p className="text-table-text-secondary text-xs">Hình ảnh</p>
              {quest?.imageUrl ? (
                <div className="mt-1 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 p-2">
                  <img
                    src={quest.imageUrl}
                    alt={quest.title}
                    className="max-h-56 w-auto rounded object-cover"
                  />
                  <p className="text-table-text-secondary mt-2 text-xs break-all">
                    {quest.imageUrl}
                  </p>
                </div>
              ) : (
                <p className="text-table-text-primary text-sm">
                  Không có hình ảnh
                </p>
              )}
            </div>
          </div>

          <div className="space-y-3 rounded-lg border border-gray-200 p-4">
            <h3 className="text-table-text-primary text-base font-bold">
              Danh sách công việc trong nhiệm vụ
            </h3>

            <div className="space-y-2">
              {quest?.tasks?.map((task, index) => (
                <div
                  key={task.questTaskId}
                  className="rounded-lg border border-gray-200 bg-gray-50 p-3"
                >
                  <p className="text-table-text-primary text-sm font-semibold">
                    Nhiệm vụ {index + 1}: {QUEST_TASK_TYPE_LABELS[task.type]}
                  </p>
                  <p className="text-table-text-secondary text-sm">
                    Phần thưởng: {QUEST_REWARD_TYPE_LABELS[task.rewardType]} /
                    Giá trị thưởng:{' '}
                    {rewardValueLabelByTask[task.questTaskId] ??
                      task.rewardValue}
                  </p>
                  <p className="text-table-text-secondary text-sm">
                    Mục tiêu: {task.targetValue}
                  </p>
                  <p className="text-table-text-secondary text-sm">
                    Mô tả: {task.description ?? 'Không có mô tả'}
                  </p>
                </div>
              ))}

              {!quest?.tasks?.length && (
                <p className="text-table-text-secondary text-sm">
                  Chưa có công việc nào trong nhiệm vụ này.
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
}
