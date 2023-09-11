import React, { Dispatch, SetStateAction } from 'react';

type SelectProps = {
  value: any;
  setValue: Dispatch<SetStateAction<any | undefined>>;
  placeholder?: string;
};

export const Input: React.FC<SelectProps> = ({
  value,
  setValue,
  placeholder = '',
}) => {
  return (
    <div className="bg-gray-100 p-2 max-w-md rounded">
      <input
        type="text"
        className="w-full bg-gray-100"
        placeholder={placeholder}
        value={value}
        onChange={event => setValue(event.target.value)}
      />
    </div>
  );
};
