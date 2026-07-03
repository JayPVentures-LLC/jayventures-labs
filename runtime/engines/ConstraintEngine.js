class ConstraintEngine {
  constructor() {
    this.lambda = 0.7;
    this.budget = 100;
    this.used = 0;
  }

  evaluate(input) {
    const utility = input.utilityGain || 0;
    const cost = input.complexityCost || 0;

    const score = utility - this.lambda * cost;
    const allowed = score > 0 && (this.used + cost) <= this.budget;

    return {
      score,
      allowed,
      remaining: this.budget - (this.used + cost)
    };
  }

  consume(cost = 0) {
    this.used += cost;
  }
}

module.exports = ConstraintEngine;