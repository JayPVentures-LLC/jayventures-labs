const EventBus = require('../shared/eventBus');

const bus = new EventBus();

console.log('[KERNEL] Execution Kernel starting...');

async function processEvent(event) {
  console.log('[KERNEL] Processing event:', event.type);

  const routed = {
    aso: null,
    iat: null
  };

  if (event.type.startsWith('aso')) {
    routed.aso = { status: 'routed', event };
  }

  if (event.type.startsWith('iat')) {
    routed.iat = { status: 'routed', event };
  }

  bus.emit('instrumentation', {
    type: 'execution_event',
    payload: routed,
    timestamp: Date.now(),
    trace: event.trace || []
  });
}

bus.on('event', async (event) => {
  await processEvent(event);
});

// bootstrap tick loop
setInterval(() => {
  const syntheticEvent = {
    id: 'tick-' + Date.now(),
    type: 'aso.tick',
    payload: { tick: true },
    timestamp: Date.now(),
    trace: []
  };

  bus.emit('event', syntheticEvent);
}, 3000);
