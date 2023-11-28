export const SIGNAL_SERVER_URL = "http://localhost:3007/";
export const MEDIA_STREAM_CONSTRAINTS = {
  video: true,
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
};
export const PC_CONFIG = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
    {
      urls: "turn:120.77.253.101:3478",
      username: "inter_user",
      credential: "power_turn",
    },
  ],
};
export const OFFER_OPTIONS = {
  offerToReceiveVideo: 1,
  offerToReceiveAudio: 1,
};
