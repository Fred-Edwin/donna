"use client";

import { useEveAgent } from "eve/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/**
 * Minimal placeholder chat panel proving apps/web talks to the real
 * apps/agent (eve) brain. Not the designed Chat Panel (Paper artboards
 * "11"/"11h" etc.) — that's Phase 1 Slice C. This exists to make Slice A's
 * "typed chat wired to the agent" exit criterion demoable.
 */
export function ChatPanel() {
  const agent = useEveAgent();
  const [input, setInput] = useState("");

  const isBusy = agent.status === "submitted" || agent.status === "streaming";
  const isResuming = agent.status === "resuming";

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isResuming) {
      return;
    }
    setInput("");
    void agent.send(trimmed, isBusy ? { turnPolicy: "steer" } : undefined);
  }

  return (
    <div className="flex h-dvh w-full flex-col bg-background">
      <header className="flex h-14 shrink-0 items-center border-b border-border/40 px-4 text-sm text-muted-foreground">
        Donna
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto flex max-w-2xl flex-col gap-4">
          {agent.data.messages.map((message) => (
            <article
              className={cn(
                "flex flex-col gap-1",
                message.role === "user" ? "items-end" : "items-start"
              )}
              key={message.id}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-2 text-sm",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                )}
              >
                {message.parts.map((part, index) =>
                  part.type === "text" ? (
                    // biome-ignore lint/suspicious/noArrayIndexKey: parts are stable per message
                    <p key={index}>{part.text}</p>
                  ) : null
                )}
              </div>
            </article>
          ))}
          {agent.status === "error" && (
            <p className="text-sm text-destructive">
              {agent.error?.message ?? "Something went wrong."}
            </p>
          )}
        </div>
      </div>

      <form
        className="shrink-0 border-t border-border/40 p-4"
        onSubmit={handleSubmit}
      >
        <div className="mx-auto flex max-w-2xl gap-2">
          <Textarea
            disabled={isResuming}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                handleSubmit(event);
              }
            }}
            placeholder="Ask Donna anything..."
            value={input}
          />
          <Button disabled={isResuming || !input.trim()} type="submit">
            Send
          </Button>
        </div>
      </form>
    </div>
  );
}
