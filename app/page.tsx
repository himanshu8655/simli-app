'use client';
import React, { useState } from 'react';
import AvatarInteraction from './AvatarInteraction';
import DottedFace from './DottedFace';
import SimliHeaderLogo from './Logo';
import Navbar from './Navbar';
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
  initialPrompt: "Say this introduction: Welcome to your Vera, the interactive demo for Vera that you can start building from. You can swap me out with other characters.",
}



const Demo: React.FC = () => {
  const [error, setError] = useState('');
  const [showDottedFace, setShowDottedFace] = useState(true);

  const [isRecording, setIsRecording] = useState(false);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);

  const onStart = () => {
    console.log("Setting setshowDottedface to false...")
    setShowDottedFace(false);
  };

  return (
    <div className="bg-black min-h-screen flex flex-col items-center font-abc-repro font-normal text-sm text-white p-8">
      {/* <SimliHeaderLogo /> */}
      <Navbar />
      <div className="absolute top-[32px] right-[32px]">
        <text className="font-bold mb-8 text-xl leading-8">Talk with Vera</text>
      </div>
      <div className="flex flex-col items-center gap-6 bg-effect15White p-6 pb-[40px] rounded-xl w-full">
        <div>
          {showDottedFace && <DottedFace />}
          <AvatarInteraction
            simli_faceid={avatar.simli_faceid}
            elevenlabs_voiceid={avatar.elevenlabs_voiceid}
            initialPrompt={avatar.initialPrompt}
            onStart={onStart}
            showDottedFace={showDottedFace}
          />
        </div>
        
      </div>

      <div className="max-w-[350px] font-thin flex flex-col items-center ">
        <span className="font-bold mb-[8px] leading-5 "> Hey it's Vera </span>
        <ul className="list-decimal list-inside max-w-[350px] ml-[6px] mt-2">
          <li className="mb-1">
          I'm your personal entrepreneurial mentor ready to call or text at anytime to brainstorm, guide and advise you in starting or scaling any business!
          </li>
          <li className="mb-1">
          By joining The Founder Series you get access to me and my warm network of professionals, executives, students and resources who are ready to help you with anything you need on your startup journey.
          </li>
          </ul>
          {/* <li className="mb-1">
            You can replace the avatar's face and voice and initial prompt with your own. Do this by editing <code>app/page.tsx</code>.
          </li>
        </ul>
        <span className=" mt-[16px]">You can now deploy this app to Vercel, or incorporate it as part of your existing project.</span> */}

        {/*  <p>You can replace the character by <a href="https://simli.com">creating your own</a> or finding one that you like in the <a href="https://docs.simli.com">docs</a>.</p> */}
      </div>
      {error && <p className="mt-6 text-red-500 bg-red-100 border border-red-400 rounded p-3">{error}</p>}
    </div>
  );
};

export default Demo;