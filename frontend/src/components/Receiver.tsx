import { useEffect,  } from "react";

export function Receiver() {
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");
    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "receiver" }));

      socket.onmessage = async (event) => {
        const message = JSON.parse(event.data);
        if (message.type === "createOffer") {
          const pc = new RTCPeerConnection();
          pc.setRemoteDescription(message.sdp);

          pc.ontrack = (event) => {
            const video=document.createElement("video");
            document.body.appendChild(video);
            
              video.srcObject = new MediaStream([event.track]);
              video.play();
            
          }

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          pc.onicecandidate = (event) => {
            if (event.candidate) {
              socket.send(
                JSON.stringify({ type: "iceCandidate", candidate: event.candidate })
              );
            }
          };
          socket.send(
            JSON.stringify({ type: "createAnswer", sdp: pc.localDescription })
          );
        }
        else if (message.type === "iceCandidate") {
          const pc = new RTCPeerConnection();
          pc.addIceCandidate(message.candidate);}
      };
    };
  }, []);

  return(
    
    <>
    <div>
    <div>Receiver</div>
    </div>
    </>

  )
   
}
