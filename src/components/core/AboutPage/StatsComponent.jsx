import React from 'react';

const Stats = [
  { count: '5K', label: 'Active Students' },
  { count: '10+', label: 'Mentors' },
  { count: '200+', label: 'Courses' },
  { count: '50+', label: 'Awards' },
];

const StatsComponent = () => {
  return (
    <div className="bg-global-card-surface-2">
      <div className="mx-auto flex w-11/12 max-w-(--max-content) flex-col justify-between gap-10 text-white">
        <div className="grid grid-cols-2 text-center md:grid-cols-4">
          {Stats.map((data, index) => {
            return (
              <div className="flex flex-col py-10" key={index}>
                <p className="text-global-text-primary text-[30px] font-bold">{data.count}</p>
                <p className="body-2-md text-global-text-disabled font-semibold">{data.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StatsComponent;
