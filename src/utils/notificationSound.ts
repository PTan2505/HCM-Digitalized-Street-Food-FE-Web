import { Howl } from 'howler';
import NewOrderSound from '@assets/sounds/NewOrder.m4a';
import NewFeedbackSound from '@assets/sounds/NewFeedback.m4a';

const feedbackHowl = new Howl({
  src: [NewFeedbackSound],
  volume: 0.9,
  preload: true,
});

const orderHowl = new Howl({
  src: [NewOrderSound],
  volume: 0.9,
  preload: true,
});

export const playNotificationSound = (type?: string): void => {
  try {
    if (type === 'NewOrder') {
      orderHowl.play();
    } else {
      feedbackHowl.play();
    }
  } catch (error) {
    console.warn('Could not play notification sound:', error);
  }
};
