/**
 * Deterministic Pseudo-Random Number Generator (Mulberry32)
 * Guarantees 100% reproducible sequences for data generation and reproducibility tests.
 */

export class DeterministicPRNG {
  private s: number;

  constructor(seed: number = 20261022) {
    this.s = seed >>> 0;
  }

  /**
   * Returns a pseudo-random float between 0 (inclusive) and 1 (exclusive).
   */
  next(): number {
    this.s = (this.s + 0x6d2b79f5) | 0;
    let t = Math.imul(this.s ^ (this.s >>> 15), 1 | this.s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Returns an integer between min and max inclusive.
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /**
   * Returns a float rounded to 2 decimal places between min and max.
   */
  nextFloat(min: number, max: number, decimals: number = 2): number {
    const val = this.next() * (max - min) + min;
    const factor = Math.pow(10, decimals);
    return Math.round(val * factor) / factor;
  }

  /**
   * Picks a random element from an array.
   */
  pick<T>(items: readonly T[]): T {
    const idx = this.nextInt(0, items.length - 1);
    return items[idx];
  }

  /**
   * Boolean with specified probability of being true.
   */
  chance(probability: number): boolean {
    return this.next() < probability;
  }
}

/**
 * Fast string hashing (FNV-1a 32-bit to hex) for dataset integrity checksums.
 */
export function fastHash(str: string): string {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}
