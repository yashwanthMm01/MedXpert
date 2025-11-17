// Path smoothing utility for better drawing experience
export class PathSmoother {
  private points: Array<[number, number]> = [];
  private readonly smoothing: number;
  private readonly maxPoints: number;

  constructor(smoothing: number = 0.2, maxPoints: number = 5) {
    this.smoothing = smoothing;
    this.maxPoints = maxPoints;
  }

  addPoint(x: number, y: number): [number, number] {
    this.points.push([x, y]);
    if (this.points.length > this.maxPoints) {
      this.points.shift();
    }
    return this.getSmoothedPoint();
  }

  private getSmoothedPoint(): [number, number] {
    if (this.points.length < 2) {
      return this.points[this.points.length - 1];
    }

    let xSum = 0;
    let ySum = 0;
    let weightSum = 0;

    for (let i = 0; i < this.points.length; i++) {
      const weight = Math.pow(1 - this.smoothing, this.points.length - 1 - i);
      xSum += this.points[i][0] * weight;
      ySum += this.points[i][1] * weight;
      weightSum += weight;
    }

    return [xSum / weightSum, ySum / weightSum];
  }

  reset(): void {
    this.points = [];
  }
}