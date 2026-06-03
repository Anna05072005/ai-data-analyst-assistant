import { useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error(error);
      alert("Upload failed. Make sure the backend is running.");
    }

    setLoading(false);
  };

  const clearResults = () => {
    setFile(null);
    setResult(null);
  };

  const downloadReport = () => {
    if (!result) return;

    const blob = new Blob([JSON.stringify(result, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "dataset-analysis-report.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const getScoreLabel = (score) => {
    if (score >= 85) return "Strong";
    if (score >= 65) return "Moderate";
    return "Needs Attention";
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <h2>AI Analyst</h2>
        <p>Dataset profiling, EDA, risk detection, and recommendations.</p>

        <div className="sidebar-section">
          <span>Current module</span>
          <strong>Data Scientist Agent</strong>
        </div>
      </aside>

      <main className="dashboard">
        <section className="hero">
          <div>
            <p className="eyebrow">AI Data Scientist Agent</p>
            <h1>Upload any dataset and get instant analysis</h1>
            <p className="subtitle">
              Automatically profile CSV and Excel files, detect quality issues,
              generate visual analysis, and recommend next analytical steps.
            </p>
          </div>

          <div className="upload-panel">
            <input
              type="file"
              accept=".csv,.xlsx"
              onChange={(e) => setFile(e.target.files[0])}
            />

            <button onClick={handleUpload}>
              {loading ? "Analyzing..." : "Analyze Dataset"}
            </button>

            {result && (
              <>
                <button className="secondary-button" onClick={downloadReport}>
                  Download JSON Report
                </button>

                <button className="clear-button" onClick={clearResults}>
                  Clear Results
                </button>
              </>
            )}
          </div>
        </section>

        {result && (
          <>
            <section className="score-section">
              <div className="score-card">
                <p>Dataset Health Score</p>
                <h2>{result.health_score}/100</h2>
                <span>{getScoreLabel(result.health_score)}</span>
              </div>

              <div className="metrics-grid">
                <div className="metric-card">
                  <p>Rows</p>
                  <h3>{result.rows}</h3>
                </div>

                <div className="metric-card">
                  <p>Columns</p>
                  <h3>{result.columns}</h3>
                </div>

                <div className="metric-card">
                  <p>Missing Rate</p>
                  <h3>{result.missing_rate}%</h3>
                </div>

                <div className="metric-card">
                  <p>Duplicates</p>
                  <h3>{result.duplicates}</h3>
                </div>
              </div>
            </section>

            <section className="content-grid">
              <div className="panel">
                <h2>Smart Recommendations</h2>
                <ul className="recommendations">
                  {result.recommendations.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="panel">
                <h2>Column Types</h2>
                <div className="type-box">
                  <p>Numeric columns</p>
                  <strong>{result.numeric_columns.join(", ") || "None"}</strong>
                </div>

                <div className="type-box">
                  <p>Categorical columns</p>
                  <strong>{result.categorical_columns.length}</strong>
                </div>
              </div>
            </section>

            <section className="panel">
              <h2>Automatic Visual Analysis</h2>

              <div className="charts-grid">
                {result.charts.map((chart, index) => (
                  <div className="chart-card" key={index}>
                    <h3>{chart.title}</h3>

                    <ResponsiveContainer width="100%" height={260}>
                      {chart.type === "bar" ? (
                        <BarChart data={chart.data}>
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="value" />
                        </BarChart>
                      ) : (
                        <LineChart data={chart.data}>
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="value" />
                        </LineChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                ))}
              </div>
            </section>

            <section className="panel">
              <h2>Column Risk Analysis</h2>

              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Column</th>
                      <th>Data Type</th>
                      <th>Missing Values</th>
                      <th>Missing %</th>
                      <th>Risk Level</th>
                    </tr>
                  </thead>

                  <tbody>
                    {result.column_risks.map((column) => (
                      <tr key={column.column}>
                        <td>{column.column}</td>
                        <td>{column.data_type}</td>
                        <td>{column.missing_values}</td>
                        <td>{column.missing_percent}%</td>
                        <td>
                          <span className={`risk risk-${column.risk_level.toLowerCase()}`}>
                            {column.risk_level}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="panel">
              <h2>Dataset Preview</h2>

              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      {Object.keys(result.preview[0]).map((column) => (
                        <th key={column}>{column}</th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {result.preview.map((row, index) => (
                      <tr key={index}>
                        {Object.values(row).map((value, i) => (
                          <td key={i}>{String(value)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default App;