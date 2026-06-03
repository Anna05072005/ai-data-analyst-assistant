import { useState } from "react";
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
      alert("Upload failed");
    }

    setLoading(false);
  };

  const totalMissing = result
    ? Object.values(result.missing_values).reduce((sum, value) => sum + value, 0)
    : 0;

  const missingRows = result
    ? Object.entries(result.missing_values).filter(([_, value]) => value > 0)
    : [];

  return (
    <div className="container">
      <h1>AI Data Analyst Assistant</h1>

      <div className="upload-box">
        <input
          type="file"
          accept=".csv,.xlsx"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <button onClick={handleUpload}>
          {loading ? "Uploading..." : "Upload Dataset"}
        </button>
      </div>

      {result && (
        <>
          <div className="cards">
            <div className="card">
              <h3>Rows</h3>
              <p>{result.rows}</p>
            </div>

            <div className="card">
              <h3>Columns</h3>
              <p>{result.columns}</p>
            </div>

            <div className="card">
              <h3>Missing Values</h3>
              <p>{totalMissing}</p>
            </div>

            <div className="card">
              <h3>Duplicates</h3>
              <p>{result.duplicates}</p>
            </div>
          </div>

          <section className="section">
            <h2>AI Insights</h2>
            <ul>
              <li>The dataset contains {result.rows} rows and {result.columns} columns.</li>
              <li>There are {totalMissing} missing values across the dataset.</li>
              <li>The dataset contains {result.duplicates} duplicate records.</li>
              <li>Numeric columns detected: {result.numeric_columns.join(", ")}.</li>
              <li>Categorical columns detected: {result.categorical_columns.length} columns.</li>
            </ul>
          </section>

          <section className="section">
            <h2>Missing Values</h2>

            {missingRows.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Column</th>
                    <th>Missing Values</th>
                  </tr>
                </thead>

                <tbody>
                  {missingRows.map(([column, value]) => (
                    <tr key={column}>
                      <td>{column}</td>
                      <td>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No missing values detected.</p>
            )}
          </section>

          <section className="section">
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
    </div>
  );
}

export default App;