import { useState, useEffect, useCallback, useMemo } from 'react';
import type { JSX } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
} from '@mui/material';
import {
  Add as AddIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  Edit as EditIcon,
  HelpOutline as HelpOutlineIcon,
  ConfirmationNumber as VoucherIcon,
  Visibility as VisibilityIcon,
  Storefront as StorefrontIcon,
} from '@mui/icons-material';
import {
  type Controls,
  EVENTS,
  Joyride,
  STATUS,
  type EventData,
} from 'react-joyride';
import Table from '@features/admin/components/Table';
import Pagination from '@features/admin/components/Pagination';
import CamPaignFormModal, {
  type CampaignQuestBundleSubmitDraft,
} from '@features/admin/components/CamPaignFormModal';
import QuestFormModal from '@features/admin/components/QuestFormModal';
import CampaignVoucherModal from '@features/admin/components/CampaignVoucherModal';
import CampaignDetailModal from '@features/admin/components/CampaignDetailModal';
import CampaignBranchModal from '@features/admin/components/CampaignBranchModal';
import AppModalHeader from '@components/AppModalHeader';
import type { Campaign } from '@features/admin/types/campaign';
import { QuestRewardType } from '@features/admin/types/quest';
import useCampaign from '@features/admin/hooks/useCampaign';
import useQuest from '@features/admin/hooks/useQuest';
import useVoucher from '@features/admin/hooks/useVoucher';
import { useAppSelector } from '@hooks/reduxHooks';
import {
  selectCampaigns,
  selectCampaignStatus,
  selectCampaignTotalCount,
} from '@slices/campaign';
import { selectQuestStatus } from '@slices/quest';
import type { CampaignFormData } from '@features/admin/utils/campaignSchema';
import { getCampaignOverviewTourSteps } from '@features/admin/utils/campaignOverviewTourSteps';
import type { VoucherCreate } from '@custom-types/voucher';
import type { Quest } from '@features/admin/types/quest';

