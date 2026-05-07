import { useEffect, useMemo, useState, type JSX } from 'react';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  HelpOutline as HelpOutlineIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import {
  type Controls,
  EVENTS,
  Joyride,
  STATUS,
  type EventData,
} from 'react-joyride';
import { Box, IconButton } from '@mui/material';
import Table from '@features/admin/components/Table';
import useSetting from '@features/admin/hooks/useSetting';
import type { Setting } from '@features/admin/types/setting';
import { getSettingManagementTourSteps } from '@features/admin/utils/settingManagementTourSteps';
import { useAppSelector } from '@hooks/reduxHooks';
import { selectSettings, selectSettingStatus } from '@slices/setting';

export default function SettingPage(): JSX.Element {
  const settings = useAppSelector(selectSettings);
  const status = useAppSelector(selectSettingStatus);
  const { onGetAllSettings, onUpdateSetting, onReloadSettings } = useSetting();

  const settingNameMap: Record<string, string> = {
    orderXP: 'Điểm kinh nghiệm cho đơn hàng',
    ghostpinXP: 'Điểm kinh nghiệm cho chia sẻ quán',
    feedbackDailyLimit: 'Giới hạn phản hồi mỗi ngày',
    GoldMinXP: 'Điểm kinh nghiệm tối thiểu hạng Vàng',
    SubscriptionFee: 'Phí đăng ký dịch vụ bán hàng',
    DiamondMinXP: 'Điểm kinh nghiệm tối thiểu hạng Kim cương',
    feedbackXP: 'Điểm kinh nghiệm cho phản hồi',
    SubscriptionDurationDays: 'Thời hạn dịch vụ bán hàng',
    vendorTierFeedbackWindowSize: 'Số lượng đánh giá để tính hạng',
    VendorOrderCommissionPercent: 'Phần trăm hoa hồng trên mỗi đơn hàng',
  };

  const [editingValues, setEditingValues] = useState<Record<number, string>>(
    {}
  );
  const [editingSettingId, setEditingSettingId] = useState<number | null>(null);
  const [savingMap, setSavingMap] = useState<Record<number, boolean>>({});
  const [isTourRunning, setIsTourRunning] = useState(false);
  const [tourInstanceKey, setTourInstanceKey] = useState(0);

  useEffect(() => {
    void onGetAllSettings();
  }, [onGetAllSettings]);

  useEffect(() => {
    setEditingValues((previousValues) => {
      const nextValues = { ...previousValues };

      settings.forEach((setting) => {
        if (!(setting.id in nextValues)) {
          nextValues[setting.id] = setting.value;
        }
      });

      return nextValues;
    });
  }, [settings]);

  const handleValueChange = (id: number, value: string): void => {
    setEditingValues((previousValues) => ({
      ...previousValues,
      [id]: value,
    }));
  };

  const handleStartEdit = (setting: Setting): void => {
    setEditingSettingId(setting.id);
    setEditingValues((previousValues) => ({
      ...previousValues,
      [setting.id]: previousValues[setting.id] ?? setting.value,
    }));
  };

  const handleCancelEdit = (setting: Setting): void => {
    setEditingSettingId(null);
    setEditingValues((previousValues) => ({
      ...previousValues,
      [setting.id]: setting.value,
    }));
  };

  const handleSaveSetting = async (setting: Setting): Promise<void> => {
    const nextValue = (editingValues[setting.id] ?? setting.value).trim();

    if (nextValue === setting.value) {
      return;
    }

    try {
      setSavingMap((previousState) => ({
        ...previousState,
        [setting.id]: true,
      }));
      await onUpdateSetting(setting.name, { value: nextValue });
      await onGetAllSettings();
      setEditingSettingId(null);
    } catch (error) {
      console.error('Failed to update setting', error);
    } finally {
      setSavingMap((previousState) => ({
        ...previousState,
        [setting.id]: false,
      }));
    }
  };

  const handleReloadSettings = async (): Promise<void> => {
    try {
      await onReloadSettings();
      await onGetAllSettings();
    } catch (error) {
      console.error('Failed to reload settings', error);
    }
  };

  const columns = useMemo(
    () => [
      {
        key: 'name',
        label: 'Tên cài đặt',
        render: (_: unknown, row: Setting): JSX.Element => {
          const label = settingNameMap[row.name] ?? row.name;

          return (
            <span className="text-table-text-primary text-sm font-medium">
              {label}
            </span>
          );
        },
      },
      {
        key: 'value',
        label: 'Giá trị',
        render: (_: unknown, row: Setting): JSX.Element => {
          const value = editingValues[row.id] ?? row.value;
          const isEditing = editingSettingId === row.id;
          const isSaving = Boolean(savingMap[row.id]);

          if (isEditing) {
            return (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={value}
                  onChange={(event) =>
                    handleValueChange(row.id, event.target.value)
                  }
                  className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:outline-none"
                  autoFocus
                />
                <IconButton
                  size="small"
                  color="success"
                  onClick={() => void handleSaveSetting(row)}
                  disabled={isSaving || status === 'pending'}
                >
                  <CheckIcon sx={{ fontSize: 18, color: '#166534' }} />
                </IconButton>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleCancelEdit(row)}
                  disabled={isSaving || status === 'pending'}
                >
                  <CloseIcon sx={{ fontSize: 18, color: '#b91c1c' }} />
                </IconButton>
              </div>
            );
          }

          return (
            <div className="flex items-center justify-between gap-2">
              <span className="text-table-text-primary text-sm font-medium">
                {value}
              </span>
              <IconButton
                size="small"
                color="primary"
                disabled={status === 'pending'}
                onClick={() => handleStartEdit(row)}
              >
                <EditIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </div>
          );
        },
      },
    ],
    [editingSettingId, editingValues, savingMap, status]
  );

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
    return getSettingManagementTourSteps({
      hasRows: settings.length > 0,
    });
  }, [settings.length]);

  return (
    <div className="flex h-full flex-col font-(--font-nunito)">
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

      <div
        className="mb-6 flex items-center justify-between"
        data-tour="admin-setting-page-header"
      >
        <div>
          <div className="mb-1 flex items-start gap-2">
            <h1 className="text-table-text-primary text-3xl font-bold">
              Cấu hình hệ thống
            </h1>
            <button
              type="button"
              onClick={startTour}
              aria-label="Mở hướng dẫn cấu hình hệ thống"
              title="Hướng dẫn"
              className="text-primary-700 hover:text-primary-800 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors"
            >
              <HelpOutlineIcon sx={{ fontSize: 18 }} />
            </button>
          </div>
          <p className="text-table-text-secondary text-sm">
            Quản lý giá trị cài đặt và tải lại cấu hình khi chạy
          </p>
        </div>

        <button
          onClick={() => void handleReloadSettings()}
          disabled={status === 'pending'}
          data-tour="admin-setting-reload-button"
          className="bg-primary-600 hover:bg-primary-700 flex items-center gap-2 rounded-lg px-4 py-2 font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          <RefreshIcon fontSize="small" />
          Reload setting
        </button>
      </div>

      <Box
        sx={{ flex: 1, minHeight: 0 }}
        data-tour="admin-setting-table-wrapper"
      >
        <Table
          columns={columns}
          data={settings}
          rowKey="id"
          loading={status === 'pending'}
          emptyMessage="Chưa có setting nào"
        />
      </Box>
    </div>
  );
}
