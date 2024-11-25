interface NotificationProps {
  type: 'success' | 'error' | 'loading';
  message: string;
  onClose?: () => void;
}

export const Notification = ({ type, message, onClose }: NotificationProps) => {
  const bgColor = {
    success: 'bg-green-100 border-green-500',
    error: 'bg-red-100 border-red-500',
    loading: 'bg-yellow-100 border-yellow-500',
  }[type];

  return (
    <div
      className={`fixed top-4 right-4 p-4 border-2 ${bgColor} max-w-sm animate-slide-in`}
    >
      <div className="flex items-start justify-between">
        <p className="font-mono text-sm">{message}</p>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-4 text-black hover:text-gray-700"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};
