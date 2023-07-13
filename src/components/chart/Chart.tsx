import React, { useEffect, useRef } from "react";

export const Chart = React.memo(
  ({
    initialCandles,
    initialPrice,
    volume,
    direction,
    updateSpeed,
    setLastPrice,
    disableBlock,
  }: {
    initialCandles: number;
    initialPrice: number;
    volume: number;
    direction: "long" | "short" | "both";
    updateSpeed: number;
    setLastPrice: React.Dispatch<React.SetStateAction<number | null>>;
    disableBlock?: boolean;
  }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const dpr = window.devicePixelRatio;
      const rect = canvas.getBoundingClientRect();

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      ctx.transform(1, 0, 0, -1, 0, canvas.height);

      const drawBlock = (
        x: number,
        y: number,
        width: number,
        height: number,
        text: string,
        color: string
      ) => {
        const borderRadius = 5;

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x + borderRadius, y);
        ctx.lineTo(x + width - borderRadius, y);
        ctx.arc(
          x + width - borderRadius,
          y + borderRadius,
          borderRadius,
          1.5 * Math.PI,
          2 * Math.PI
        );
        ctx.lineTo(x + width, y + height - borderRadius);
        ctx.arc(
          x + width - borderRadius,
          y + height - borderRadius,
          borderRadius,
          0,
          0.5 * Math.PI
        );
        ctx.lineTo(x + borderRadius, y + height);
        ctx.arc(
          x + borderRadius,
          y + height - borderRadius,
          borderRadius,
          0.5 * Math.PI,
          Math.PI
        );
        ctx.lineTo(x, y + borderRadius);
        ctx.arc(
          x + borderRadius,
          y + borderRadius,
          borderRadius,
          Math.PI,
          1.5 * Math.PI
        );
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, x + width / 2, y + height / 2);
      };

      function generateCandles(amount: number, prevClose?: number): number[][] {
        const candles = [];
        let previousClose = prevClose ? prevClose : initialPrice;

        for (let i = 0; i < amount; i++) {
          const open = previousClose;
          const close =
            open +
            Math.random() *
              (volume +
                (direction === "long"
                  ? -(volume * 0.1)
                  : direction === "short"
                  ? volume * 0.1
                  : 0)) -
            volume / 2;
          const high = Math.max(open, close) + (Math.random() * volume) / 4;
          const low = Math.min(open, close) - (Math.random() * volume) / 4;

          const candle = [open, close, low, high];
          candles.push(candle);

          previousClose = close;
        }

        return candles;
      }

      const candleData = generateCandles(initialCandles);

      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;

      const margin = 10;
      const marginTopBottom = 40;

      let minValue = Math.max(...candleData.map((x) => x.at(-1)!));
      let maxValue = Math.min(...candleData.map((x) => x.at(-2)!));

      function priceToPixel(price: number) {
        const range = maxValue - minValue;
        const pixelsPerUnit = (canvasHeight - 2 * marginTopBottom) / range;
        return marginTopBottom + (maxValue - price) * pixelsPerUnit;
      }

      function drawCandles() {
        ctx.font = "500 30px 'Ubuntu'";
        const candleWidth =
          (canvasWidth - 2 * margin - (candleData.length - 1) * 5) /
          candleData.length;

        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        for (let i = 0; i < candleData.length; i++) {
          const [open, close, min, max] = candleData[i];

          const x = margin + i * (candleWidth + 5);
          const y1 = priceToPixel(open);
          const y2 = priceToPixel(close);
          const y3 = priceToPixel(min);
          const y4 = priceToPixel(max);

          ctx.beginPath();
          ctx.fillStyle = close >= open ? "#f6475e" : "#0dcb82";
          ctx.fillRect(x, y1, candleWidth, y2 - y1);

          ctx.strokeStyle = close >= open ? "#f62f4a" : "#0dcb82";
          ctx.lineWidth = 1;
          ctx.moveTo(x + candleWidth / 2, y4);
          ctx.lineTo(x + candleWidth / 2, y2);
          ctx.moveTo(x + candleWidth / 2, y3);
          ctx.lineTo(x + candleWidth / 2, y1);
          ctx.stroke();

          const currentPrice = candleData[candleData.length - 1][1];

          setLastPrice(-currentPrice);

          const prevPrice = candleData[candleData.length - 2][1];
          const yCurrentPrice = priceToPixel(currentPrice);

          if (!disableBlock) {
            ctx.setLineDash([5, 5]);
            ctx.strokeStyle =
              -currentPrice > -prevPrice ? "#0dcb82" : "#f6475e";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(margin, yCurrentPrice);
            ctx.lineTo(canvasWidth - margin, yCurrentPrice);
            ctx.stroke();
            ctx.setLineDash([]);

            drawBlock(
              margin,
              yCurrentPrice - 35 / 2,
              140,
              35,
              (-currentPrice).toFixed(2),
              -currentPrice > -prevPrice ? "#0dcb82" : "#f6475e"
            );
          }
        }
      }

      function autoScale() {
        minValue = Math.max(...candleData.map((x) => x.at(-1)!));
        maxValue = Math.min(...candleData.map((x) => x.at(-2)!));
      }

      drawCandles();

      const onResize = () => {
        autoScale();

        const dpr = window.devicePixelRatio;
        const rect = canvas.getBoundingClientRect();

        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;

        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;

        drawCandles();
      };

      onResize();

      window.onresize = onResize;

      ctx.font = "500 30px 'Ubuntu'";

      const interval = setInterval(() => {
        if (localStorage.getItem("chart-pause") === "true") return;

        const newCandle = generateCandles(1, candleData.at(-1)![1])[0];
        candleData.push(newCandle);
        candleData.shift();
        autoScale();
        drawCandles();
      }, updateSpeed);

      return () => {
        clearInterval(interval);
      };
    }, []);

    return <canvas ref={canvasRef} />;
  }
);
