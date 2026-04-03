interface DeleteModalImage {
  title?: string;
  filename: string;
}

interface DeleteModalProps {
  image: DeleteModalImage;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteModal = ({ image, isDeleting, onClose, onConfirm }: DeleteModalProps) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full transition-colors duration-200">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Delete Image</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            This action will permanently delete this image and cannot be undone.
          </p>

          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-6">
            <p className="text-sm font-medium text-red-800 dark:text-red-200 truncate">
              {image.title || image.filename}
            </p>
            <p className="text-xs text-red-700 dark:text-red-300 mt-1">
              Associated voice notes, will also be removed.
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="bg-gray-200 hover:bg-gray-300 disabled:opacity-60 disabled:cursor-not-allowed dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              {isDeleting ? 'Deleting...' : 'Delete Permanently'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
