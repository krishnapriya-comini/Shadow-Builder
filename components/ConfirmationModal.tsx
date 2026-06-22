import React from 'react';

interface ConfirmationModalProps {
  isVisible: boolean;
  title?: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
}

/**
 * ConfirmationModal - A reusable confirmation dialog
 * Ported from bake-store/src/components/common/ConfirmationModal.vue
 */
export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isVisible,
  title = "Are you sure?",
  message,
  onCancel,
  onConfirm,
}) => {
  if (!isVisible) return null;

  return (
    <div
      className="confirmation-modal-bg fixed inset-0 flex items-center justify-center z-[2147483647]"
      style={{
        background: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(2px)',
        WebkitBackdropFilter: 'blur(2px)',
      }}
    >
      <div
        className="relative bg-white border border-[#E9E9E9] rounded-[15px] flex flex-col items-center py-4 px-4"
        style={{
          width: '272px',
          boxShadow: '0px 4px 0px #E9E9E9',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          className="absolute cursor-pointer bg-transparent border-none"
          style={{ top: '14px', right: '15px' }}
          onClick={onCancel}
        >
          <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.7617 8.5498L8.68172 15.6298" stroke="#000D26" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M15.7617 15.6298L8.68172 8.5498" stroke="#000D26" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Modal title */}
        <h2
          className="font-medium text-center text-black"
          style={{
            fontFamily: 'Gabarito, sans-serif',
            fontSize: '20px',
            color: '#000',
            marginTop: '16px',
            marginBottom: '12px',
          }}
        >
          {title}
        </h2>

        {/* Modal message */}
        <p
          className="font-normal text-center"
          style={{
            width: '221px',
            fontFamily: 'Gabarito, sans-serif',
            fontSize: '14px',
            lineHeight: '17px',
            color: '#787878',
            marginBottom: '20px',
          }}
        >
          {message}
        </p>

        {/* Action buttons */}
        <div className="flex items-center justify-center" style={{ marginBottom: '8px' }}>
          {/* Cancel button (Red X) */}
          <button
            onClick={onCancel}
            className="cursor-pointer flex items-center justify-center"
            style={{
              width: '45px',
              height: '45px',
              backgroundColor: '#F65C5C',
              border: '1px solid #DA3A3A',
              boxShadow: '0px 3px 0px #DA3A3A',
              borderRadius: '25px',
              marginRight: '24px',
            }}
          >
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.8848 13.3179L12.5598 23.6429" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M22.8848 23.6429L12.5598 13.3179" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Confirm button (Green Check) */}
          <button
            onClick={onConfirm}
            className="cursor-pointer flex items-center justify-center"
            style={{
              width: '45px',
              height: '45px',
              backgroundColor: '#4AC1BD',
              border: '1px solid #25A49F',
              boxShadow: '0px 3px 0px #25A49F',
              borderRadius: '25px',
            }}
          >
            <svg width="29" height="29" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.22266 15.4122L11.6093 19.7872L21.2227 10.1738" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
