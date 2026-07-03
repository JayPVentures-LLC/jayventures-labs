const ConstraintEngine = require('../engines/ConstraintEngine');

class Runtime {
  constructor() {
    this.engine = new ConstraintEngine();
    this.state = { tick: 0 };
  }

  start() {
    console.log('[JPV] Runtime Online');
    setInterval(() => this.tick(), 1000);
  }

  tick() {
    this.state.tick++;

    const u = Math.random();
    const c = Math.random();

    const res = this.engine.evaluate({ utilityGain: u, complexityCost: c });

    if (res.allowed) {
      this.engine.consume(c);

      console.log({
        tick: this.state.tick,
        u,
        c,
        score: res.score,
        remaining: res.remaining
      });
    } else {
      console.log({
        tick: this.state.tick,
        blocked: true,
        score: res.score,
        remaining: res.remaining
      });
    }
  }
}

module.exports = Runtime;