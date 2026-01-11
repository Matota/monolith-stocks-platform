# Benchmark Suite: Monolith vs. Microservices

This document outlines the strategy for comparing the performance, resource efficiency, and scalability of the Monolithic vs. Microservices architecture.

## 1. Benchmarking Layers

### Layer 1: Load Simulation (K6)
We use **k6** to simulate high-concurrency trading scenarios.
- **Test Script**: `benchmarking/k6-test.js`
- **Metrics**: Requests Per Second (RPS), Latency (P95, P99), Success Rate.

### Layer 2: Observability (Prometheus & Grafana)
Tracks the "Vital Signs" of the infrastructure.
- **Resource Usage**: Monitor CPU and RAM consumption per container.
- **Throughput**: Monitor total network I/O.

### Layer 3: Distributed Tracing (Jaeger)
Visualizes where time is spent in the Microservices version.
- Compare a single function call in the Monolith vs. a multi-hop trace (Gateway -> Auth -> Portfolio).

---

## 2. Test Scenarios

### Scenario A: Baseline (Idle)
- **Goal**: Measure overhead of running the platform.
- **Execution**: Run with 0 active users.
- **Metric**: Total RAM usage of the Docker stack.

### Scenario B: Sustained Load (Happy Path)
- **Goal**: Measure average latency under normal conditions.
- **Execution**: 50 Virtual Users (VUs) continuously polling prices and making occasional trades.

### Scenario C: Stress Test (The Flash Sale)
- **Goal**: Find the breaking point.
- **Execution**: Ramp up from 1 to 500 VUs over 2 minutes.
- **Metric**: Error rate and response time degradation.

---

## 3. The "Microservice Tax" Calculation

To calculate the performance cost of the microservices architecture:
1. Measure **Avg Latency** for a "Trade" in Monolith (`T_mono`).
2. Measure **Avg Latency** for a "Trade" in Microservices (`T_micro`).
3. **Tax** = `(T_micro - T_mono) / T_mono * 100%`.

---

## 4. How to Run Benchmarks

### Prerequisites
Install k6:
```bash
# macOS
brew install k6
```

### Execution
1. Start the target architecture (`docker compose up`).
2. Run the script:
```bash
k6 run benchmarking/k6-test.js
```
