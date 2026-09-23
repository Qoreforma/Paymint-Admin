import React from "react";
import { Line, Bar, Pie, PolarArea, Doughnut } from "react-chartjs-2";

import { Chart, CategoryScale, LinearScale, BarElement, PointElement, LineElement, RadialLinearScale, Tooltip, Filler, Legend, } from "chart.js";
Chart.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, RadialLinearScale, Tooltip, Filler, Legend,);

export const LineChartExample = ({ data, legend }) => {
  return (
    <Line
      className="line-chart"
      data={data}
      options={{
        plugins: {
          legend: {
              display: legend,
              labels: {
                boxWidth: 12,
                padding: 20,
                fontColor: "#6783b8",
              },
          },
          tooltip: {
              enabled: true,
              displayColors: false,
              backgroundColor: "#eff6ff",
              titleFont: {
                size: '13px',
              },
              titleColor: "#6783b8",
              titleMarginBottom: 6,
              bodyColor: "#9eaecf",
              bodyFont: {
                size: '12px',
              },
              bodySpacing: 4,
              padding: 10,
              footerMarginTop: 0,
          },
        },
        maintainAspectRatio: false,
        scales: {
          y:{
              display: true,
              ticks: {
                beginAtZero: false,
                color:"#9eaecf", 
                font: {
                  size: '12px',
                },
                padding: 10,
              },
              grid: {
                tickMarkLength: 0,
              },
            },
          x: 
            {
              display: true,
              ticks: {
                color:"#9eaecf", 
                font: {
                  size: '12px',
                },
                source: "auto",
                padding: 5,
              },
              grid: {
                color: "transparent",
                tickMarkLength: 10,
                offsetGridLines: true,
              },
            },
        },
      }}
    />
  );
};

export const BarChartExample = ({ data, stacked, onBarClick }) => {
  return (
    <Bar
      data={data}
      options={{
        interaction: onBarClick
          ? {
              mode: "index",
              intersect: false,
            }
          : {
              mode: "nearest",
              intersect: true,
            },
        onHover: (event, elements, chart) => {
          if (onBarClick && event?.native?.target) {
            let hasEl = elements && elements.length > 0;
            if (!hasEl && chart && event?.native) {
              const els = chart.getElementsAtEventForMode(
                event.native,
                "index",
                { intersect: false },
                false
              );
              hasEl = els && els.length > 0;
            }
            event.native.target.style.cursor = hasEl ? "pointer" : "default";
          }
        },
        onClick: (event, elements, chart) => {
          if (!onBarClick) return;
          let targetElements = elements;
          if ((!targetElements || targetElements.length === 0) && chart && event?.native) {
            targetElements = chart.getElementsAtEventForMode(
              event.native,
              "index",
              { intersect: false },
              false
            );
          }
          if (targetElements && targetElements.length > 0) {
            const elementIndex = targetElements[0].index;
            const label = chart?.data?.labels?.[elementIndex] || data?.labels?.[elementIndex];
            if (label) {
              onBarClick(label, elementIndex);
            }
          }
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: true,
            displayColors: false,
            backgroundColor: "#1e293b",
            titleFont: {
              size: "13px",
              weight: "bold",
            },
            titleColor: "#ffffff",
            titleMarginBottom: 6,
            bodyColor: "#cbd5e1",
            bodyFont: {
              size: "12px",
            },
            bodySpacing: 4,
            padding: 10,
            footerMarginTop: 6,
            footerColor: "#38bdf8",
            footerFont: {
              size: "11px",
              weight: "600",
            },
            callbacks: {
              footer: (items) => {
                if (onBarClick && items && items.length > 0) {
                  return "👆 Click to filter by this day";
                }
                return "";
              },
            },
          },
        },
        maintainAspectRatio: false,
        scales: {
          y: {
            display: true,
            stacked: stacked ? true : false,
            ticks: {
              beginAtZero: true,
              color: "#9eaecf",
              font: {
                size: "12px",
              },
              padding: 5,
            },
            grid: {
              tickMarkLength: 0,
            },
          },
          x: {
            display: true,
            stacked: stacked ? true : false,
            ticks: {
              color: "#9eaecf",
              font: {
                size: "12px",
              },
              source: "auto",
              padding: 5,
            },
            grid: {
              color: "transparent",
              tickMarkLength: 10,
              zeroLineColor: "transparent",
            },
          },
        },
      }}
    />
  );
};

export const PieChartExample = ({ data }) => {
  return (
    <Pie
      data={data}
      options={{
        plugins: {
          legend: {
              display: false,
          },
          tooltip: {
              enabled: true,
              displayColors: false,
              backgroundColor: "#eff6ff",
              titleFont: {
                size: '13px',
              },
              titleColor: "#6783b8",
              titleMarginBottom: 6,
              bodyColor: "#9eaecf",
              bodyFont: {
                size: '12px',
              },
              bodySpacing: 4,
              padding: 10,
              footerMarginTop: 0,
          },
        },
        rotation: -0.2,
        maintainAspectRatio: false,
      }}
    />
  );
};

export const DoughnutExample = ({ data }) => {
  return (
    <Doughnut
      data={data}
      options={{
        plugins: {
          legend: {
              display: false,
          },
          tooltip: {
              enabled: true,
              displayColors: false,
              backgroundColor: "#eff6ff",
              titleFont: {
                size: '13px',
              },
              titleColor: "#6783b8",
              titleMarginBottom: 6,
              bodyColor: "#9eaecf",
              bodyFont: {
                size: '12px',
              },
              bodySpacing: 4,
              padding: 10,
              footerMarginTop: 0,
          },
        },
        rotation: 1,
        cutoutPercentage: 40,
        maintainAspectRatio: false,
      }}
    />
  );
};

export const PolarExample = ({ data }) => {
  return (
    <PolarArea
      data={data}
      options={{
        plugins: {
          legend: {
              display: false,
          },
          tooltip: {
              enabled: true,
              displayColors: false,
              backgroundColor: "#eff6ff",
              titleFont: {
                size: '13px',
              },
              titleColor: "#6783b8",
              titleMarginBottom: 6,
              bodyColor: "#9eaecf",
              bodyFont: {
                size: '12px',
              },
              bodySpacing: 4,
              padding: 10,
              footerMarginTop: 0,
          },
        },
        maintainAspectRatio: false,
      }}
    />
  );
};
