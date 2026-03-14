import type { ToastContentProps } from 'react-toastify';
import type { JSX } from 'react';
import cx from 'clsx';

type CustomNotificationProps = ToastContentProps<{
  title: string;
  content: string;
}>;

export default function CustomNotification({
  data,
  toastProps,
}: CustomNotificationProps): JSX.Element {
  const isColored = toastProps.theme === 'colored';

  return (
    <div className="flex w-full flex-col">
      <h3
        className={cx(
          'text-sm font-semibold',
          isColored ? 'text-white' : 'text-moderator-hover-text'
        )}
      >
        {data.title}
      </h3>
      <div className="flex items-center justify-between">
        <p
          className={cx(
            'text-sm',
            isColored ? 'text-white' : 'text-moderator-hover-text'
          )}
        >
          {data.content}
        </p>
      </div>
    </div>
  );
}
