import React, { useState } from 'react'
import { Pie } from 'react-chartjs-2';
import { Chart, registerables } from "chart.js";

Chart.register(...registerables)

const InstructorChart = ({ courses }) => {
  const [currChart, setCurrChart] = useState("students");

  // function to generate random colors
  const generateRandomColors = (numColors) => {
    const colors = [];
    for (let i = 0; i < numColors; i++) {
      const color = `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, 
      ${Math.floor(Math.random() * 256)})`
      colors.push(color);
    }
    return colors;
  }

  // create data for chart displaying student info
  const chartDataStudents = {
    labels: courses.map((course) => course.courseName),
    datasets: [
      {
        data: courses.map((course) => course.totalStudentsEnrolled),
        backgroundColor: generateRandomColors(courses.length),
      },
    ],
  }

  // create data for chart displaying income info
  const chartIncomeData = {
    labels: courses.map((course) => course.courseName),
    datasets: [
      {
        data: courses.map((course) => course.totalAmountGenerated),
        backgroundColor: generateRandomColors(courses.length),
      },
    ],
  }

  // create options
  const options = {
    maintainAspectRatio: false,
  }

  return (
    <div className="flex flex-1 flex-col gap-y-3 rounded-md w-full bg-global-bg-surface p-6">
      <p className='text-lg font-bold text-global-text-primary'>Visualize</p>
      <div className='space-x-4 font-semibold'>
        {/* Button to switch to Students and Income chart */}
        <button
          onClick={() => setCurrChart("students")}
          className={`rounded-sm p-1 px-3 transition-all duration-200 cursor-pointer ${currChart === "students"
            ? "bg-global-card-surface-2 text-global-highlight-text"
            : "text-global-highlight-text-muted"
            }`}
        >
          Students
        </button>
        <button
          onClick={() => setCurrChart("income")}
          className={`rounded-sm p-1 px-3 transition-all duration-200 cursor-pointer ${currChart === "income"
            ? "bg-global-card-surface-2 text-global-highlight-text"
            : "text-global-highlight-text-muted"
            }`}
        >
          Income
        </button>
      </div>

      <div className='mx-auto aspect-square h-72 w-full'>
        <Pie
          data={currChart === "students" ? chartDataStudents : chartIncomeData}
          options={options}
        />
      </div>
    </div>
  )
}

export default InstructorChart