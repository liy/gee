interface Window {
  api: {
    send: (data: any) => void;
    onReceive: (callback: (data:any) => void ) => void;
    git: (data: any) => void;
  };
}
