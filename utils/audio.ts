import { Audio } from 'expo-av';

let popSound: Audio.Sound | null = null;

export const initAudio = async () => {
  try {
    const { sound } = await Audio.Sound.createAsync(
      require('../assets/pop.mp3')
    );
    popSound = sound;
  } catch (err) {
    console.log('Failed to load pop sound', err);
  }
};

export const playPopSound = async () => {
  if (popSound) {
    try {
      await popSound.replayAsync();
    } catch (err) {
      console.log('Failed to play pop sound', err);
    }
  }
};
