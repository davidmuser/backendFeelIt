import React from 'react';

const TypingField = ({ type = 'text', placeholder = '', value, onChange, ...props }) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      style={{
        padding: '10px',
        fontSize: '16px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        width: '100%',
        boxSizing: 'border-box',
        marginBottom: '10px'
      }}
      {...props}
    />
  );
};

export default TypingField;