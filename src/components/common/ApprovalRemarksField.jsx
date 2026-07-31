const MAX_REMARKS_LENGTH = 1000;

const ApprovalRemarksField = ({
  value,
  onChange,
  disabled = false,
  label = 'Remarks (Optional)',
  placeholder = 'Add remarks for this action...',
}) => (
  <div>
    <div className="mb-2 flex items-center justify-between gap-3">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <span className="text-xs text-gray-400">
        {value.length}/{MAX_REMARKS_LENGTH}
      </span>
    </div>
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      maxLength={MAX_REMARKS_LENGTH}
      placeholder={placeholder}
      rows={4}
      className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
    />
  </div>
);

export { MAX_REMARKS_LENGTH };
export default ApprovalRemarksField;
