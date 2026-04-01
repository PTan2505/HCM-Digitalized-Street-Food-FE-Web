import { Howl } from 'howler';
import soundFile from '@assets/sounds/sound_v2.mp3';

const notificationHowl = new Howl({
  src: [soundFile],
  volume: 0.7,
  preload: true,
});

export const playNotificationSound = (): void => {
  try {
    notificationHowl.play();
  } catch (error) {
    console.warn('Could not play notification sound:', error);
  }
};