const formatVNDatetime = (isoStr: string | null): string => {
  if (!isoStr) return '-';
  const date = new Date(isoStr);
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

type CampaignStatusInfo = {
  label: string;
  type: 'success' | 'error' | 'warning' | 'default' | 'info';
};

const getCampaignStatus = (row: Campaign): CampaignStatusInfo => {
  const now = Date.now();
  const parseTime = (value: string | null | undefined): number | null => {
    if (!value) {
      return null;
    }

    const timestamp = new Date(value).getTime();
    return Number.isNaN(timestamp) ? null : timestamp;
  };

  const regStart = parseTime(row.registrationStartDate);
  const regEnd = parseTime(row.registrationEndDate);
  const start = parseTime(row.startDate);
  const end = parseTime(row.endDate);

  if (end !== null && now > end) {
    return { label: 'Đã kết thúc', type: 'error' };
  }

  if (start !== null && end !== null && now >= start && now <= end) {
    return { label: 'Đang hoạt động', type: 'success' };
  }

  if (
    regStart !== null &&
    regEnd !== null &&
    now >= regStart &&
    now <= regEnd &&
    (start === null || now < start)
  ) {
    return { label: 'Đang mở đăng ký', type: 'info' };
  }

  if (regStart !== null && now < regStart) {
    return { label: 'Chưa đến lúc đăng ký', type: 'default' };
  }

  if (start !== null && now < start) {
    return { label: 'Chưa bắt đầu', type: 'warning' };
  }

  if (row.isRegisterable && !row.isActive) {
    return { label: 'Đang mở đăng ký', type: 'info' };
  }

  if (row.isActive && !row.isRegisterable) {
    return { label: 'Đang hoạt động', type: 'success' };
  }

  return { label: 'Không xác định', type: 'default' };
};

export default function CampaignPage(): JSX.Element {
  const campaigns = useAppSelector(selectCampaigns);
  const campaignStatus = useAppSelector(selectCampaignStatus);
  const questStatus = useAppSelector(selectQuestStatus);
  const totalCount = useAppSelector(selectCampaignTotalCount);
  const {
    onGetCampaigns,
    onCreateCampaign,
    onGetCampaignDetail,
    onUpdateCampaign,
    onPostCampaignImage,
    onDeleteCampaignImage,
  } = useCampaign();
  const {
    onGetQuests,
    onGetQuestById,
    onCreateQuest,
    onUpdateQuest,
    onUpdateQuestTasks,
    onPostQuestImage,
  } = useQuest();
  const { onCreateVoucher } = useVoucher();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [openModal, setOpenModal] = useState(false);
  const [openVoucherModal, setOpenVoucherModal] = useState(false);
  const [openBranchModal, setOpenBranchModal] = useState(false);
  const [openCampaignQuestModal, setOpenCampaignQuestModal] = useState(false);
  const [openCampaignQuestHubModal, setOpenCampaignQuestHubModal] =
    useState(false);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null
  );
  const [selectedCampaignQuest, setSelectedCampaignQuest] =
    useState<Quest | null>(null);
  const [detailCampaign, setDetailCampaign] = useState<Campaign | null>(null);

  const [isTourRunning, setIsTourRunning] = useState(false);
  const [tourInstanceKey, setTourInstanceKey] = useState(0);

  const fetchCampaigns = useCallback(async (): Promise<void> => {
    try {
      await onGetCampaigns(page, pageSize);
    } catch (err) {
      console.error('Failed to fetch campaigns', err);
    }
  }, [onGetCampaigns, page, pageSize]);

  useEffect(() => {
    void fetchCampaigns();
  }, [fetchCampaigns]);

  const handleOpenModal = (campaign?: Campaign): void => {
    // if (campaign && hasRegistrationStarted(campaign.registrationStartDate)) {
    //   return;
    // }

    if (campaign) {
      setEditingCampaign(campaign);
    } else {
      setEditingCampaign(null);
    }
    setOpenModal(true);
  };

  const handleCloseModal = (): void => {
    setOpenModal(false);
    setEditingCampaign(null);
  };

  const handleSubmit = async (
    data: CampaignFormData,
    imageFile: File | null,
    isImageRemoved?: boolean,
    questBundles?: CampaignQuestBundleSubmitDraft[]
  ): Promise<void> => {
    try {
      if (editingCampaign) {
        // ── Edit flow ──
        await onUpdateCampaign(editingCampaign.campaignId, data);

        if (isImageRemoved && !imageFile) {
          await onDeleteCampaignImage(editingCampaign.campaignId);
        }

        if (imageFile) {
          const formData = new FormData();
          formData.append('image', imageFile);
          await onPostCampaignImage(editingCampaign.campaignId, formData);
        }

        handleCloseModal();
      } else {
        const createdCampaign = await onCreateCampaign(data);

        if (imageFile) {
          const formData = new FormData();
          formData.append('image', imageFile);
          await onPostCampaignImage(createdCampaign.campaignId, formData);
        }

        if (questBundles && questBundles.length > 0) {
          await Promise.all(
            questBundles.map(async (questBundle) => {
              const taskPayloads = await Promise.all(
                questBundle.tasks.map(async (task) => {
                  const voucherPayloads: VoucherCreate[] = task.rewards.map(
                    (reward) => ({
                      name: reward.voucher.name,
                      voucherCode: reward.voucher.voucherCode,
                      type:
                        reward.voucher.type === 'PERCENT'
                          ? 'PERCENTAGE'
                          : 'AMOUNT',
                      description:
                        reward.voucher.description.trim() === ''
                          ? null
                          : reward.voucher.description,
                      discountValue: reward.voucher.discountValue,
                      maxDiscountValue:
                        reward.voucher.type === 'AMOUNT'
                          ? null
                          : reward.voucher.maxDiscountValue,
                      minAmountRequired: reward.voucher.minAmountRequired,
                      quantity: reward.voucher.quantity,
                      redeemPoint: 0,
                      startDate: createdCampaign.startDate,
                      endDate: createdCampaign.endDate,
                      expiredDate: null,
                      isActive: reward.voucher.isActive,
                      campaignId: createdCampaign.campaignId,
                    })
                  );

                  const createdVouchers =
                    await onCreateVoucher(voucherPayloads);

                  return {
                    type: task.taskType,
                    targetValue: task.targetValue,
                    description:
                      task.taskDescription.trim() === ''
                        ? null
                        : task.taskDescription,
                    rewards: createdVouchers.map((voucher, index) => ({
                      rewardType: QuestRewardType.VOUCHER,
                      rewardValue: voucher.voucherId,
                      quantity: task.rewards[index]?.quantity ?? 1,
                    })),
                  };
                })
              );

              const createdQuest = await onCreateQuest({
                title: questBundle.title,
                description:
                  questBundle.description.trim() === ''
                    ? null
                    : questBundle.description,
                imageUrl: null,
                isActive: false,
                requiresEnrollment: true,
                isStandalone: false,
                campaignId: createdCampaign.campaignId,
                tasks: taskPayloads,
              });

              if (questBundle.imageFile) {
                const questImageFormData = new FormData();
                questImageFormData.append('imageFile', questBundle.imageFile);
                await onPostQuestImage(
                  createdQuest.questId,
                  questImageFormData
                );
              }
            })
          );
        }

        handleCloseModal();
      }
    } catch (err) {
      console.error('Failed to save campaign', err);
    }
  };

  const handleOpenDetailModal = async (row: Campaign): Promise<void> => {
    setOpenDetailModal(true);
    setDetailCampaign(row);
    setIsDetailLoading(true);

    try {
      const campaignDetail = await onGetCampaignDetail(row.campaignId);
      setDetailCampaign(campaignDetail);
    } catch (err) {
      console.error('Failed to fetch campaign detail', err);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleOpenCampaignQuestModal = async (row: Campaign): Promise<void> => {
    setSelectedCampaign(row);
    setSelectedCampaignQuest(null);

    try {
      const questsByCampaign = await onGetQuests({
        pageNumber: 1,
        pageSize: 100,
        campaignId: row.campaignId,
      });

      const firstQuest = questsByCampaign.items[0];
      if (!firstQuest) {
        setSelectedCampaignQuest(null);
        setOpenCampaignQuestHubModal(true);
        return;
      }

      const questDetail = await onGetQuestById(firstQuest.questId);
      setSelectedCampaignQuest(questDetail);
      setOpenCampaignQuestModal(true);
    } catch (err) {
      console.error('Failed to fetch campaign quests', err);
    }
  };

  const handleOpenQuestFormFromHub = (): void => {
    setOpenCampaignQuestHubModal(false);
    setOpenCampaignQuestModal(true);
  };

  const handleCloseCampaignQuestHubModal = (): void => {
    setOpenCampaignQuestHubModal(false);
    setSelectedCampaignQuest(null);
    setSelectedCampaign(null);
  };

  const handleCloseCampaignQuestModal = (): void => {
    setOpenCampaignQuestModal(false);
    setSelectedCampaignQuest(null);
    setSelectedCampaign(null);
  };

  const handleSaveCampaignQuest = async (
    data: Parameters<typeof onCreateQuest>[0],
    imageFile?: File | null
  ): Promise<void> => {
    if (!selectedCampaign) {
      return;
    }

    try {
      let savedQuest: Quest;

      if (selectedCampaignQuest) {
        const canEditTasks = (selectedCampaignQuest.userQuestCount ?? 0) === 0;

        savedQuest = await onUpdateQuest(selectedCampaignQuest.questId, {
          title: data.title,
          description: data.description,
          imageUrl: data.imageUrl,
          isActive: canEditTasks
            ? data.isActive
            : selectedCampaignQuest.isActive,
          requiresEnrollment: canEditTasks
            ? data.requiresEnrollment
            : selectedCampaignQuest.requiresEnrollment,
          isStandalone: canEditTasks
            ? data.isStandalone
            : selectedCampaignQuest.isStandalone,
          campaignId: canEditTasks
            ? data.campaignId
            : selectedCampaignQuest.campaignId,
        });

        if (canEditTasks) {
          await onUpdateQuestTasks(selectedCampaignQuest.questId, data.tasks);
        }
      } else {
        savedQuest = await onCreateQuest({
          ...data,
          isStandalone: false,
          requiresEnrollment: true,
          campaignId: selectedCampaign.campaignId,
        });
      }

      if (imageFile && savedQuest.questId) {
        const formData = new FormData();
        formData.append('imageFile', imageFile);
        await onPostQuestImage(savedQuest.questId, formData);
      }

      const latestQuest = await onGetQuestById(savedQuest.questId);
      setSelectedCampaignQuest(latestQuest);
      handleCloseCampaignQuestModal();
    } catch (error) {
      console.error('Failed to save campaign quest', error);
    }
  };

  const startTour = (): void => {
    setTourInstanceKey((prev) => prev + 1);
    setIsTourRunning(true);
  };

  const handleJoyrideEvent = (data: EventData, controls: Controls): void => {
    if (data.type === EVENTS.TARGET_NOT_FOUND) {
      controls.next();
      return;
    }

    if (data.status === STATUS.FINISHED || data.status === STATUS.SKIPPED) {
      setIsTourRunning(false);
    }
  };

  const tourSteps = useMemo(() => {
    return getCampaignOverviewTourSteps({
      hasRows: campaigns.length > 0,
    });
  }, [campaigns.length]);

  const columns = [
    {
      key: 'name',
      label: 'Tên chiến dịch',
      render: (value: unknown, row: Campaign): JSX.Element => (
        <Box className="flex flex-col gap-1">
          {!row.isUpdateable && (
            <span className="inline-flex w-fit items-center rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700">
              Đã có cửa hàng tham gia
            </span>
          )}
          <Box className="font-semibold text-[var(--color-table-text-primary)]">
            {typeof value === 'string' ? value : String(value)}
          </Box>
        </Box>
      ),
    },
    {
      key: 'startDate',
      label: 'Thời gian diễn ra',
      render: (_: unknown, row: Campaign): JSX.Element => (
        <Box className="text-sm text-[var(--color-table-text-secondary)]">
          <div>Từ: {formatVNDatetime(row.startDate)}</div>
          <div>Đến: {formatVNDatetime(row.endDate)}</div>
        </Box>
      ),
    },
    {
      key: 'registrationStartDate',
      label: 'Thời gian đăng ký',
      render: (_: unknown, row: Campaign): JSX.Element => (
        <Box className="text-sm text-[var(--color-table-text-secondary)]">
          <div>Từ: {formatVNDatetime(row.registrationStartDate)}</div>
          <div>Đến: {formatVNDatetime(row.registrationEndDate)}</div>
        </Box>
      ),
    },
    // {
    //   key: 'targetSegment',
    //   label: 'Phân khúc',
    //   render: (value: unknown): JSX.Element => (
    //     <Box className="text-table-text-primary">
    //       {typeof value === 'string' && value.trim().length > 0 ? value : '-'}
    //     </Box>
    //   ),
    // },
    {
      key: 'status',
      label: 'Hoạt động',
      render: (_: unknown, row: Campaign): JSX.Element => {
        const { label, type } = getCampaignStatus(row);
        const colorMap: Record<string, string> = {
          success: 'bg-green-100 text-green-700 border-green-200',
          error: 'bg-red-100 text-red-700 border-red-200',
          warning: 'bg-amber-100 text-amber-700 border-amber-200',
          default: 'bg-slate-100 text-slate-700 border-slate-200',
          info: 'bg-blue-100 text-blue-700 border-blue-200',
        };
        return (
          <span
            className={`inline-flex min-w-[130px] items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-bold shadow-sm ${colorMap[type]}`}
          >
            {label}
          </span>
        );
      },
    },
  ];

  const actions = [
    {
      id: 'detail',
      label: <VisibilityIcon fontSize="small" />,
      menuLabel: 'Xem chi tiết chiến dịch',
      onClick: (row: Campaign): void => {
        void handleOpenDetailModal(row);
      },
      tooltip: 'Xem chi tiết chiến dịch',
      color: 'info' as const,
      variant: 'outlined' as const,
      show: (): boolean => true,
    },
    {
      id: 'branches',
      label: <StorefrontIcon fontSize="small" />,
      menuLabel: 'Xem chi nhánh tham gia',
      onClick: (row: Campaign): void => {
        setSelectedCampaign(row);
        setOpenBranchModal(true);
      },
      tooltip: 'Xem chi nhánh tham gia',
      color: 'info' as const,
      variant: 'outlined' as const,
      show: (): boolean => true,
    },
    {
      id: 'quests',
      label: <AssignmentTurnedInIcon fontSize="small" />,
      menuLabel: 'Xem nhiệm vụ chiến dịch',
      onClick: (row: Campaign): void => {
        void handleOpenCampaignQuestModal(row);
      },
      tooltip: 'Xem nhiệm vụ chiến dịch',
      color: 'secondary' as const,
      variant: 'outlined' as const,
      show: (row: Campaign): boolean => row.isUpdateable,
    },
    {
      id: 'voucher',
      label: <VoucherIcon fontSize="small" />,
      menuLabel: 'Quản lý voucher chiến dịch',
      onClick: (row: Campaign): void => {
        setSelectedCampaign(row);
        setOpenVoucherModal(true);
      },
      tooltip: 'Quản lý voucher chiến dịch',
      color: 'warning' as const,
      variant: 'outlined' as const,
      show: (row: Campaign): boolean => row.isUpdateable,
    },
    {
      id: 'edit',
      label: <EditIcon fontSize="small" />,
      menuLabel: 'Chỉnh sửa chiến dịch',
      onClick: (row: Campaign): void => handleOpenModal(row),
      tooltip: 'Chỉnh sửa chiến dịch',
      color: 'primary' as const,
      variant: 'outlined' as const,
      show: (row: Campaign): boolean => row.isUpdateable,
    },
  ];

  return (
    <div className="flex h-full flex-col font-[var(--font-nunito)]">
      <Joyride
        key={tourInstanceKey}
        run={isTourRunning}
        steps={tourSteps}
        continuous
        scrollToFirstStep
        onEvent={handleJoyrideEvent}
        options={{
          showProgress: true,
          scrollDuration: 350,
          scrollOffset: 80,
          spotlightPadding: 8,
          overlayColor: 'rgba(15, 23, 42, 0.5)',
          primaryColor: '#7ab82d',
          textColor: '#1f2937',
          zIndex: 1700,
          buttons: ['back', 'skip', 'primary'],
        }}
        locale={{
          back: 'Quay lại',
          close: 'Đóng',
          last: 'Hoàn tất',
          next: 'Tiếp theo',
          nextWithProgress: 'Tiếp theo ({current}/{total})',
          skip: 'Bỏ qua',
        }}
      />

      {/* Header */}
      <div
        className="mb-6 flex items-center justify-between"
        data-tour="admin-campaign-page-header"
      >
        <div>
          <div className="mb-1 flex items-start gap-2">
            <h1 className="text-3xl font-bold text-[var(--color-table-text-primary)]">
              Quản lý chiến dịch
            </h1>
            <button
              type="button"
              onClick={startTour}
              aria-label="Mở hướng dẫn quản lý chiến dịch"
              title="Hướng dẫn"
              className="text-primary-700 hover:text-primary-800 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors"
            >
              <HelpOutlineIcon sx={{ fontSize: 18 }} />
            </button>
          </div>
          <p className="text-sm text-[var(--color-table-text-secondary)]">
            Quản lý các chương trình khuyến mãi và chiến dịch hệ thống
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          data-tour="admin-campaign-create-button"
          className="flex items-center gap-2 rounded-lg bg-[var(--color-primary-600)] px-4 py-2 font-semibold text-white transition-colors hover:bg-[var(--color-primary-700)]"
        >
          <AddIcon fontSize="small" />
          Thêm chiến dịch
        </button>
      </div>

      {/* Table Content */}
      <Box
        sx={{ flex: 1, minHeight: 0 }}
        data-tour="admin-campaign-table-wrapper"
      >
        <Table
          columns={columns}
          data={campaigns}
          rowKey="campaignId"
          actions={actions}
          groupActionsInMenu
          loading={campaignStatus === 'pending'}
          emptyMessage="Chưa có chiến dịch nào"
          noActionsMessage="Đã kết thúc"
          tourId="admin-campaign"
        />
      </Box>

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={Math.ceil((totalCount ?? 0) / pageSize)}
        totalCount={totalCount ?? 0}
        pageSize={pageSize}
        hasPrevious={page > 1}
        hasNext={page < Math.ceil((totalCount ?? 0) / pageSize)}
        onPageChange={setPage}
        onPageSizeChange={(newPageSize) => {
          setPageSize(newPageSize);
          setPage(1);
        }}
      />

      {/* Form Modal (create / edit) */}
      <CamPaignFormModal
        isOpen={openModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        campaign={editingCampaign}
        status={campaignStatus}
      />

      <QuestFormModal
        isOpen={openCampaignQuestModal}
        onClose={handleCloseCampaignQuestModal}
        onSubmit={handleSaveCampaignQuest}
        quest={selectedCampaignQuest}
        forcedCampaignId={selectedCampaign?.campaignId ?? null}
        forcedCampaignName={selectedCampaign?.name ?? null}
        forcedCampaignStartDate={selectedCampaign?.startDate ?? null}
        forcedCampaignEndDate={selectedCampaign?.endDate ?? null}
        canEditTasks={
          selectedCampaignQuest
            ? (selectedCampaignQuest.userQuestCount ?? 0) === 0
            : true
        }
        status={questStatus}
        enableViewModeToggle
        initialViewMode
      />

      <Dialog
        open={openCampaignQuestHubModal}
        onClose={handleCloseCampaignQuestHubModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            overflow: 'hidden',
          },
        }}
      >
        <AppModalHeader
          title="Nhiệm vụ chiến dịch"
          subtitle={selectedCampaign?.name}
          icon={<AssignmentTurnedInIcon />}
          iconTone="campaign"
          onClose={handleCloseCampaignQuestHubModal}
        />
        <DialogContent dividers>
          <div className="space-y-3">
            <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
              <p className="text-sm font-semibold text-amber-800">
                Chưa có nhiệm vụ cho chiến dịch này.
              </p>
              <p className="mt-1 text-sm text-amber-700">
                Tạo nhiệm vụ mới để bắt đầu cấu hình mục tiêu và phần thưởng.
              </p>
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCampaignQuestHubModal} color="inherit">
            Đóng
          </Button>
          <Button
            onClick={handleOpenQuestFormFromHub}
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
          >
            Tạo nhiệm vụ
          </Button>
        </DialogActions>
      </Dialog>

      {/* Campaign Voucher Modal (from table row action) */}
      <CampaignVoucherModal
        isOpen={openVoucherModal}
        onClose={() => setOpenVoucherModal(false)}
        campaign={selectedCampaign}
      />

      <CampaignDetailModal
        isOpen={openDetailModal}
        onClose={() => setOpenDetailModal(false)}
        campaign={detailCampaign}
        isLoading={isDetailLoading}
      />

      <CampaignBranchModal
        isOpen={openBranchModal}
        onClose={() => setOpenBranchModal(false)}
        campaign={selectedCampaign}
      />
    </div>
  );
}
