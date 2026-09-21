import React from 'react'

const Stats = [
	{ count: "5K", label: "Active Students" },
	{ count: "10+", label: "Mentors" },
	{ count: "200+", label: "Courses" },
	{ count: "50+", label: "Awards" },
];

const StatsComponent = () => {
	return (
		<div className="bg-global-card-surface-2">
			<div className="flex flex-col gap-10 justify-between w-11/12 max-w-(--max-content) text-white mx-auto">
				<div className="grid grid-cols-2 md:grid-cols-4 text-center">
					{
						Stats.map((data, index) => {
							return (
								<div className="flex flex-col py-10" key={index}>
									<p className="text-[30px] font-bold text-global-text-primary">
										{data.count}
									</p>
									<p className="body-2-md font-semibold text-global-text-disabled">
										{data.label}
									</p>
								</div>
							)
						})
					}
				</div>
			</div>
		</div>
	)
}

export default StatsComponent