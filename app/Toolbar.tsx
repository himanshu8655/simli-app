import React from "react";
import microphoneIcon from "../media/microphone_icon.png";
import videoIcon from "../media/camera_icon.png";
import endCallIcon from "../media/endcall-icon.png";

interface ToolbarProps {
  isMuted: boolean;
  isVideoOff: boolean;
  isLoading: boolean;
  onMuteToggle: () => void;
  onVideoToggle: () => void;
  onEndCall: () => void;
  error?: string;
}

const Toolbar: React.FC<ToolbarProps> = ({
  isMuted,
  isVideoOff,
  isLoading,
  onMuteToggle,
  onVideoToggle,
  onEndCall,
  error,
}) => {
  return (
    <div className="flex container flex-row justify-evenly max-w-[550px] gap-5 opacity-90">
      {/* Control Buttons */}
      {/* Microphone Button */}
      <button
        onClick={onMuteToggle}
        className={`flex flex-col items-center justify-center bg-gray-800 text-white p-4 rounded-full shadow-md transition-all duration-300
            ${isMuted ? "bg-red-600 hover:bg-red-700" : "hover:bg-gray-700"}
            ${isLoading ? "cursor-not-allowed opacity-50" : ""}
            sm:p-5 sm:rounded-full
            md:p-6
          `}
        aria-label={isMuted ? "Unmute Microphone" : "Mute Microphone"}
      >
        <img
          src={microphoneIcon.src}
          alt="Microphone Icon"
          className="lg:h-10 lg:w-10 sm:h-8 sm:w-8"
        />
      </button>

      {/* Camera Button */}
      <button
        onClick={onVideoToggle}
        className={`flex flex-col items-center justify-center bg-gray-800 text-white p-4 rounded-full shadow-md transition-all duration-300
            ${isVideoOff ? "bg-red-600 hover:bg-red-700" : "hover:bg-gray-700"}
            ${isLoading ? "cursor-not-allowed opacity-50" : ""}
            sm:p-5 sm:rounded-full
            md:p-6
          `}
        aria-label={isVideoOff ? "Turn On Camera" : "Turn Off Camera"}
      >
        <img
          src={videoIcon.src}
          alt="Camera Icon"
          className="lg:h-10 lg:w-10 sm:h-8 sm:w-8"
        />
      </button>
      {/* End Call Button */}
      <button
        onClick={onEndCall}
        className={`flex flex-col items-center justify-center bg-red-600 text-white p-4 rounded-full shadow-md transition-all duration-300 hover:bg-red-700
            ${isLoading ? "cursor-not-allowed opacity-50" : ""}
            sm:p-5 sm:rounded-full
            md:p-6
          `}
        aria-label="End Call"
      >
        <img
          src={endCallIcon.src}
          alt="End Call Icon"
          className="lg:h-10 lg:w-10 sm:h-8 sm:w-8"
        />
      </button>

      {/* Error Message */}
      {error && (
        <p className="text-red-500 text-center font-semibold">{error}</p>
      )}
    </div>
  );
};

interface ToolbarButtonProps {
  onClick: () => void;
  disabled: boolean;
  ariaLabel: string;
  iconSrc: string;
  label: string;
  isActive?: boolean;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  onClick,
  disabled,
  ariaLabel,
  iconSrc,
  label,
  isActive = false,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-pressed={isActive}
      className={`flex flex-col items-center justify-center bg-gray-800 text-white p-3 rounded-full shadow-md transition-colors duration-300 
          ${isActive ? "bg-red-600 hover:bg-red-700" : "hover:bg-gray-700"}
          ${disabled ? "cursor-not-allowed opacity-50" : ""}
          sm:p-4 md:p-5
        `}
    >
      <img
        src={iconSrc}
        alt={ariaLabel}
        className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 mb-1"
      />
      <span className="text-xs sm:text-sm md:text-base font-medium">
        {label}
      </span>
    </button>
  );
};

export default Toolbar;
