import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function BarChart({ labels, data }) {
  return (
    <Bar
      data={{
        labels,
        datasets: [
          {
            label: "Votes",
            data,
            backgroundColor: "rgba(99,102,241,0.75)",
            borderRadius: 8,
          },
        ],
      }}
      options={{
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
      }}
    />
  );
}
