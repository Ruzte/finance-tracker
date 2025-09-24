import React, { useState, useEffect, useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import "./dashboard.css";

const Dashboard = () => {
  const [salary, setSalary] = useState("");
  const [fields, setFields] = useState([]);

  // NEW STATES for Expenditure section
  const [selectedField, setSelectedField] = useState(""); // Which field it belongs to
  const [frequency, setFrequency] = useState("");         // daily / weekly / monthly

  const COLORS = [
    "#0088FE", "#FFBB28", "#FF8042", "#A020F0", "#FF4444",
    "#8884D8", "#82ca9d", "#00C49F", "#FF69B4", "#CD5C5C",
    "#FFD700", "#40E0D0"
  ];

  // Load saved fields from localStorage
  useEffect(() => {
    const savedFields = localStorage.getItem("fields");
    if (savedFields) {
      setFields(JSON.parse(savedFields));
    }
  }, []);

  // Save fields to localStorage
  useEffect(() => {
    localStorage.setItem("fields", JSON.stringify(fields));
  }, [fields]);

  // Format with commas
  const formatNumber = (num) => {
    if (!num || isNaN(num)) return "";
    return Number(num).toLocaleString();
  };

  const parseNumber = (str) => str.replace(/,/g, "");

  // Add new field
  const addField = () => {
    const newField = {
      id: Date.now().toString(),
      title: "New Field",
      type: "fixed",
      amount: 0,
      color: COLORS[fields.length % COLORS.length]
    };
    setFields([...fields, newField]);
  };

  // Update field
  const updateField = (id, key, value) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, [key]: value } : f)));
  };

  // Delete field
  const deleteField = (id) => {
    setFields(fields.filter((f) => f.id !== id));
  };

  // Calculate allocations
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

  // Pie data
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
          {/* LEFT SIDE */}
          <div className="dashboard-left">
            {/* Salary input */}
            <div className="input-row">
              <label className="input-label">Salary</label>
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
                {/* Title */}
                <input
                  type="text"
                  value={f.title}
                  onChange={(e) => updateField(f.id, "title", e.target.value)}
                  className="input-field"
                  style={{ color: f.color }}
                />

                {/* Amount */}
                <input
                  type="number"
                  value={f.amount}
                  onChange={(e) => updateField(f.id, "amount", e.target.value)}
                  className="input-field"
                />

                {/* Type + Equals + Result */}
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

            {/* Add field button */}
            <button className="add-btn" onClick={addField}>+ Add New Field</button>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="dashboard-right">
          <div className="card large">
            <h4>Allocation Overview</h4>
            <PieChart width={700} height={300}>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="35%"   // move pie chart left
                cy="50%"
                outerRadius={100}
                label
              >
                {pieData.map((entry, index) => {
                  let color;
                  if (entry.name === "Personal Use") {
                    color = "#096b32"; // Force green
                  } else {
                    color = COLORS[index % COLORS.length];
                  }
                  return <Cell key={index} fill={color} />;
                })}
              </Pie>
              <Tooltip formatter={(value) => formatNumber(value)} />
              <Legend layout="vertical" align="right" verticalAlign="middle" />
            </PieChart>
            {/* Personal Use */}
            <div className="input-row">
              <label
                className="input-label"
                style={{ color: "#096b32", fontWeight: "bold" }}
              >
                Play Money 
              </label>
              <span className="personal-value">{formatNumber(allocations.personal)}</span>
            </div>
          </div>

          {/* Expenditure Card */}
          <div className="card expenditure-card">
            <h3>Expenditure</h3>
            
            <div className="expenditure-layout">
              
              {/* LEFT COLUMN: Field Selector */}
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

              {/* MIDDLE COLUMN: Frequency Options */}
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

              {/* RIGHT COLUMN: Report */}
              <div className="expenditure-right">
                <div className="report-section">
                  <span>Estimated Savings in:</span>

                  {(() => {
                    // Lookup selected field value
                    const field = allocations.calcFields.find(f => f.id === selectedField);
                    const baseValue = field ? field.value : 0;

                    // Frequency multipliers
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
