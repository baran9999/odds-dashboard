import React, { useEffect, useState } from "react";

function App() {
  const [mlbGames, setMlbGames] = useState([]);
  const [nbaGames, setNbaGames] = useState([]);
  const [profitGoal, setProfitGoal] = useState(100);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const API_URL = import.meta.env.VITE_API_URL;

  const fetchOdds = (profit = 100, date) => {
    fetch(`${API_URL}?profit=${profit}&date=${date}`)
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

  const renderBets = (bets) => (
    <table border="1" cellPadding="8" cellSpacing="0" style={{ marginTop: "10px", width: "100%" }}>
      <thead>
        <tr>
          <th>Bookmaker 1</th>
          <th>Team 1</th>
          <th>Odds</th>
          <th>Bet</th>
          <th>Bookmaker 2</th>
          <th>Team 2</th>
          <th>Odds</th>
          <th>Bet</th>
          <th>Profit if Team 1 Wins</th>
          <th>Profit if Team 2 Wins</th>
        </tr>
      </thead>
      <tbody>
        {bets.map((bet, i) => (
          <tr key={i} style={{ backgroundColor: bet.is_arbitrage ? "#e6ffe6" : "#fff" }}>
            <td>{bet.bookmaker_1}</td>
            <td>{bet.team_1}</td>
            <td>{bet.odds_1}</td>
            <td>${bet.bet_1}</td>
            <td>{bet.bookmaker_2}</td>
            <td>{bet.team_2}</td>
            <td>{bet.odds_2}</td>
            <td>${bet.bet_2}</td>
            <td style={{ color: bet.profit_if_team_1_wins > 0 ? "green" : "red" }}>
              ${bet.profit_if_team_1_wins}
            </td>
            <td style={{ color: bet.profit_if_team_2_wins > 0 ? "green" : "red" }}>
              ${bet.profit_if_team_2_wins}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderTable = (games, title) => (
    <div style={{ marginBottom: "50px" }}>
      <h2>{title}</h2>
      {games.map((game, idx) => (
        <div key={idx} style={{ marginBottom: "30px" }}>
          <h4>{game.match} | 🕒 {new Date(game.start_time).toLocaleString()}</h4>
          <table border="1" cellPadding="6" cellSpacing="0" style={{ width: "100%" }}>
            <thead>
              <tr>
                <th>Bookmaker</th>
                <th>Team</th>
                <th>Odds</th>
              </tr>
            </thead>
            <tbody>
              {game.odds.map((line, i) => (
                <tr key={i}>
                  <td>{line.bookmaker}</td>
                  <td>{line.team}</td>
                  <td>{line.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {game.bet_suggestions && game.bet_suggestions.length > 0 && (
            <>
              <p style={{ marginTop: "8px", fontWeight: "bold" }}>
                💵 Bet Suggestions to make ${profitGoal}:
              </p>
              {renderBets(game.bet_suggestions)}
            </>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "auto" }}>
      <h1>📊 NBA & MLB Odds Dashboard with Bet Suggestions</h1>
      <div style={{ marginBottom: "20px" }}>
        <label style={{ marginRight: "16px" }}>
          💰 Desired Profit: $
          <input
            type="number"
            value={profitGoal}
            onChange={(e) => setProfitGoal(Number(e.target.value))}
            style={{ marginLeft: "8px", padding: "4px" }}
          />
        </label>
        <label>
          📅 Select Date:
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ marginLeft: "8px", padding: "4px" }}
          />
        </label>
        <p style={{ fontSize: "12px", color: "#555" }}>Auto-refreshing every 60 seconds.</p>
      </div>
      {renderTable(nbaGames, "🏀 NBA Games")}
      {renderTable(mlbGames, "⚾ MLB Games")}
    </div>
  );
}

export default App;
