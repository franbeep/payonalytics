import React, { Dispatch, SetStateAction } from 'react';

type SelectProps = {
  value: any;
  setValue: Dispatch<SetStateAction<any | undefined>>;
  widthClass: string;
  options: Record<string, any> | Array<any>;
};

export const Select: React.FC<SelectProps> = ({
  value,
  setValue,
  widthClass,
  options,
}) => {
  return (
    <div
      className={`bg-gray-100 p-2 ${widthClass} rounded flex justify-center`}
    >
      <select
        className="bg-gray-100"
        value={value}
        onChange={event => setValue(event.target.value)}
      >
        {Array.isArray(options)
          ? Object.values(options).map(option => <option>{option}</option>)
          : Object.entries(options).map(([label, value]) => (
              <option value={value}>{label}</option>
            ))}
      </select>
    </div>
  );
};
