import React, { useEffect, useState } from "react";

function App() {
  const [mlbGames, setMlbGames] = useState([]);
  const [nbaGames, setNbaGames] = useState([]);
  const [profitGoal, setProfitGoal] = useState(100);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchOdds = (profit = 100, date) => {
    fetch(`http://127.0.0.1:5000/api/odds?profit=${profit}&date=${date}`)
      .then((res) => res.json())
      .then((data) => {
        setMlbGames(data.MLB);
        setNbaGames(data.NBA);
      });
  };

  useEffect(() => {
    fetchOdds(profitGoal, selectedDate);
    const interval = setInterval(() => {
      fetchOdds(profitGoal, selectedDate);
    }, 60000); // refresh every 60 seconds
    return () => clearInterval(interval);
  }, [profitGoal, selectedDate]);

  const renderTable = (games, title) => (
    <div style={{ marginBottom: "40px" }}>
      <h2 style={{ fontSize: "20px", marginBottom: "12px" }}>{title}</h2>
      <table border="1" cellPadding="10" cellSpacing="0">
        <thead>
          <tr>
            <th>Match</th>
            <th>Start Time (UTC)</th>
            <th>Bookmaker</th>
            <th>Team</th>
            <th>Odds</th>
          </tr>
        </thead>
        <tbody>
          {games.map((game, idx) => (
            <React.Fragment key={idx}>
              {game.odds.length > 0 ? (
                game.odds.map((line, i) => (
                  <tr key={i}>
                    <td>{game.match}</td>
                    <td>{game.start_time}</td>
                    <td>{line.bookmaker}</td>
                    <td>{line.team}</td>
                    <td>{line.price}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td>{game.match}</td>
                  <td>{game.start_time}</td>
                  <td colSpan={3} style={{ color: "#888" }}>No odds available</td>
                </tr>
              )}
              {game.arbitrage && (
                <tr style={{ backgroundColor: "#e6ffe6" }}>
                  <td colSpan={5}>
                    <strong>💰 Arbitrage Found!</strong><br />
                    Bet <strong>${game.arbitrage.bet_1}</strong> on <strong>{game.arbitrage.team_1}</strong> at <strong>{game.arbitrage.bookmaker_1}</strong><br />
                    Bet <strong>${game.arbitrage.bet_2}</strong> on <strong>{game.arbitrage.team_2}</strong> at <strong>{game.arbitrage.bookmaker_2}</strong><br />
                    Guaranteed Profit: <strong>${game.arbitrage.guaranteed_profit}</strong> ✅
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div style={{ padding: "24px" }}>
      <h1 style={{ fontSize: "28px", marginBottom: "24px" }}>
        📊 NBA & MLB Odds with Arbitrage Alerts (Real-time)
      </h1>
      <div style={{ marginBottom: "24px" }}>
        <label style={{ marginRight: "20px" }}>
          💵 Desired Profit: $
          <input
            type="number"
            value={profitGoal}
            onChange={(e) => setProfitGoal(Number(e.target.value))}
            style={{ marginLeft: "10px", padding: "6px", fontSize: "16px", width: "80px" }}
          />
        </label>
        <label>
          📅 Select Date:
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ marginLeft: "10px", padding: "6px", fontSize: "16px" }}
          />
        </label>
        <p style={{ fontSize: "14px", color: "gray", marginTop: "4px" }}>
          (Auto-refreshes every 60 seconds)
        </p>
      </div>
      {renderTable(nbaGames, "NBA Games")}
      {renderTable(mlbGames, "MLB Games")}
    </div>
  );
}

export default App;
