import logger from '../utils/logger.js';

class InputHandler {
  constructor() {
    this.inputBuffer = new Map();
    this.lastInputTime = new Map();
    logger.info('InputHandler initialized');
  }

  handleInput(clientId, inputData) {
    try {
      const now = Date.now();
      const lastTime = this.lastInputTime.get(clientId) || 0;
      const deltaTime = now - lastTime;

      // Process input based on type
      const processedInput = this.processInputData(inputData, deltaTime);

      // Store in buffer
      if (!this.inputBuffer.has(clientId)) {
        this.inputBuffer.set(clientId, []);
      }
      this.inputBuffer.get(clientId).push(processedInput);

      this.lastInputTime.set(clientId, now);

      if (inputData.type !== 'joystick' && inputData.type !== 'trigger') {
        logger.debug(`Input received from ${clientId}: ${inputData.type}`);
      }
    } catch (error) {
      logger.error(`Failed to handle input: ${error.message}`);
    }
  }

  processInputData(inputData, deltaTime) {
    return {
      type: inputData.type, // button, axis, trigger, gyro, touch
      key: inputData.key,
      value: inputData.value,
      timestamp: Date.now(),
      deltaTime
    };
  }

  getInputBuffer(clientId) {
    return this.inputBuffer.get(clientId) || [];
  }

  clearInputBuffer(clientId) {
    this.inputBuffer.delete(clientId);
  }

  getSupportedInputMethods() {
    return {
      controller: {
        buttons: ['A', 'B', 'X', 'Y', 'LB', 'RB', 'Start', 'Back'],
        axes: ['LeftStick', 'RightStick'],
        triggers: ['LT', 'RT']
      },
      keyboard: {
        supported: true,
        modifiers: ['Ctrl', 'Shift', 'Alt']
      },
      mouse: {
        buttons: ['Left', 'Right', 'Middle'],
        movement: true,
        scroll: true
      },
      touchscreen: {
        gestures: ['tap', 'swipe', 'pinch', 'longpress'],
        multitouch: true
      }
    };
  }
}

export default InputHandler;
