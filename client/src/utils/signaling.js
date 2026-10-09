// WebRTC STUN Configuration
export const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
  iceCandidatePoolSize: 10,
};

// File Chunk size for RTCDataChannel (16KB is safe across all browsers)
export const FILE_CHUNK_SIZE = 16 * 1024;

/**
 * Creates an RTCPeerConnection with configured STUN servers
 */
export const createPeerConnection = () => {
  return new RTCPeerConnection(ICE_SERVERS);
};

/**
 * Splits a File or Blob into ArrayBuffer chunks
 */
export const sliceFile = async (file, onChunk) => {
  let offset = 0;
  let chunkIndex = 0;
  const totalChunks = Math.ceil(file.size / FILE_CHUNK_SIZE);

  while (offset < file.size) {
    const slice = file.slice(offset, offset + FILE_CHUNK_SIZE);
    const buffer = await slice.arrayBuffer();
    onChunk({
      chunkIndex,
      totalChunks,
      data: buffer,
      isLast: offset + FILE_CHUNK_SIZE >= file.size,
    });
    offset += FILE_CHUNK_SIZE;
    chunkIndex++;
  }
};
