interface OptionType {
  value: string | number;
  label: string;
}

interface FormInputType {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  as?: 'input' | 'select';
  options?: OptionType[];
}

const FormInput = ({ label, name, type = 'text', placeholder = '', as = 'input', options = [] }: FormInputType) => {
  return (
    <fieldset className="fieldset">
      <legend className="fieldset-legend">{label}</legend>
      {as === 'select' ? (
        <select name={name} className="input h-6 max-w-[375px] w-full">
          <option value="">Select...</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input type={type} name={name} className="input h-6 max-w-[375px] w-full" placeholder={placeholder} />
      )}
      {/* <p className="label">Optional</p> */}
    </fieldset>
  );
};
export default FormInput;
