import io from "socket.io-client";

type SocketConfig = {
  path: string;
  query: {
    username: string;
    roomId: string;
  };
};

class Socket {
  private url: string;
  private socketConfig: SocketConfig;
  private socket: any;

  constructor(url: string, socketConfig: SocketConfig) {
    this.url = url;
    this.socketConfig = socketConfig;
    this.connect();
  }

  private connect() {
    this.socket = io.connect(this.url, this.socketConfig);
  }
}
