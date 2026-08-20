'use client';

interface DayDisplayProps {
  date: Date;
}

const DAYS = [
  'SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 
  'THURSDAY', 'FRIDAY', 'SATURDAY'
];

export function DayDisplay({ date }: DayDisplayProps) {
  const dayName = DAYS[date.getDay()];
  
  return (
    <div className="select-none">
      <h1 className="text-8xl md:text-9xl font-extralight tracking-[0.3em] text-black/80 drop-shadow-sm">
        {dayName}
      </h1>
    </div>
  );
}
