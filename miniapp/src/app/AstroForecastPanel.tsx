"use client";

export default function AstroForecastPanel() {
  return (
    <div className="flex flex-col px-0 py-0 border rounded-lg shadow-lg bg-transparent border-transparent">
      <h2 className="text-xl text-center font-bold mb-0 select-none">
        Astrological Forecast
      </h2>
      <h3 className="text-normal text-center mt-0 text-white/60 select-none">
        Week of{" "}
        {new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })}
        {" - "}
        {new Date(
          new Date().setDate(new Date().getDate() + 7),
        ).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })}
      </h3>
      <p className="text-white text-center mt-4 select-none">
        Today is a good day to start a new project. Lean into your creativity
        and let your imagination run wild. Don&apos;t be afraid to take risks
        and try something new.
      </p>
    </div>
  );
}
