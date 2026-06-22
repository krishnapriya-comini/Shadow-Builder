import React from 'react';

export interface BaseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    bgColor?: string;
    textColor?: string;
    borderColor?: string;
    shadowColor?: string;
    borderRadius?: number;
    paddingX?: number;
    paddingY?: number;
    fontSize?: number;
    fontWeight?: number;
}

export const BaseButton: React.FC<BaseButtonProps> = ({
    bgColor = '#FFFFFF',
    textColor = '#4AC1BD',
    borderColor = '#E4E4E4',
    shadowColor = '#E4E4E4',
    borderRadius = 10,
    paddingX = 20,
    paddingY = 14,
    fontSize = 16,
    fontWeight = 400,
    children,
    className = '',
    style,
    disabled,
    ...props
}) => {
    return (
        <button
            className={className}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                backgroundColor: bgColor,
                color: textColor,
                border: `1px solid ${borderColor}`,
                borderRadius: `${borderRadius}px`,
                boxShadow: `0px 4px 0px 0px ${shadowColor}`,
                padding: `${paddingY}px ${paddingX}px`,
                fontSize: `${fontSize}px`,
                fontWeight: fontWeight,
                fontFamily: "'Gabarito', Arial, sans-serif",
                lineHeight: '1.2em',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.5 : 1,
                transition: 'all 150ms ease-out',
                whiteSpace: 'nowrap',
                ...style,
            }}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
};

export default BaseButton;
