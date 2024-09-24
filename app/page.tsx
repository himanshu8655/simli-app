"use client";
import React, { useState } from "react";
import AvatarInteraction from "./AvatarInteraction";
import DottedFace from "./DottedFace";
import SimliHeaderLogo from "./Logo";
import Navbar from "./Navbar";
//import { Avatar } from './types';

// Update the Avatar interface to include an image URL
interface Avatar {
  name: string;
  simli_faceid: string;
  elevenlabs_voiceid: string;
  initialPrompt: string;
  imageUrl: string;
  videoUrl: string;
}

// Updated JSON structure for avatar data with image URLs

const avatar = {
  name: "Vera",
  simli_faceid: "veraforseries",
  elevenlabs_voiceid: "VSxf8UVk5UMU5uQr9hLp",
  initialPrompt:
    "Hey! This is Vera. I am here for an interactive demo. Go ahead and ask me some questions!",
};

const Demo: React.FC = () => {
  const [error, setError] = useState("");
  const [showDottedFace, setShowDottedFace] = useState(true);

  const [isRecording, setIsRecording] = useState(false);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);

  const onStart = () => {
    console.log("Setting setshowDottedface to false...");
    setShowDottedFace(false);
  };

  return (
    <div className="flex justify-center h-auto w-full">
      <div>
        <div>
          {/* {showDottedFace && <DottedFace />} */}
          <AvatarInteraction
            simli_faceid={avatar.simli_faceid}
            elevenlabs_voiceid={avatar.elevenlabs_voiceid}
            initialPrompt={avatar.initialPrompt}
            onStart={onStart}
            showDottedFace={showDottedFace}
          />
        </div>
      </div>

      {error && (
        <p className="mt-6 text-red-500 bg-red-100 border border-red-400 rounded p-3">
          {error}
        </p>
      )}
    </div>
  );
};

export default Demo;
