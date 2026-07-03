const EventEmitter = require('events');

class EventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(100);
  }

  emitEvent(type, payload) {
    this.emit('event', {
      id: 'evt-' + Date.now(),
      type,
      payload,
      timestamp: Date.now(),
      trace: []
    });
  }
}

module.exports = EventBus;
