import React from 'react';
import { motion } from 'framer-motion';
import { strings } from '../strings';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'icon';
}

const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    children,
    className = '',
    ...props
}) => {
    const baseStyle = "transition-transform active:translate-y-[2px] active:shadow-none flex items-center justify-center cursor-pointer";
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
            {children}
        </button>
    );
};

interface TopBarProps {
    timeRemaining?: number;
    isPaused?: boolean;
    onPause: () => void;
    onRestart: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onPause, onRestart }) => {
    return (
        <div
            className="inline-flex items-center absolute gap-[12px] z-[200]"
            style={{ top: '4.4%', left: '2.6%', pointerEvents: 'auto' }}
        >
            <motion.div
                className="flex items-center gap-[12px]"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
            >
                <Button
                    variant="icon"
                    onClick={onPause}
                    aria-label={strings.accessibility.pauseButton}
                >
                    <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M8.83984 5.81592H5.83984C5.01142 5.81592 4.33984 6.48749 4.33984 7.31592V17.3159C4.33984 18.1443 5.01142 18.8159 5.83984 18.8159H8.83984C9.66827 18.8159 10.3398 18.1443 10.3398 17.3159V7.31592C10.3398 6.48749 9.66827 5.81592 8.83984 5.81592Z"
                            stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path
                            d="M18.8398 5.81592H15.8398C15.0114 5.81592 14.3398 6.48749 14.3398 7.31592V17.3159C14.3398 18.1443 15.0114 18.8159 15.8398 18.8159H18.8398C19.6683 18.8159 20.3398 18.1443 20.3398 17.3159V7.31592C20.3398 6.48749 19.6683 5.81592 18.8398 5.81592Z"
                            stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </Button>

                <Button
                    variant="icon"
                    onClick={onRestart}
                    aria-label={strings.accessibility.restartButton}
                >
                    <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3.00002 12.1835C2.87777 14.2834 3.49493 16.3599 4.74431 18.0521C5.9937 19.7444 7.79637 20.9456 9.83923 21.4471C11.8821 21.9485 14.0361 21.7186 15.927 20.7972C17.818 19.8758 19.3265 18.3212 20.1905 16.4033C21.0546 14.4855 21.2195 12.3255 20.6567 10.2987C20.094 8.27189 18.839 6.50621 17.1099 5.30836C15.3808 4.1105 13.2867 3.55616 11.1914 3.7416C9.09607 3.92704 7.13189 4.84056 5.64002 6.32348" stroke="#000D26" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M5.03998 4.52344V7.13344H7.64998" stroke="#000D26" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </Button>
            </motion.div>
        </div>
    );
};

export default TopBar;
