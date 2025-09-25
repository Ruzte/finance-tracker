import React, { useState, useEffect, useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import "./dashboard.css";

const Dashboard = () => {
  const [salary, setSalary] = useState("");
  const [fields, setFields] = useState([]);

  const [selectedField, setSelectedField] = useState("");
  const [frequency, setFrequency] = useState("");

  const COLORS = [
    "#0088FE", "#FFBB28", "#FF8042", "#A020F0", "#FF4444",
    "#8884D8", "#82ca9d", "#00C49F", "#FF69B4", "#CD5C5C",
    "#FFD700", "#40E0D0"
  ];

  useEffect(() => {
    const savedFields = localStorage.getItem("fields");
    if (savedFields) {
      setFields(JSON.parse(savedFields));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("fields", JSON.stringify(fields));
  }, [fields]);

  const formatNumber = (num) => {
    if (!num || isNaN(num)) return "";
    return Number(num).toLocaleString();
  };

  const parseNumber = (str) => str.replace(/,/g, "");

  const addField = () => {
    if (fields.length >= 9) {
      alert("You can only add up to 9 fields.");
      return;
    }

    const newField = {
      id: Date.now().toString(),
      title: "New Field",
      type: "fixed",
      amount: 0,
      color: COLORS[fields.length % COLORS.length]
    };
    setFields([...fields, newField]);
  };

  const updateField = (id, key, value) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, [key]: value } : f)));
  };

  const deleteField = (id) => {
    setFields(fields.filter((f) => f.id !== id));
  };

  const allocations = useMemo(() => {
    const s = parseFloat(salary) || 0;
    let totalDeductions = 0;

    const calcFields = fields.map((f) => {
      let val = 0;
      if (f.type === "percent") {
        val = s * (parseFloat(f.amount) || 0) / 100;
      } else {
        val = parseFloat(f.amount) || 0;
      }
      totalDeductions += val;
      return { ...f, value: val };
    });

    const personal = Math.max(s - totalDeductions, 0);

    return { calcFields, personal };
  }, [salary, fields]);

  const pieData = [
    ...allocations.calcFields.map((f) => ({ name: f.title, value: f.value })),
    { name: "Personal Use", value: allocations.personal }
  ];

  return (
    <>
      <div className="navbar">
        <h2 className="navbar-logo">💰 Finance Tracker</h2>
      </div>
      
      <div className="dashboard-container">
        <div className="card main">
          <div className="dashboard-left">
            {/* Salary header with inline input */}
            <div className="salary-header">
              <h2>Salary</h2>
              <input
                type="text"
                value={formatNumber(salary)}
                onChange={(e) => setSalary(parseNumber(e.target.value))}
                placeholder="Enter your salary"
                className="salary-input"
              />
            </div>

            {/* Dynamic fields */}
            {allocations.calcFields.map((f) => (
              <div key={f.id} className="input-row custom-field">
                <input
                  type="text"
                  value={f.title}
                  onChange={(e) => updateField(f.id, "title", e.target.value)}
                  className="input-field"
                  style={{ color: f.color }}
                />
                <input
                  type="number"
                  value={f.amount}
                  onChange={(e) => updateField(f.id, "amount", e.target.value)}
                  className="input-field"
                />
                <div className="result-wrapper">
                  <select
                    value={f.type}
                    onChange={(e) => updateField(f.id, "type", e.target.value)}
                    className="input-field"
                  >
                    <option value="fixed">₱</option>
                    <option value="percent">%</option>
                  </select>
                  <span className="equals-sign">=</span>
                  <span className="calculated-value">{formatNumber(f.value)}</span>
                  <button
                    className="delete-btn"
                    onClick={() => deleteField(f.id)}
                    title="Delete"
                  >
                    ✖
                  </button>
                </div>
              </div>
            ))}

            <button
              className="add-btn"
              onClick={addField}
              disabled={fields.length >= 9}
            >
              + Add New Field
            </button>
          </div>
        </div>

        {/* Right side */}
        <div className="dashboard-right">
          <div className="card large">
            <h4>Allocation Overview</h4>
            <PieChart width={700} height={300}>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="35%"
                cy="50%"
                outerRadius={100}
                label
              >
                {pieData.map((entry, index) => {
                  let color;
                  if (entry.name === "Personal Use") {
                    color = "#096b32";
                  } else {
                    color = COLORS[index % COLORS.length];
                  }
                  return <Cell key={index} fill={color} />;
                })}
              </Pie>
              <Tooltip formatter={(value) => formatNumber(value)} />
              <Legend layout="vertical" align="right" verticalAlign="middle" />
            </PieChart>
            <div className="input-row">
              <label
                className="input-label"
                style={{ color: "#096b32", fontWeight: "bold" }}
              >
                Personal Use 
              </label>
              <span className="personal-value">{formatNumber(allocations.personal)}</span>
            </div>
          </div>

          {/* Expenditure card */}
          <div className="card expenditure-card">
            <h3>Expenditure</h3>
            <div className="expenditure-layout">
              <div className="expenditure-left">
                <div className="input-row">
                  <select
                    className="salary-input"
                    value={selectedField}
                    onChange={(e) => setSelectedField(e.target.value)}
                  >
                    <option value="">-- Choose a field --</option>
                    {allocations.calcFields.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="expenditure-middle">
                <h4 className="section-title">Frequency of Payments</h4>
                <label>
                  <input
                    type="radio"
                    name="frequency"
                    value="daily"
                    checked={frequency === "daily"}
                    onChange={(e) => setFrequency(e.target.value)}
                  />
                  Daily
                </label>
                <label>
                  <input
                    type="radio"
                    name="frequency"
                    value="weekly"
                    checked={frequency === "weekly"}
                    onChange={(e) => setFrequency(e.target.value)}
                  />
                  Weekly
                </label>
                <label>
                  <input
                    type="radio"
                    name="frequency"
                    value="monthly"
                    checked={frequency === "monthly"}
                    onChange={(e) => setFrequency(e.target.value)}
                  />
                  Monthly
                </label>
              </div>

              <div className="expenditure-right">
                <div className="report-section">
                  <span>Estimated Savings in:</span>
                  {(() => {
                    const field = allocations.calcFields.find(f => f.id === selectedField);
                    const baseValue = field ? field.value : 0;

                    const monthly =
                      frequency === "daily"
                        ? baseValue * 30
                        : frequency === "weekly"
                        ? baseValue * 4
                        : frequency === "monthly"
                        ? baseValue
                        : 0;

                    const yearly = monthly * 12;

                    return (
                      <>
                        <p>
                          1 Month: <strong>{formatNumber(monthly)}</strong>
                        </p>
                        <p>
                          1 Year: <strong>{formatNumber(yearly)}</strong>
                        </p>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
