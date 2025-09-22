import React, { useState, useEffect, useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import "./dashboard.css";

const Dashboard = () => {
  const [salary, setSalary] = useState("");
  const [fields, setFields] = useState([]);

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
    <div className="dashboard-container">
      {/* LEFT SIDE */}
      <div className="dashboard-left">
        {/* Salary input */}
        <div className="input-row">
          <label className="input-label">Salary</label>
          <input
            type="text"
            value={formatNumber(salary)}
            onChange={(e) => setSalary(parseNumber(e.target.value))}
            className="input-field"
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
              <input
                type="text"
                value={formatNumber(f.value)}
                readOnly
                className="input-field readonly"
              />
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

        {/* Personal Use */}
        <div className="input-row">
          <label className="input-label" style={{ color: "#096b32", fontWeight: "bold" }}>Personal Use</label>
          <input
            type="text"
            value={formatNumber(allocations.personal)}
            readOnly
            className="input-field readonly"
          />
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="dashboard-right">
        <div className="card large">
          <h3>Allocation Overview</h3>
          <PieChart width={400} height={300}>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
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
            <Legend />
          </PieChart>
        </div>
        <div className="card small">
          <h3>Future Graph</h3>
          <p>Reserved for later...</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
