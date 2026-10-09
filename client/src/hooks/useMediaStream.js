import { useState, useEffect, useRef, useCallback } from 'react';

export const useMediaStream = () => {
  const [localStream, setLocalStream] = useState(null);
  const [micEnabled, setMicEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioDevices, setAudioDevices] = useState([]);
  const [videoDevices, setVideoDevices] = useState([]);
  const [selectedAudioId, setSelectedAudioId] = useState('');
  const [selectedVideoId, setSelectedVideoId] = useState('');
  const [audioLevel, setAudioLevel] = useState(0); // 0 to 100 for speaking indicator
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [streamError, setStreamError] = useState(null);

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);

  // Get available devices
  const updateDeviceList = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.enumerateDevices) return;
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter((d) => d.kind === 'audioinput');
      const videoInputs = devices.filter((d) => d.kind === 'videoinput');

      setAudioDevices(audioInputs);
      setVideoDevices(videoInputs);

      if (audioInputs.length && !selectedAudioId) {
        setSelectedAudioId(audioInputs[0].deviceId);
      }
      if (videoInputs.length && !selectedVideoId) {
        setSelectedVideoId(videoInputs[0].deviceId);
      }
    } catch (err) {
      console.warn('Error enumerating devices:', err);
    }
  }, [selectedAudioId, selectedVideoId]);

  // Start media stream
  const startLocalStream = useCallback(async (audioId, videoId) => {
    try {
      setStreamError(null);
      const constraints = {
        audio: audioId ? { deviceId: { exact: audioId } } : true,
        video: videoId
          ? { deviceId: { exact: videoId }, width: { ideal: 1280 }, height: { ideal: 720 } }
          : { width: { ideal: 1280 }, height: { ideal: 720 } },
      };

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (err) {
        console.warn('Could not get video+audio. Attempting audio only fallback...', err);
        // Fallback to audio only if webcam is missing or denied
        stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        setVideoEnabled(false);
      }

      setLocalStream(stream);

      // Setup audio analyzer for speaking indicator
      setupAudioAnalyzer(stream);
      await updateDeviceList();

      return stream;
    } catch (err) {
      console.error('Failed to get media devices:', err);
      setStreamError(err.message || 'Permission denied or media hardware unavailable');
      return null;
    }
  }, [updateDeviceList]);

  // Audio level analyzer
  const setupAudioAnalyzer = (stream) => {
    try {
      const audioTrack = stream.getAudioTracks()[0];
      if (!audioTrack) return;

      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContextClass();
      }

      const audioCtx = audioContextRef.current;
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.5;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(new MediaStream([audioTrack]));
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const checkVolume = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const normalized = Math.min(100, Math.round((average / 128) * 100));
        setAudioLevel(normalized);
        setIsSpeaking(normalized > 15);

        animFrameRef.current = requestAnimationFrame(checkVolume);
      };

      checkVolume();
    } catch (err) {
      console.warn('Audio analyzer error:', err);
    }
  };

  // Toggle Microphone
  const toggleMic = useCallback(() => {
    if (!localStream) return;
    const audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setMicEnabled(audioTrack.enabled);
    }
  }, [localStream]);

  // Toggle Video / Camera
  const toggleVideo = useCallback(() => {
    if (!localStream) return;
    const videoTrack = localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setVideoEnabled(videoTrack.enabled);
    }
  }, [localStream]);

  // Switch Audio Device
  const switchAudioDevice = async (deviceId) => {
    setSelectedAudioId(deviceId);
    if (localStream) {
      const currentVideoTrack = localStream.getVideoTracks()[0];
      try {
        const newAudioStream = await navigator.mediaDevices.getUserMedia({
          audio: { deviceId: { exact: deviceId } },
        });
        const newAudioTrack = newAudioStream.getAudioTracks()[0];

        // Replace track in localStream
        const oldAudioTrack = localStream.getAudioTracks()[0];
        if (oldAudioTrack) {
          localStream.removeTrack(oldAudioTrack);
          oldAudioTrack.stop();
        }
        localStream.addTrack(newAudioTrack);
        setupAudioAnalyzer(localStream);
        return newAudioTrack;
      } catch (err) {
        console.error('Error switching audio device:', err);
      }
    }
  };

  // Switch Video Device
  const switchVideoDevice = async (deviceId) => {
    setSelectedVideoId(deviceId);
    if (localStream) {
      try {
        const newVideoStream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: deviceId }, width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        const newVideoTrack = newVideoStream.getVideoTracks()[0];

        const oldVideoTrack = localStream.getVideoTracks()[0];
        if (oldVideoTrack) {
          localStream.removeTrack(oldVideoTrack);
          oldVideoTrack.stop();
        }
        localStream.addTrack(newVideoTrack);
        setVideoEnabled(true);
        return newVideoTrack;
      } catch (err) {
        console.error('Error switching video device:', err);
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close().catch(() => {});
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [localStream]);

  return {
    localStream,
    setLocalStream,
    micEnabled,
    videoEnabled,
    audioDevices,
    videoDevices,
    selectedAudioId,
    selectedVideoId,
    audioLevel,
    isSpeaking,
    streamError,
    startLocalStream,
    toggleMic,
    toggleVideo,
    switchAudioDevice,
    switchVideoDevice,
  };
};
