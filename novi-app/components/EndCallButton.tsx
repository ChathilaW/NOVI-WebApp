'use client'
// this can be use for engagement dashboard for host
import { useCall, useCallStateHooks } from "@stream-io/video-react-sdk";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

const EndCallButton = () => {
     const router = useRouter();
    const call = useCall();
    if (!call)
        throw new Error(
          'useStreamCall must be used within a StreamCall component.',
    );

    const { useLocalParticipant } = useCallStateHooks();

    const localParticipant = useLocalParticipant();

    //checking if it's the meeting owner
    const isMeetingOwner =
    localParticipant &&
    call.state.createdBy &&
    localParticipant.userId === call.state.createdBy.id;

    if (!isMeetingOwner) return null;

    const endCall = async () => {
        await call.endCall();
        router.push('/');
    };

    return (
        <Button onClick={endCall} className="bg-red-500 cursor-pointer">
          End call for everyone
        </Button>
      );

}

export default EndCallButton