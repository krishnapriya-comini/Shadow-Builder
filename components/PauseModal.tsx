import React, { useState, useRef, useEffect } from 'react';
import { ConfirmationModal } from './ConfirmationModal';

interface PauseModalProps {
  isVisible: boolean;
  onResume: () => void;
  onRestart: () => void;
  onQuit?: () => void; // Navigate to challenges page
  isSoundOn: boolean;
  onToggleSound: () => void;
  isMusicOn: boolean;
  onToggleMusic: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  isVisible,
  onResume,
  onRestart,
  onQuit,
  isSoundOn,
  onToggleSound,
  isMusicOn,
  onToggleMusic,
}) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const activeCardRef = useRef<HTMLDivElement>(null);

  // Scroll to active card when info modal opens
  useEffect(() => {
    if (showInfoModal && activeCardRef.current) {
      activeCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [showInfoModal]);

  if (!isVisible) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains('modal-overlay')) {
      onResume();
    }
  };

  const handleToggleMusic = () => {
    onToggleMusic();
  };

  const handleToggleSound = () => {
    onToggleSound();
  };

  const handleQuit = () => {
    setShowConfirmation(true);
  };

  const confirmQuit = () => {
    setShowConfirmation(false);
    // Navigate to challenges page via onQuit callback
    if (onQuit) {
      onQuit();
    } else {
      // Fallback: restart and resume if no onQuit handler
      onRestart();
      onResume();
    }
  };

  const cancelConfirmation = () => {
    setShowConfirmation(false);
  };

  const toggleInfoModal = () => {
    setShowInfoModal(!showInfoModal);
  };

  // Confirmation Modal - using the new ConfirmationModal component
  if (showConfirmation) {
    return (
      <ConfirmationModal
        isVisible={true}
        title="Are you sure?"
        message="Are you sure you want to quit?"
        onCancel={cancelConfirmation}
        onConfirm={confirmQuit}
      />
    );
  }

  // Info Modal
  if (showInfoModal) {
    return (
      <div
        className="modal-overlay fixed inset-0 z-[2147483647] flex items-center justify-center"
        style={{ background: 'rgba(0, 0, 0, 0.32)' }}
        onClick={handleOverlayClick}
      >
        <div
          className="w-[400px] rounded-[15px] bg-white border border-[#E9E9E9] flex flex-col pt-4 px-4 pb-4 relative"
          style={{ boxShadow: '0px 4px 0px #E9E9E9' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center w-full relative" style={{ marginBottom: '16px' }}>
            <h2 className="font-['Gabarito'] text-[16px] font-medium text-center text-black w-full">
              Game Info
            </h2>
            <button
              className="absolute right-[-4px] top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center cursor-pointer bg-transparent border-none"
              onClick={toggleInfoModal}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.46 8.46L8.46 15.46" stroke="#000D26" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M15.46 15.46L8.46 8.46" stroke="#000D26" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* Content - Concept Cards (scrollable) */}
          <div
            className="flex flex-col w-full scrollbar-hide"
            style={{
              gap: '16px',
              maxHeight: '280px',
              overflowY: 'auto',
              scrollbarWidth: 'none', /* Firefox */
            }}
          >
            {/* Addition Concept - ACTIVE (highlighted with yellow) */}
            <div
              ref={activeCardRef}
              className="flex flex-row items-center gap-[10px] px-2 py-4 w-full bg-white border border-[#E4E4E4] rounded-[10px]"
              style={{ boxShadow: '0px 3px 0px #E4E4E4' }}
            >
              <div className="w-[44px] h-[50px] rounded-r-[5px] flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FDBF2E' }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 4V16M4 10H16" stroke="#9A6F0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="flex flex-col justify-center flex-1 min-w-0" style={{ gap: '2px' }}>
                <h3 className="font-['Gabarito'] font-medium text-[15px] leading-tight text-black m-0 p-0">Addition</h3>
                <p className="font-['Gabarito'] text-[13px] font-normal text-[#828282] line-clamp-2 m-0 p-0">
                  Practice adding numbers together to find the sum.
                </p>
              </div>
            </div>

            {/* Subtraction Concept - ACTIVE (highlighted with yellow) */}
            <div className="flex flex-row items-center gap-[10px] px-2 py-4 w-full bg-white border border-[#E4E4E4] rounded-[10px]" style={{ boxShadow: '0px 3px 0px #E4E4E4' }}>
              <div className="w-[44px] h-[50px] rounded-r-[5px] flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FDBF2E' }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 10H16" stroke="#9A6F0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="flex flex-col justify-center flex-1 min-w-0" style={{ gap: '2px' }}>
                <h3 className="font-['Gabarito'] font-medium text-[15px] leading-tight text-black m-0 p-0">Subtraction</h3>
                <p className="font-['Gabarito'] text-[13px] font-normal text-[#828282] line-clamp-2 m-0 p-0">
                  Practice finding the difference between numbers.
                </p>
              </div>
            </div>

            {/* Place Value Concept */}
            <div className="flex flex-row items-center gap-[10px] px-2 py-4 w-full bg-white border border-[#E4E4E4] rounded-[10px]" style={{ boxShadow: '0px 3px 0px #E4E4E4' }}>
              <div className="w-[44px] h-[50px] rounded-r-[5px] flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#E4E4E4' }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 4H18M2 10H18M2 16H18" stroke="#828282" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="flex flex-col justify-center flex-1 min-w-0" style={{ gap: '2px' }}>
                <h3 className="font-['Gabarito'] font-medium text-[15px] leading-tight text-black m-0 p-0">Place Value</h3>
                <p className="font-['Gabarito'] text-[13px] font-normal text-[#828282] line-clamp-2 m-0 p-0">
                  Learn to group objects into tens and ones to understand place value.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Pause Modal
  return (
    <div
      className="modal-overlay fixed inset-0 z-[2147483647] flex items-center justify-center"
      style={{ background: 'rgba(0, 0, 0, 0.32)' }}
      onClick={handleOverlayClick}
    >
      <div
        className="rounded-[15px] bg-white border border-[#E9E9E9] flex flex-col"
        style={{ padding: '20px', width: 'fit-content', boxShadow: '0px 4px 0px #E9E9E9' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-center w-full relative" style={{ margin: '0 0 16px 0' }}>
          <h2 className="font-['Gabarito'] text-[20px] font-medium text-center" style={{ margin: 0 }}>
            Game Paused
          </h2>
          <button
            className="absolute right-[-4px] top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center cursor-pointer bg-transparent border-none"
            onClick={() => { onResume(); }}
          >
            <svg width="32" height="32" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15.8047 8.96484L8.72469 16.0448" stroke="#000D26" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M15.8047 16.0448L8.72469 8.96484" stroke="#000D26" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Button group */}
        <div className="flex justify-center" style={{ gap: '12px', margin: '0 0 28px 0' }}>
          {/* Music On/Off button */}
          <div className="flex flex-col items-center" style={{ gap: '12px' }}>
            <button
              onClick={handleToggleMusic}
              className="w-[65px] h-[65px] bg-white rounded-full border border-[#E4E4E4] flex items-center justify-center cursor-pointer"
              style={{ boxShadow: '0px 4px 0px #E4E4E4' }}
            >
              {isMusicOn ? (
                <svg width="24" height="23" viewBox="0 0 24 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8.5 17.9229C8.5 16.2661 7.15685 14.9229 5.5 14.9229C3.84315 14.9229 2.5 16.2661 2.5 17.9229C2.5 19.5798 3.84315 20.9229 5.5 20.9229C7.15685 20.9229 8.5 19.5798 8.5 17.9229ZM21.5 15.9229C21.5 14.2661 20.1569 12.9229 18.5 12.9229C16.8431 12.9229 15.5 14.2661 15.5 15.9229C15.5 17.5798 16.8431 18.9229 18.5 18.9229C20.1569 18.9229 21.5 17.5798 21.5 15.9229ZM23.5 15.9229C23.5 18.6843 21.2614 20.9229 18.5 20.9229C15.7386 20.9229 13.5 18.6843 13.5 15.9229C13.5 13.1615 15.7386 10.9229 18.5 10.9229C19.6257 10.9229 20.6643 11.2951 21.5 11.9229V3.17975L10.5 5.71784V17.9229C10.5 20.6843 8.26142 22.9229 5.5 22.9229C2.73858 22.9229 0.5 20.6843 0.5 17.9229C0.5 15.1615 2.73858 12.9229 5.5 12.9229C6.62568 12.9229 7.66431 13.2951 8.5 13.9229V4.92292C8.5 4.45726 8.82166 4.05302 9.27539 3.94831L22.2754 0.948309C22.5722 0.879907 22.8837 0.951107 23.1221 1.14069C23.3606 1.33041 23.5 1.61817 23.5 1.92292V15.9229Z" fill="black" />
                </svg>
              ) : (
                <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M10 14.8706L7.18848 17.5649C6.64062 16.9812 5.86328 16.6163 5 16.6163C3.34277 16.6163 2 17.9594 2 19.6163C2 20.4338 2.32715 21.1749 2.85742 21.7159L2.99219 21.8451L1.5459 23.2312L1.41309 23.0997C0.539062 22.1993 0 20.9707 0 19.6163C0 16.8549 2.23828 14.6163 5 14.6163C5.56836 14.6163 6.11426 14.7111 6.62305 14.8857C7.12207 15.0571 7.58594 15.3054 8 15.6163V6.6163C8 6.15072 8.32129 5.74643 8.77539 5.64169L21.7754 2.64169C21.8359 2.6279 21.8965 2.61972 21.957 2.61715C22.043 2.61349 22.1279 2.62094 22.2109 2.639C22.3457 2.66818 22.4736 2.72494 22.5879 2.8077L20.252 5.04574L10 7.41122V14.8706ZM18 22.6163C15.6426 22.6163 13.667 20.985 13.1387 18.7895L15.0791 16.9299C15.0635 16.9985 15.0498 17.068 15.0381 17.1383C15.0127 17.2939 15 17.4536 15 17.6163C15 19.2732 16.3428 20.6163 18 20.6163C19.6572 20.6163 21 19.2732 21 17.6163C21 15.9594 19.6572 14.6163 18 14.6163C17.8076 14.6163 17.6201 14.6344 17.4385 14.6688L19.3789 12.8089C19.6094 12.875 19.833 12.9571 20.0488 13.0542C20.3877 13.2066 20.7061 13.3957 21 13.6163V11.2555L23 9.33883V17.6163C23 20.3778 20.7617 22.6163 18 22.6163Z" fill="black" />
                  <path fillRule="evenodd" clipRule="evenodd" d="M0.307463 23.702C-0.0909747 24.0842 -0.10367 24.7175 0.278166 25.1161C0.660002 25.5144 1.29379 25.5273 1.69223 25.1454L25.6922 2.14536C25.91 1.93625 26.0125 1.65195 25.9979 1.37216L25.992 1.30783L25.9862 1.26254C25.9803 1.2258 25.9715 1.1893 25.9618 1.15317L25.9491 1.10898C25.9041 0.971893 25.828 0.842499 25.7215 0.731293C25.533 0.534637 25.283 0.431976 25.0301 0.424286C24.7713 0.416473 24.5096 0.508637 24.3075 0.701996L0.307463 23.702Z" fill="black" />
                </svg>
              )}
            </button>
            <span className="font-['Gabarito'] font-normal leading-[100%] text-center" style={{ fontSize: '16px', minWidth: '80px', maxWidth: '100px', whiteSpace: 'nowrap' }}>
              {isMusicOn ? 'Music On' : 'Music Off'}
            </span>
          </div>

          {/* Sound On/Off button */}
          <div className="flex flex-col items-center" style={{ gap: '12px' }}>
            <button
              onClick={handleToggleSound}
              className="w-[65px] h-[65px] bg-white rounded-full border border-[#E4E4E4] flex items-center justify-center cursor-pointer"
              style={{ boxShadow: '0px 4px 0px #E4E4E4' }}
            >
              <svg width="22" height="24" viewBox="0 0 20 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.56543 2.94629C9.6847 2.93221 9.80514 2.94159 9.91992 2.97363L10.0322 3.0127C10.147 3.06673 10.2483 3.14379 10.3301 3.23828L10.4053 3.33887C10.4961 3.48007 10.5444 3.6436 10.5449 3.81055V16.9336L10.5361 17.0586C10.518 17.1816 10.4735 17.3004 10.4053 17.4062C10.337 17.5122 10.2464 17.6021 10.1406 17.6709L10.0303 17.7324L10.0293 17.7334C9.93978 17.7785 9.84266 17.8069 9.74316 17.8174L9.64258 17.8213H9.6416C9.48887 17.8203 9.33997 17.7812 9.20801 17.709L9.08203 17.626L4.57324 14.082L4.55957 14.0723H1.0625C0.852698 14.0722 0.650912 13.9996 0.490234 13.8701L0.423828 13.8115C0.254572 13.6451 0.159228 13.4196 0.15918 13.1846V7.55957L0.164062 7.47266C0.18157 7.29872 0.250569 7.13343 0.363281 6.99805L0.423828 6.93262C0.593112 6.76624 0.822807 6.67288 1.0625 6.67285H4.55859L4.57227 6.66211L9.12891 3.11914L9.12793 3.11816C9.22351 3.0472 9.33291 2.99691 9.44824 2.96777L9.56543 2.94629ZM16.2666 4.84082C16.4773 4.84082 16.6804 4.91295 16.8418 5.04297L16.9082 5.10254C17.6513 5.83328 18.2316 6.7078 18.6123 7.6709C18.993 8.6341 19.1664 9.66493 19.1201 10.6973C19.0738 11.7296 18.8091 12.7414 18.3438 13.668C17.9365 14.4787 17.3827 15.2088 16.7109 15.8232L16.416 16.0801C16.2536 16.2123 16.049 16.2846 15.8379 16.2842L15.7012 16.2725C15.5663 16.2508 15.4376 16.1993 15.3252 16.1211C15.1752 16.0167 15.0608 15.8697 14.998 15.7002C14.9353 15.5305 14.9269 15.3455 14.9736 15.1709C15.0087 15.0399 15.0738 14.9192 15.1631 14.8174L15.2598 14.7227C15.8723 14.2166 16.3711 13.5907 16.7246 12.8848C17.0339 12.2671 17.2257 11.5998 17.292 10.916L17.3125 10.6211C17.3468 9.83502 17.2152 9.05045 16.9248 8.31738C16.6705 7.67558 16.2992 7.08521 15.8311 6.5752L15.625 6.3623C15.4551 6.19519 15.3595 5.96838 15.3594 5.73242C15.3594 5.49641 15.4551 5.26973 15.625 5.10254C15.795 4.93533 16.0258 4.84085 16.2666 4.84082ZM8.65723 5.7207L5.43555 8.25195C5.27665 8.3773 5.07893 8.4461 4.875 8.44727H1.96582V12.2969H4.875L5.02637 12.3105C5.12573 12.3277 5.22147 12.361 5.30957 12.4092L5.43555 12.4922L8.65723 15.0234L8.73828 15.0869V5.65723L8.65723 5.7207ZM13.5693 7.49414C13.6883 7.49418 13.8061 7.51682 13.916 7.56152C13.9986 7.59515 14.0757 7.6408 14.1445 7.69629L14.2109 7.75488C14.9111 8.45276 15.3061 9.3921 15.3115 10.3721L15.3057 10.5742C15.2789 11.0443 15.1603 11.5059 14.957 11.9336C14.7537 12.3613 14.4698 12.7465 14.1201 13.0684L13.9658 13.2021C13.8752 13.2774 13.7704 13.3347 13.6572 13.3701C13.5441 13.4055 13.4249 13.4181 13.3066 13.4082C13.1884 13.3983 13.0731 13.3661 12.9678 13.3125C12.8885 13.2721 12.8156 13.2202 12.752 13.1592L12.6924 13.0957C12.6164 13.006 12.5586 12.9024 12.5234 12.791C12.4883 12.6797 12.4764 12.5623 12.4873 12.4463C12.4982 12.3303 12.5316 12.2173 12.5869 12.1143C12.6284 12.0369 12.6817 11.9663 12.7441 11.9043L12.8096 11.8447C13.0274 11.664 13.2032 11.4389 13.3232 11.1846C13.4433 10.9302 13.5051 10.6526 13.5049 10.3721L13.4941 10.1816C13.4478 9.74182 13.2482 9.3289 12.9268 9.01465H12.9277C12.8435 8.93185 12.776 8.83366 12.7305 8.72559C12.685 8.61758 12.6621 8.50161 12.6621 8.38477C12.6621 8.26789 12.685 8.15197 12.7305 8.04395C12.776 7.93588 12.8435 7.83768 12.9277 7.75488C13.0119 7.6722 13.1117 7.60633 13.2217 7.56152C13.3318 7.51668 13.4501 7.49414 13.5693 7.49414Z" fill="black" stroke="white" strokeWidth="0.1" />
                {!isSoundOn && (
                  <>
                    <path d="M1.61523 21.1586L17.0879 1.58533" stroke="white" strokeWidth="2" />
                    <path d="M1.56055 19.6145L15.3535 2.16614" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
                  </>
                )}
              </svg>
            </button>
            <span className="font-['Gabarito'] font-normal leading-[100%] text-center" style={{ fontSize: '16px', minWidth: '80px', maxWidth: '100px', whiteSpace: 'nowrap' }}>
              {isSoundOn ? 'Sound On' : 'Sound Off'}
            </span>
          </div>

          {/* Info button */}
          <div className="flex flex-col items-center" style={{ gap: '12px' }}>
            <button
              onClick={toggleInfoModal}
              className="w-[65px] h-[65px] bg-white rounded-full border border-[#E4E4E4] flex items-center justify-center cursor-pointer"
              style={{ boxShadow: '0px 4px 0px #E4E4E4' }}
            >
              <svg width="21" height="22" viewBox="0 0 21 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.5 9.87285C10.2215 9.87285 9.95445 9.98347 9.75754 10.1804C9.56063 10.3773 9.45 10.6444 9.45 10.9228V15.1228C9.45 15.4013 9.56063 15.6684 9.75754 15.8653C9.95445 16.0622 10.2215 16.1728 10.5 16.1728C10.7785 16.1728 11.0456 16.0622 11.2425 15.8653C11.4394 15.6684 11.55 15.4013 11.55 15.1228V10.9228C11.55 10.6444 11.4394 10.3773 11.2425 10.1804C11.0456 9.98347 10.7785 9.87285 10.5 9.87285ZM10.899 5.75685C10.6434 5.65183 10.3566 5.65183 10.101 5.75685C9.97211 5.80682 9.85436 5.88176 9.7545 5.97735C9.66176 6.07941 9.58718 6.19661 9.534 6.32385C9.47522 6.44846 9.44645 6.58511 9.45 6.72285C9.4492 6.86104 9.47569 6.99802 9.52794 7.12595C9.5802 7.25388 9.65719 7.37024 9.7545 7.46835C9.85656 7.5611 9.97376 7.63568 10.101 7.68885C10.2601 7.7542 10.4328 7.77948 10.6039 7.76247C10.775 7.74545 10.9394 7.68667 11.0825 7.59127C11.2255 7.49588 11.343 7.3668 11.4245 7.21537C11.5061 7.06395 11.5491 6.89482 11.55 6.72285C11.5461 6.44484 11.4374 6.17857 11.2455 5.97735C11.1456 5.88176 11.0279 5.80682 10.899 5.75685ZM10.5 0.422852C8.4233 0.422852 6.39323 1.03867 4.66652 2.19242C2.9398 3.34617 1.59399 4.98605 0.799269 6.90467C0.00454948 8.8233 -0.203386 10.9345 0.201759 12.9713C0.606904 15.0081 1.60693 16.879 3.07538 18.3475C4.54383 19.8159 6.41476 20.8159 8.45156 21.2211C10.4884 21.6262 12.5996 21.4183 14.5182 20.6236C16.4368 19.8289 18.0767 18.483 19.2304 16.7563C20.3842 15.0296 21 12.9996 21 10.9228C21 9.54397 20.7284 8.17859 20.2007 6.90467C19.6731 5.63075 18.8996 4.47324 17.9246 3.49823C16.9496 2.52321 15.7921 1.74979 14.5182 1.22212C13.2443 0.694442 11.8789 0.422852 10.5 0.422852ZM10.5 19.3228C8.83864 19.3228 7.21459 18.8302 5.83321 17.9072C4.45184 16.9842 3.37519 15.6723 2.73942 14.1374C2.10364 12.6025 1.93729 10.9135 2.26141 9.28409C2.58552 7.65465 3.38555 6.15791 4.56031 4.98315C5.73507 3.80839 7.2318 3.00837 8.86125 2.68425C10.4907 2.36014 12.1796 2.52649 13.7145 3.16226C15.2494 3.79804 16.5613 4.87469 17.4843 6.25606C18.4073 7.63743 18.9 9.26149 18.9 10.9228C18.9 13.1504 18.0152 15.2867 16.4397 16.8625C14.8643 18.4383 12.7278 19.3228 10.5 19.3228Z" fill="black" />
              </svg>
            </button>
            <span className="font-['Gabarito'] font-normal leading-[100%] text-center" style={{ fontSize: '16px', minWidth: '80px', maxWidth: '100px', whiteSpace: 'nowrap' }}>
              Info
            </span>
          </div>

          {/* Quit Game button */}
          <div className="flex flex-col items-center" style={{ gap: '12px' }}>
            <button
              onClick={handleQuit}
              className="w-[65px] h-[65px] bg-white rounded-full border border-[#E4E4E4] flex items-center justify-center cursor-pointer"
              style={{ boxShadow: '0px 4px 0px #E4E4E4' }}
            >
              <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13.7656 16.605V18.605C13.7656 19.4006 13.4496 20.1637 12.8869 20.7263C12.3243 21.2889 11.5613 21.605 10.7656 21.605H6.76562C5.96998 21.605 5.20691 21.2889 4.6443 20.7263C4.0817 20.1637 3.76563 19.4006 3.76562 18.605V6.60498C3.76563 5.80933 4.0817 5.04627 4.6443 4.48366C5.20691 3.92105 5.96998 3.60498 6.76562 3.60498H10.7656C11.5613 3.60498 12.3243 3.92105 12.8869 4.48366C13.4496 5.04627 13.7656 5.80933 13.7656 6.60498V8.60498" stroke="#FB4A4A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M20.7656 12.335H8.76562" stroke="#FB4A4A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M17.166 8.73486L20.766 12.3349L17.166 15.9349" stroke="#FB4A4A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <span className="font-['Gabarito'] font-normal leading-[100%] text-center" style={{ fontSize: '16px', minWidth: '80px', maxWidth: '100px', whiteSpace: 'nowrap' }}>
              Quit
            </span>
          </div>
        </div>

        {/* Resume button */}
        <button
          onClick={() => { onResume(); }}
          className="w-full h-[42px] bg-[#4AC1BD] border border-[#25A49F] rounded-[15px] flex items-center justify-center cursor-pointer"
          style={{ boxShadow: '0px 3px 0px #25A49F' }}
        >
          <span className="font-['Gabarito'] text-[16px] font-medium text-white">
            Resume
          </span>
        </button>
      </div>
    </div>
  );
};

export default PauseModal;
