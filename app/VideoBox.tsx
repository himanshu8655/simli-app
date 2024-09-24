import veraFace from "../media/Vera_Headshot_9-16.png";

// block relative aspect-w-16 aspect-h-9 h-[70dvh] bg-[url('../media/Vera_headshot.png')]
// bg-no-repeat bg-cover bg-center w-full items-center justify-center
// width: 100%;
//     height: 340px;
//     margin-top: 1.9rem;
//     margin-bottom: -37px;
//     border-radius: 9999px;

export default function VideoBox(props: any) {
  return (
    <div className="bg-[url('../media/Vera_Headshot_9-16.png')] max-h-[856px] min-h-[856px] max-w-[550px] h-svh bg-no-repeat bg-cover bg-center w-full content-start">
      {/* className="rounded-full overflow-hidden h-[320px] mt-[2.5rem]" */}
      <div className="overflow-hidden flex justify-center content-center h-[400px] pt-[0.5rem] mt-[2.55rem]">
        {/* className="flex content-center justify-center h-[320px] scale-105 -translate-x-0.5" */}
        <video
          className="brightness-110 h-[400px] min-w-[400px]"
          style={{
            transform: "scale(1.055) translateX(-0.28rem)",
            filter: "contrast(1)",
          }}
          ref={props.video}
          autoPlay
        ></video>
      </div>

      <audio ref={props.audio} autoPlay></audio>
    </div>
  );
}
