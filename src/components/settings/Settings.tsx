import React, { useState } from "react";
import styles from "./Settings.module.css";

export interface SettingsType {
  initialCandles: number;
  volume: number;
  updateSpeed: number;
  initialPrice: number;
  direction: Direction;
}

type Direction = "long" | "short" | "both";

export const Settings = ({
  setSettings,
  settings,
  setShowSettings,
}: {
  setSettings: React.Dispatch<React.SetStateAction<SettingsType | null>>;
  settings?: SettingsType;
  setShowSettings: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [initialCandles, setInitialCandles] = useState(
    settings ? settings.initialCandles.toString() : ""
  );
  const [volume, setVolume] = useState(
    settings ? settings.volume.toString() : ""
  );
  const [updateSpeed, setUpdateSpeed] = useState(
    settings ? settings.updateSpeed.toString() : ""
  );
  const [initialPrice, setInitialPrice] = useState(
    settings ? -settings.initialPrice.toString() : ""
  );
  const [direction, setDirection] = useState<Direction | null>(
    settings ? settings.direction : null
  );

  return (
    <div
      className={styles.blur}
      onClick={(e) => {
        e.stopPropagation();
        setShowSettings(false);
      }}
    >
      <div className={styles.settings} onClick={(e) => e.stopPropagation()}>
        <div className={styles.title}>
          📈 OHLC (Candlestick) chart generator
        </div>
        <form
          className={styles.inputs}
          onSubmit={(e) => {
            e.preventDefault();

            const newSettings = {
              initialCandles: +initialCandles,
              volume: +volume,
              updateSpeed: +updateSpeed,
              initialPrice: -+initialPrice,
              direction: direction!,
            };

            localStorage.setItem("chart-settings", JSON.stringify(newSettings));

            if (settings) {
              window.location.reload();
            } else {
              setSettings(newSettings);
            }
          }}
        >
          <label>📊 Displayed candles amount</label>
          <input
            placeholder={"ex. 100, 200, 400"}
            type={"number"}
            value={initialCandles}
            onChange={(e) => setInitialCandles(e.target.value)}
            required
          />
          <label>
            💵 Volume (average amount of price movement for each candle)
          </label>
          <input
            placeholder={"ex. 100, 1000"}
            type={"number"}
            value={volume}
            onChange={(e) => setVolume(e.target.value)}
            required
          />
          <label>⏳ Candle create interval (in milliseconds)</label>
          <input
            placeholder={"ex. 500, 1000"}
            type={"number"}
            value={updateSpeed}
            onChange={(e) => setUpdateSpeed(e.target.value)}
            required
          />
          <label>🏷️ Initial coin price</label>
          <input
            placeholder={"ex. 100, 1000, 10000"}
            type={"number"}
            value={initialPrice}
            onChange={(e) => setInitialPrice(e.target.value)}
            required
          />
          <div>
            <label htmlFor={"direction"}>😈 Graph moving direction</label>
            <div className={styles.direction}>
              <input
                type="radio"
                id="long"
                value="long"
                name="direction"
                required={true}
                checked={direction === "long"}
                onChange={() => setDirection("long")}
              />
              <label htmlFor="long" style={{ color: "#0dcb82" }}>
                ↑
              </label>
              <input
                type="radio"
                id="short"
                value="short"
                name="direction"
                required={true}
                checked={direction === "short"}
                onChange={() => setDirection("short")}
              />
              <label htmlFor="short" style={{ color: "#f6475e" }}>
                ↓
              </label>
              <input
                type="radio"
                id="both"
                value="both"
                name="direction"
                required={true}
                checked={direction === "both"}
                onChange={() => setDirection("both")}
              />
              <label htmlFor="both">=</label>
            </div>
          </div>
          <button>{settings ? "Re-Start 🚀" : "Start 🚀"}</button>
        </form>
      </div>
    </div>
  );
};
