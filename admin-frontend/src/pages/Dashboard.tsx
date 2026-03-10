import React, { useEffect, useState } from "react";

type TripStatus = "pending" | "in_progress" | "completed" | "disrupted";

interface Trip {
  id: number;
  platform_trip_id: string;
  worker_id: string;
  zone: string;
  status: TripStatus;
  expected_earnings: number;
  accepted_at: string;
  completed_at: string | null;
  disruption_reason: string | null;
}

interface TriggerEvent {
  id: number;
  trigger_type: "environmental" | "civic";
  code: string;
  zone: string;
  description: string;
  severity: number;
  started_at: string;
  ended_at: string | null;
}

interface WeeklyPayout {
  worker_id: string;
  total_amount: number;
  claim_ids: number[];
}

const API_BASE = "/api";

export const Dashboard: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [triggers, setTriggers] = useState<TriggerEvent[]>([]);
  const [payouts, setPayouts] = useState<WeeklyPayout[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [tripsRes, triggersRes, payoutsRes] = await Promise.all([
        fetch(`${API_BASE}/trips`),
        fetch(`${API_BASE}/triggers`),
        fetch(`${API_BASE}/payouts/weekly`),
      ]);
      if (!tripsRes.ok || !triggersRes.ok || !payoutsRes.ok) {
        throw new Error("Failed to fetch data from backend");
      }
      setTrips(await tripsRes.json());
      setTriggers(await triggersRes.json());
      setPayouts(await payoutsRes.json());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchAll();
    const interval = setInterval(() => {
      void fetchAll();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const simulateTrigger = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/triggers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trigger_type: "environmental",
          code: "RAIN_HEAVY",
          zone: "DELHI-NORTH",
          description: "Simulated heavy rainfall in Delhi North",
          severity: 0.8,
        }),
      });
      if (!res.ok) throw new Error("Failed to create trigger");
      await fetchAll();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const simulateTrip = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/trips`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform_trip_id: `SIM-${Date.now()}`,
          worker_id: "worker-123",
          zone: "DELHI-NORTH",
          expected_earnings: 120,
        }),
      });
      if (!res.ok) throw new Error("Failed to create trip");
      await fetchAll();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header>
        <h1>QuickCover Admin</h1>
        <p>Parametric income protection dashboard</p>
      </header>

      <section className="controls">
        <button onClick={() => void fetchAll()} disabled={loading}>
          Refresh
        </button>
        <button onClick={() => void simulateTrip()} disabled={loading}>
          Simulate Trip
        </button>
        <button onClick={() => void simulateTrigger()} disabled={loading}>
          Simulate Trigger
        </button>
        {loading && <span className="status">Loading…</span>}
        {error && <span className="error">{error}</span>}
      </section>

      <main className="grid">
        <section>
          <h2>Recent Trips</h2>
          <div className="card">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Platform Trip</th>
                  <th>Worker</th>
                  <th>Zone</th>
                  <th>Status</th>
                  <th>Expected ₹</th>
                  <th>Accepted</th>
                </tr>
              </thead>
              <tbody>
                {trips.map((t) => (
                  <tr key={t.id}>
                    <td>{t.id}</td>
                    <td>{t.platform_trip_id}</td>
                    <td>{t.worker_id}</td>
                    <td>{t.zone}</td>
                    <td>{t.status}</td>
                    <td>{t.expected_earnings.toFixed(0)}</td>
                    <td>{new Date(t.accepted_at).toLocaleTimeString()}</td>
                  </tr>
                ))}
                {trips.length === 0 && (
                  <tr>
                    <td colSpan={7}>No trips yet. Click “Simulate Trip”.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2>Trigger Events</h2>
          <div className="card">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Type</th>
                  <th>Code</th>
                  <th>Zone</th>
                  <th>Severity</th>
                  <th>Started</th>
                </tr>
              </thead>
              <tbody>
                {triggers.map((ev) => (
                  <tr key={ev.id}>
                    <td>{ev.id}</td>
                    <td>{ev.trigger_type}</td>
                    <td>{ev.code}</td>
                    <td>{ev.zone}</td>
                    <td>{ev.severity.toFixed(2)}</td>
                    <td>{new Date(ev.started_at).toLocaleTimeString()}</td>
                  </tr>
                ))}
                {triggers.length === 0 && (
                  <tr>
                    <td colSpan={6}>No triggers yet. Click “Simulate Trigger”.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2>Weekly Payouts</h2>
          <div className="card">
            <table>
              <thead>
                <tr>
                  <th>Worker</th>
                  <th>Total Payout ₹</th>
                  <th>Claims</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p) => (
                  <tr key={p.worker_id}>
                    <td>{p.worker_id}</td>
                    <td>{p.total_amount.toFixed(0)}</td>
                    <td>{p.claim_ids.join(", ")}</td>
                  </tr>
                ))}
                {payouts.length === 0 && (
                  <tr>
                    <td colSpan={3}>No payouts yet. Create trips & triggers.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

