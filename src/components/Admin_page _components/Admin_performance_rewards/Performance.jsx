import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Performance.css";

export default function Performance() {
  const employees = [
    { name: "Alice", points: 205 },
    { name: "Bob", points: 494 },
    { name: "Charlie", points: 271 },
    { name: "David", points: 360 },
    { name: "Eve", points: 157 },
    { name: "Frank", points: 439 },
    { name: "Grace", points: 393 },
    { name: "Hannah", points: 138 },
    { name: "Ivan", points: 417 },
    { name: "Judy", points: 287 },
  ];

  const alice = employees.find((emp) => emp.name === "Alice");
  if (!alice) return null;

  const maxPoints = Math.max(...employees.map((emp) => emp.points));
  const boxHeight = 200; // height in px

  const metrics = [
    { name: "Performance", value: alice.points / maxPoints, color: "#17a2b8" },
    { name: "Leaves", value: 0.3, color: "#dc3545" },
    { name: "Efficiency", value: 0.55, color: "#28a745" },
    { name: "Output", value: 0.7, color: "#ffc107" },
  ];

  return (
    <div className="container-fluid mt-4">
      <h2 className="mb-4 text-center">Alice's Metrics Overview</h2>

      <div className="graph-card">
        <div className="graph-container">
          {/* Scale */}
          <div className="scale">
            <small>1.0</small>
            <small>0.5</small>
            <small>0</small>
          </div>

          {/* Bars */}
          <div className="bars-container">
            {metrics.map((metric, index) => {
              const fillHeight = metric.value * boxHeight;
              return (
                <div key={index} className="metric-column">
                  {/* Label ABOVE bar */}
                  <small className="mb-2">{metric.name}</small>
                  <div className="metric-box">
                    <div
                      className="metric-fill"
                      title={`${metric.name}: ${metric.value.toFixed(2)}`}
                      style={{
                        height: `${fillHeight}px`,
                        backgroundColor: metric.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
