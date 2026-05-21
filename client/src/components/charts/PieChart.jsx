import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const palette = [
  "#6366f1",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#0ea5e9",
  "#a855f7",
];

export default function PieChart({ labels, data }) {
  return (
    <Doughnut
      data={{
        labels,
        datasets: [
          {
            data,
            backgroundColor: labels.map((_, i) => palette[i % palette.length]),
            borderWidth: 0,
          },
        ],
      }}
      options={{
        plugins: { legend: { position: "bottom" } },
        cutout: "60%",
      }}
    />
  );
}
