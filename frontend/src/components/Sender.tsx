import { useEffect, useState } from "react";

export function Sender() {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");
    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "sender" }));
    };
    setSocket(socket);
  }, []);

  async function startSendingVideo() {
    if(!socket) return;
    const pc=new RTCPeerConnection();
    pc.onnegotiationneeded=async()=>{
      console.log("negotiation needed");
      
      const offer=await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket?.send(JSON.stringify({type:"createOffer",sdp:pc.localDescription}))
    }



    pc.onicecandidate=(event)=>{
      console.log(event);
      
      if(event.candidate){
        socket?.send(JSON.stringify({type:"iceCandidate",candidate:event.candidate}));
    }}

    socket.onmessage=async(event)=>{
      const message=JSON.parse(event.data);
      if(message.type==="createAnswer"){
        await pc.setRemoteDescription(message.sdp);
      }
      else if(message.type==="iceCandidate"){
        pc.addIceCandidate(message.candidate);
      }
    }

    const stream=await navigator.mediaDevices.getUserMedia({video:true, audio:true});
    pc.addTrack(stream.getVideoTracks()[0])
    const video=document.createElement("video");
    document.body.appendChild(video); 
    video.srcObject=stream;
    video.play();

  }

  return (
    <div>
      <button onClick={startSendingVideo}>Sender</button>
    </div>
  );
}
