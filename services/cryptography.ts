import crypto from 'crypto'

export function Encrypt(input_txt:string,initVector:Uint8Array) {
    // get key from env.local file string into a buffer
    const secretKey = process.env.MONGODB_SECRET_KEY ? Buffer.from(process.env.MONGODB_SECRET_KEY, 'base64') : Buffer.alloc(0);
 
    // the cipher function <https://stackabuse.com/encoding-and-decoding-base64-strings-in-node-js/>
    const cipher = crypto.createCipheriv("aes-256-cbc", secretKey, initVector);
    let output_txt = cipher.update(input_txt,"utf-8","hex");
    output_txt += cipher.final("hex");

    return output_txt;
}

export function Decrypt(input_txt:string,initVector:Uint8Array) {
    // get key from env.local file string into a buffer
    const secretKey = process.env.MONGODB_SECRET_KEY ? Buffer.from(process.env.MONGODB_SECRET_KEY, 'base64') : Buffer.alloc(0);

    const decipher = crypto.createDecipheriv("aes-256-cbc", secretKey, initVector);
    let output_txt = decipher.update(input_txt, "hex", "utf-8");
    output_txt += decipher.final("utf8");

    return output_txt;
}

export function sha256(data: string) {
    return crypto.createHash("sha256").update(data, "binary").digest("base64");
    //                                               ------  binary: hash the byte string - cross platform compatibility
  }