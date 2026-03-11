import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

let sound: Audio.Sound | null = null;
let loading: Promise<Audio.Sound> | null = null;
let audioReady = false;

const loadSound = async () => {
  if (sound) return sound;
  if (loading) return loading;

  loading = Audio.Sound.createAsync(
    require('@/assets/sounds/pop.wav'),
    { shouldPlay: false, volume: 0.7 }
  ).then((result) => {
    sound = result.sound;
    loading = null;
    return sound;
  });

  return loading;
};

const ensureAudioMode = async () => {
  if (audioReady) return;
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_MIX_WITH_OTHERS,
    playsInSilentModeIOS: true,
    staysActiveInBackground: false,
    shouldDuckAndroid: false,
  });
  audioReady = true;
};

export const playPopFeedback = async () => {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // No-op: haptics not available.
  }

  try {
    await ensureAudioMode();
    const popSound = await loadSound();
    await popSound.replayAsync();
  } catch {
    // No-op: audio not available.
  }
};
