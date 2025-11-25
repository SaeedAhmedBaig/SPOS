import React, { useState } from 'react';

const BulkActionsModal = ({
  isOpen = false,
  onClose,
  selectedItems = [],
  title = "Bulk Actions",
  actions = [],
  onActionComplete,
  loading = false,
  confirmButtonText = "Confirm",
  cancelButtonText = "Cancel",
  className = "",
}) => {
  const [selectedAction, setSelectedAction] = useState('');
  const [confirmationData, setConfirmationData] = useState({});

  if (!isOpen) return null;

  const handleClose = () => {
    setSelectedAction('');
    setConfirmationData({});
    onClose();
  };

  const handleActionSelect = (actionId) => {
    setSelectedAction(actionId);
    const action = actions.find(a => a.id === actionId);
    if (action?.fields) {
      const initialData = {};
      action.fields.forEach(f => {
        initialData[f.name] = f.defaultValue || '';
      });
      setConfirmationData(initialData);
    } else {
      setConfirmationData({});
    }
  };

  const handleFieldChange = (name, value) => {
    setConfirmationData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const action = actions.find(a => a.id === selectedAction);
    if (action?.onAction) {
      try {
        await action.onAction(selectedItems, confirmationData);
        onActionComplete?.(selectedAction, selectedItems);
        handleClose();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const selectedActionConfig = actions.find(a => a.id === selectedAction);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-50 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className={`bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg transform transition-all ${className}`}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
            <button
              onClick={handleClose}
              disabled={loading}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
            >
              <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {/* Selected Items Info */}
            <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 p-3 rounded-lg border border-blue-200 dark:border-blue-700 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected</span>
            </div>

            {/* Action Selection */}
            {!selectedAction ? (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Choose an action
                </label>
                {actions.map(action => (
                  <button
                    key={action.id}
                    onClick={() => handleActionSelect(action.id)}
                    disabled={action.disabled}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition duration-200 ${
                      action.disabled
                        ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-white dark:bg-gray-800 border-gray-300 hover:shadow hover:border-gray-400 text-gray-700 dark:text-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {action.icon && (
                        <div className={`p-2 rounded-lg ${action.variant === 'danger' ? 'bg-red-100 text-red-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                          {action.icon}
                        </div>
                      )}
                      <div className="text-left">
                        <div className="font-medium">{action.label}</div>
                        {action.description && <div className="text-sm text-gray-500 dark:text-gray-400">{action.description}</div>}
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            ) : (
              /* Action Confirmation */
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Action: <span className="font-medium text-gray-900 dark:text-white">{selectedActionConfig?.label}</span>
                </div>

                {/* Dynamic Fields */}
                {selectedActionConfig?.fields?.map(field => (
                  <div key={field.name} className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {field.label}{field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {field.type === 'select' ? (
                      <select
                        value={confirmationData[field.name] || ''}
                        onChange={e => handleFieldChange(field.name, e.target.value)}
                        required={field.required}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 text-sm focus:ring-1 focus:ring-gray-500 focus:border-gray-500 dark:bg-gray-800 dark:text-white"
                      >
                        <option value="">Select {field.label}</option>
                        {field.options?.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type || 'text'}
                        value={confirmationData[field.name] || ''}
                        onChange={e => handleFieldChange(field.name, e.target.value)}
                        placeholder={field.placeholder}
                        required={field.required}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 text-sm focus:ring-1 focus:ring-gray-500 focus:border-gray-500 dark:bg-gray-800 dark:text-white"
                      />
                    )}
                  </div>
                ))}

                {/* Warning for dangerous actions */}
                {selectedActionConfig?.variant === 'danger' && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-400 text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M4 20h16a2 2 0 002-2V6a2 2 0 00-2-2H4a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>This action cannot be undone</span>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setSelectedAction('')}
                    disabled={loading}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg transition ${
                      selectedActionConfig?.variant === 'danger'
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-gray-900 hover:bg-gray-800'
                    }`}
                  >
                    {loading ? 'Processing...' : confirmButtonText}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default BulkActionsModal;
