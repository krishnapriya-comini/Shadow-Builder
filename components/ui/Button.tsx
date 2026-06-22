import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'icon';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  icon, 
  children, 
  className = '', 
  ...props 
}) => {
  
  const baseStyle = "transition-transform active:translate-y-[2px] active:shadow-none flex items-center justify-center cursor-pointer";
  
  // JSON: options frame
  // undoButton: 44x45, radius 30, white, stroke #E4E4E4, shadow #E4E4E4
  const iconStyle = `
    bg-white 
    border-[1px] border-[#E4E4E4] 
    shadow-[0px_4px_0px_#E4E4E4] 
    rounded-full 
    text-[#000D26]
    w-[45px] h-[45px]
    hover:opacity-80
    transition-opacity duration-200
  `;

  const primaryStyle = "bg-blue-500 text-white px-6 py-2 rounded-full font-bold hover:bg-blue-600 shadow-md";

  return (
    <button 
      className={`${baseStyle} ${variant === 'icon' ? iconStyle : primaryStyle} ${className}`} 
      {...props}
    >
      {icon}
      {children}
    </button>
  );
};