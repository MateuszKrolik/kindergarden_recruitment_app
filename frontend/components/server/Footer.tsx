"use server";

export async function Footer() {
  return (
    <div className="flex items-center justify-center border-t mt-4 py-2 md:p-3 lg:p-4">
      <div className="flex flex-col md:flex-row items-center gap-2 text-lg font-medium">
        <span className="font-semibold">
          Real-time Kindergarden Recruitment App
        </span>
        <span>© 2025 | All rights reserved</span>
      </div>
    </div>
  );
}
