import type { ReactNode } from "react";

/**
 * Shared "ticket" layout wrapper — perforated top/bottom edges, paper-grain
 * texture, and a subtle rotation, matching how-singaporean-are-you_1.html's
 * `.ticket` card. Ported 1:1 as a shared component per the design direction.
 */
export function TicketShell({ children }: { children: ReactNode }) {
  return (
    <div className="ticket-card w-[min(440px,92vw)] rotate-[-0.6deg] py-1.5 shadow-[0_22px_48px_rgba(0,0,0,0.35),0_2px_0_rgba(0,0,0,0.06)]">
      <div className="p-6 md:p-7">{children}</div>
    </div>
  );
}
