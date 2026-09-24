const FormInput = ({ label, type = 'text', value, onChange, required = false, className = '', ...props }) => {
  return (
    <div className={`form-group ${className}`.trim()}>
      <label className="form-label">{label}</label>
      <input 
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        {...props}
      />
    </div>
  );
};

export default FormInput;
