'use client'

import { useUser } from "@clerk/nextjs";
import {
  CallControls,
  CallingState,
  CallParticipantsList,
  CallStatsButton,
  PaginatedGridLayout,
  SpeakerLayout,
  useCall,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import { useState } from "react";
import Loading from "./Loading";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ChartBarIcon } from "@heroicons/react/24/solid";
import { LayoutList, Users } from "lucide-react";
import EndCallButton from "./EndCallButton";
import GroupDashboard from "./group-meeting/Group-Dashboard";
import useDistractionDetection from "@/hooks/useDistractionDetection";

type CallLayoutType = "grid" | "speaker-left" | "speaker-right";

const MeetingRoom = () => {
  const [layout, setLayout] = useState<CallLayoutType>("speaker-left");
  const [showParticipants, setShowParticipants] = useState(false);
  const [showGroupDashboard, setShowGroupDashboard] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useUser();

  const call = useCall();
  if (!call)
    throw new Error("useStreamCall must be used within a StreamCall component.");

  const { useCallCallingState, useLocalParticipant, useCameraState } =
    useCallStateHooks();

  const callingState = useCallCallingState();
  const localParticipant = useLocalParticipant();
  const { isMute: isCameraOff, mediaStream: cameraMediaStream } = useCameraState();

  // Host detection — same pattern as EndCallButton.tsx
  const isMeetingOwner =
    localParticipant &&
    call.state.createdBy &&
    localParticipant.userId === call.state.createdBy.id;

  // Run distraction detection on raw camera stream and push metrics to Supabase
  useDistractionDetection({
    videoStream: cameraMediaStream,
    meetingId: call.id,
    participantId: user?.id ?? "",
    name: user?.fullName ?? user?.username ?? "Unknown",
    isCameraOn: !isCameraOff,
  });

  if (!user) return null;
  if (callingState !== CallingState.JOINED) return <Loading />;

  const CallLayout = () => {
    switch (layout) {
      case "grid":
        return <PaginatedGridLayout />;
      case "speaker-right":
        return <SpeakerLayout participantsBarPosition="left" />;
      default:
        return <SpeakerLayout participantsBarPosition="right" />;
    }
  };

  return (
    <section className="relative h-screen w-full overflow-hidden pt-4 text-white">
      <Button
        className="ml-5 font-semibold bg-gray-900 hover:scale-110 rounded-3xl"
        onClick={() => {
          const meetingLink = `${process.env.NEXT_PUBLIC_BASE_URL}${pathname}`;
          navigator.clipboard.writeText(meetingLink);
          toast("Meeting Link Copied", {
            duration: 3000,
            className: "!bg-gray-300 !rounded-3xl !py-8 !px-5 !justify-center",
          });
        }}
      >
        Invite People
      </Button>

      <div className="relative flex size-full items-center justify-center">
        {/* Video layout */}
        <div className="flex size-full max-w-[1000px] items-center animate-fade-in">
          <CallLayout />
        </div>

        {/* Participants sidebar */}
        <div
          className={cn("h-[calc(100vh-86px)] hidden ml-2", {
            "show-block": showParticipants,
          })}
        >
          <CallParticipantsList onClose={() => setShowParticipants(false)} />
        </div>

        {/* Group Dashboard sidebar — host only */}
        {isMeetingOwner && (
          <div className="absolute right-4 top-4">
            <GroupDashboard
              meetingId={call.id}
              isOpen={showGroupDashboard}
              onClose={() => setShowGroupDashboard(false)}
            />
          </div>
        )}
      </div>

      {/* Call controls */}
      <div className="fixed bottom-0 flex w-full items-center justify-center gap-5">
        <CallControls onLeave={() => router.push(`/`)} />

        <DropdownMenu>
          <div className="flex items-center">
            <DropdownMenuTrigger className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]">
              <LayoutList size={20} className="text-white" />
            </DropdownMenuTrigger>
          </div>
          <DropdownMenuContent className="border-black bg-black text-white">
            {["Grid", "Speaker-Left", "Speaker-Right"].map((item, index) => (
              <div key={index}>
                <DropdownMenuItem
                  onClick={() => setLayout(item.toLowerCase() as CallLayoutType)}
                >
                  {item}
                </DropdownMenuItem>
                <DropdownMenuSeparator className="border-black" />
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <CallStatsButton />

        <button onClick={() => setShowParticipants((prev) => !prev)}>
          <div className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]">
            <Users size={20} className="text-white" />
          </div>
        </button>

        {/* Group Dashboard toggle — host only */}
        {isMeetingOwner && (
          <button
            onClick={() => setShowGroupDashboard((prev) => !prev)}
            title="Group Dashboard"
          >
            <div
              className={cn(
                "cursor-pointer rounded-2xl px-4 py-2 transition-colors",
                showGroupDashboard
                  ? "bg-purple-600 hover:bg-purple-700"
                  : "bg-[#19232d] hover:bg-[#4c535b]"
              )}
            >
              <ChartBarIcon className="w-5 h-5 text-white" />
            </div>
          </button>
        )}

        <EndCallButton />
      </div>
    </section>
  );
};

export default MeetingRoom;