# Audio Capture Implementation for Assessment Video Recording

## Overview

This implementation enables the video recording in assessments to capture both microphone audio (candidate's voice) and system audio (AI speech synthesis) simultaneously. This provides a complete audio-visual record of the assessment interaction.

**Available for:**

- Onboarding Assessments (`/app/candidate/assessments/onboarding/assessment/`)
- JD Assessments (`/app/candidate/assessments/jd/assessment/`)

## How It Works

### 1. Audio Context Setup

The assessment page initializes an `AudioContext` when the component mounts:

```typescript
const audioContextRef = useRef<AudioContext | null>(null);
const systemAudioSourceRef = useRef<MediaElementAudioSourceNode | null>(null);

const initializeAudioContext = useCallback(() => {
  if (!audioContextRef.current) {
    audioContextRef.current = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
  }
  return audioContextRef.current;
}, []);
```

### 2. System Audio Capture

When the `speakText` function plays synthesized speech, it creates a `MediaElementAudioSourceNode` from the audio element:

```typescript
const speakText = async (text: string) => {
  // ... synthesize speech and create audio element ...

  // Create audio source for system audio capture
  const audioContext = audioContextRef.current;
  if (audioContext && audioRef.current) {
    const audioSource = audioContext.createMediaElementSource(audioRef.current);
    systemAudioSourceRef.current = audioSource;

    // Reconnect the audio source to the speakers so the user can hear it
    audioSource.connect(audioContext.destination);
  }
};
```

**Important Note**: When you create a `MediaElementAudioSourceNode` from an audio element, it disconnects the audio element from its default destination (the speakers). We must explicitly reconnect it to `audioContext.destination` so the user can hear the synthesized speech while it's also captured for video recording.

### 3. Video Feed Integration

The `VideoFeed` component receives the audio context and source as props:

```typescript
interface VideoFeedProps {
  onStreamReady: (ready: boolean) => void;
  enableFaceDetection?: boolean;
  audioContext?: AudioContext | null;
  audioSource?: MediaElementAudioSourceNode | null;
}
```

### 4. Audio Mixing

The video feed creates a mixed audio stream that combines:

- **Microphone audio**: Captured from the user's microphone
- **System audio**: Captured from the AI speech synthesis

```typescript
const createMixedAudioStream = async (
  videoStream: MediaStream
): Promise<MediaStream> => {
  // Get microphone track
  const microphoneTrack = videoStream.getAudioTracks()[0];
  const microphoneSource = audioContext.createMediaStreamSource(
    new MediaStream([microphoneTrack])
  );

  // Create gain nodes for volume control
  const microphoneGain = audioContext.createGain();
  const systemGain = audioContext.createGain();

  // Create merger to combine audio sources
  const audioMerger = audioContext.createChannelMerger(2);

  // Connect both audio sources to merger
  microphoneSource.connect(microphoneGain);
  microphoneGain.connect(audioMerger);

  audioSource.connect(systemGain);
  systemGain.connect(audioMerger);

  // Create destination stream
  const destination = audioContext.createMediaStreamDestination();
  audioMerger.connect(destination);

  // Combine video track with mixed audio
  return new MediaStream([
    videoStream.getVideoTracks()[0],
    ...destination.stream.getAudioTracks(),
  ]);
};
```

## Benefits

1. **Complete Audio Record**: Captures both sides of the conversation
2. **Synchronized Recording**: Audio and video are perfectly synchronized
3. **Volume Control**: Separate gain controls for microphone and system audio
4. **Fallback Support**: Gracefully falls back to microphone-only if system audio capture fails

## Technical Considerations

### Browser Compatibility

- Requires Web Audio API support
- Uses `MediaElementAudioSourceNode` for system audio capture
- Falls back gracefully on unsupported browsers

### Performance

- Audio mixing is done in real-time using Web Audio API
- Minimal performance impact due to efficient audio processing
- Automatic cleanup of audio resources

### Security

- Only captures audio from the assessment's audio element
- No access to other system audio sources
- User consent required for microphone access

## Usage

The implementation is automatically enabled when:

1. Video recording is enabled in assessment settings
2. The browser supports Web Audio API
3. User grants microphone permissions

No additional configuration is required - the system automatically detects and uses the available audio sources.

## Troubleshooting

### Common Issues

1. **No system audio in recording**: Check browser Web Audio API support
2. **Audio synchronization issues**: Ensure audio context is properly initialized
3. **Performance issues**: Monitor audio processing in browser dev tools

### Debug Logging

The implementation includes comprehensive logging to help debug issues:

- Audio context initialization
- Audio source creation
- Stream mixing process
- Error handling and fallbacks

## Future Enhancements

Potential improvements could include:

- Configurable audio mixing ratios
- Support for multiple audio sources
- Advanced audio processing (noise reduction, echo cancellation)
- Audio level monitoring and visualization
