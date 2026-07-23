import { Leaderboard } from "~/app/_components/Leaderboard";
import { WordleApp } from "~/app/_components/WordleApp";

export default function HomePage() {
  return (
    <main className="ticket-stage flex min-h-screen flex-col items-center px-4 pt-9 pb-12">
      <div className="mx-auto flex w-full max-w-[440px] flex-col items-center">
        <WordleApp />
        <Leaderboard />
      </div>
    </main>
  );
}
