interface InputFieldProps {
  label: string;
  id: string;
  name: string;
  type?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
  multiline?: boolean;
  rows?: number;
  prefix?: string;
}

export default function InputField({
  label,
  id,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required,
  multiline,
  rows = 4,
  prefix,
}: InputFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {prefix ? (
        <div className="flex">
          <span
            className="flex items-center px-3 text-sm text-slate-400 rounded-l-lg border-y border-l"
            style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.1)' }}
          >
            {prefix}
          </span>
          <input
            id={id}
            name={name}
            type={type}
            value={value ?? ''}
            onChange={onChange as (e: React.ChangeEvent<HTMLInputElement>) => void}
            placeholder={placeholder}
            required={required}
            className="input-field rounded-l-none"
            style={{ borderLeft: 'none' }}
          />
        </div>
      ) : multiline ? (
        <textarea
          id={id}
          name={name}
          value={value ?? ''}
          onChange={onChange as (e: React.ChangeEvent<HTMLTextAreaElement>) => void}
          placeholder={placeholder}
          required={required}
          rows={rows}
          className="input-field resize-none"
        />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange as (e: React.ChangeEvent<HTMLInputElement>) => void}
          placeholder={placeholder}
          required={required}
          className="input-field"
        />
      )}
    </div>
  );
}
