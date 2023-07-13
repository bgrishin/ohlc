import React, { useEffect, useState } from "react";
import "./App.css";
import { Chart } from "./components/chart/Chart";
import { PauseIcon, PlayIcon, SettingsIcon } from "./components/icons";
import { Settings, SettingsType } from "./components/settings/Settings";

function App() {
  const [lastPrice, setLastPrice] = useState<number | null>(null);
  const [settings, setSettings] = useState<SettingsType | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [pause, setPause] = useState(false);

  useEffect(() => {
    const storedSettings = localStorage.getItem("chart-settings");
    if (storedSettings) {
      setSettings(JSON.parse(storedSettings));
    }
  }, []);

  return (
    <div>
      {settings ? (
        <>
          <div>
            <div className={"controls"}>
              <span>{lastPrice?.toFixed(2)} $</span>
              {!pause ? (
                <div
                  onClick={() => {
                    setPause(true);
                    localStorage.setItem("chart-pause", "true");
                  }}
                >
                  <PauseIcon />
                </div>
              ) : (
                <div
                  onClick={() => {
                    setPause(false);
                    localStorage.setItem("chart-pause", "false");
                  }}
                >
                  <PlayIcon />
                </div>
              )}
              <div onClick={() => setShowSettings(true)}>
                <SettingsIcon />
              </div>
            </div>
          </div>
          <Chart
            initialCandles={settings.initialCandles}
            volume={settings.volume}
            updateSpeed={settings.updateSpeed}
            initialPrice={settings.initialPrice}
            direction={settings.direction}
            setLastPrice={setLastPrice}
          />
          {showSettings ? (
            <Settings
              setSettings={setSettings}
              settings={settings}
              setShowSettings={setShowSettings}
            />
          ) : null}
        </>
      ) : (
        <>
          <Chart
            initialCandles={400}
            volume={1}
            updateSpeed={20}
            initialPrice={1}
            direction={"both"}
            setLastPrice={setLastPrice}
            disableBlock={true}
          />
          <Settings
            setSettings={setSettings}
            setShowSettings={setShowSettings}
          />
        </>
      )}
    </div>
  );
}

export default App;
