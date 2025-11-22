declare module 'flutterwave-node-v3' {
  export default class Flutterwave {
    constructor(publicKey: string, secretKey: string);
    Payment: {
      initiate: (payload: Record<string, unknown>) => Promise<{
        data: {
          link?: string;
          id?: number | string;
        };
      }>;
    };
  }
}
