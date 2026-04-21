import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import Peer from "simple-peer";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useLanguage } from "../context/LanguageContext";
import { PhoneOff, Mic, MicOff, Video, VideoOff, Camera } from "lucide-react";
import { getSocketUrl } from "../utils/socket";

export default function VideoCallRoom() {
  const { callId } = useParams(); // This will be the UID of the person we're calling
  const navigate = useNavigate();
  const { t, tf } = useLanguage();
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [peerStream, setPeerStream] = useState<MediaStream | null>(null);
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [callerName, setCallerName] = useState("");
  
  const socketRef = useRef<Socket | null>(null);
  const userVideo = useRef<HTMLVideoElement>(null);
  const partnerVideo = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<Peer.Instance | null>(null);

  useEffect(() => {
    const fetchPartner = async () => {
      if (callId) {
        const d = await getDoc(doc(db, "users", callId));
        if (d.exists()) setCallerName(d.data().displayName);
      }
    };
    fetchPartner();

    const socketUrl = getSocketUrl();
    socketRef.current = io(socketUrl, { transports: ["websocket", "polling"] });
    
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(s => {
      setStream(s);
      if (userVideo.current) userVideo.current.srcObject = s;

      socketRef.current?.emit("register_user", auth.currentUser?.displayName || auth.currentUser?.email);
      
      // If we are the one initiating the call (callId is present in URL)
      // We need a way to know if we are the caller or receiver.
      // For simplicity, let's assume if you go to /videollamada/:targetUid you are the caller.
      
      // In a real app we'd need a more robust Handshake.
      // Let's implement a "waiting for target to be online" or just try to call.
    });

    return () => {
      stream?.getTracks().forEach(t => t.stop());
      socketRef.current?.disconnect();
    };
  }, [callId]);

  const initiateCall = (targetSocketId: string) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream!,
    });

    peer.on("signal", data => {
      socketRef.current?.emit("offer", { target: targetSocketId, caller: auth.currentUser?.uid, sdp: data });
    });

    peer.on("stream", s => {
      setPeerStream(s);
      if (partnerVideo.current) partnerVideo.current.srcObject = s;
    });

    peerRef.current = peer;
  };

  useEffect(() => {
    socketRef.current?.on("offer", (data) => {
      const peer = new Peer({
        initiator: false,
        trickle: false,
        stream: stream!,
      });

      peer.on("signal", sdp => {
        socketRef.current?.emit("answer", { target: data.caller, sdp });
      });

      peer.on("stream", s => {
        setPeerStream(s);
        if (partnerVideo.current) partnerVideo.current.srcObject = s;
      });

      peer.signal(data.sdp);
      peerRef.current = peer;
    });

    socketRef.current?.on("answer", data => {
      peerRef.current?.signal(data.sdp);
    });

    socketRef.current?.on("ice-candidate", data => {
      peerRef.current?.signal(data.candidate);
    });
  }, [stream]);

  const toggleMic = () => {
    if (stream) {
      stream.getAudioTracks()[0].enabled = !micOn;
      setMicOn(!micOn);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks()[0].enabled = !videoOn;
      setVideoOn(!videoOn);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-brand-primary/5 blur-[120px] rounded-full" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-6xl h-[70vh] relative z-10">
        <div className="relative bg-neutral-900 rounded-3xl overflow-hidden border border-neutral-800 flex items-center justify-center">
          <video ref={userVideo} autoPlay muted playsInline className="w-full h-full object-cover" />
          <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold border border-white/10">
            {tf("hero_description").includes("Ayuuk") ? "Jää'y" : "Tú"}
          </div>
        </div>

        <div className="relative bg-neutral-900 rounded-3xl overflow-hidden border border-neutral-800 flex items-center justify-center">
          {peerStream ? (
            <video ref={partnerVideo} autoPlay playsInline className="w-full h-full object-cover" />
          ) : (
            <div className="text-center space-y-4">
              <div className="w-24 h-24 rounded-full bg-brand-primary/20 flex items-center justify-center text-3xl font-bold text-brand-primary mx-auto animate-pulse">
                {callerName?.[0] || "?"}
              </div>
              <p className="text-neutral-500 font-medium">{t.videoCall.connecting} {callerName}...</p>
            </div>
          )}
          <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold border border-white/10">
            {callerName || "Compañero"}
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center gap-6 relative z-10">
        <button 
          onClick={toggleMic}
          className={`p-5 rounded-3xl transition-all ${micOn ? 'bg-neutral-800 hover:bg-neutral-700' : 'bg-red-500/20 text-red-500 border border-red-500'}`}
        >
          {micOn ? <Mic /> : <MicOff />}
        </button>
        
        <button 
          onClick={() => {
            stream?.getTracks().forEach(t => t.stop());
            navigate("/contactos");
          }}
          className="p-6 rounded-[2rem] bg-red-600 hover:bg-red-500 hover:scale-110 transition-all shadow-xl shadow-red-600/20"
        >
          <PhoneOff className="w-8 h-8" />
        </button>

        <button 
          onClick={toggleVideo}
          className={`p-5 rounded-3xl transition-all ${videoOn ? 'bg-neutral-800 hover:bg-neutral-700' : 'bg-red-500/20 text-red-500 border border-red-500'}`}
        >
          {videoOn ? <Video /> : <VideoOff />}
        </button>
      </div>

      <div className="absolute top-10 right-10 z-10 md:flex flex-col gap-2 hidden">
        <p className="text-brand-primary font-mono text-sm uppercase tracking-widest ring-1 ring-brand-primary/50 px-3 py-1 rounded-full">
          Secure Stream
        </p>
      </div>
    </div>
  );
}
