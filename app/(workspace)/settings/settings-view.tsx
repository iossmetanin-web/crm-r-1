"use client";

import { Bell, MoonStar, Shield, UserCircle2 } from "lucide-react";
import { useState } from "react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type ToggleProps = {
  label: string;
  description: string;
  value: boolean;
  onChange: () => void;
};

function ToggleRow({ label, description, value, onChange }: ToggleProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-secondary/20 px-3 py-2">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <button
        type="button"
        onClick={onChange}
        className={cn(
          "relative h-6 w-11 rounded-full transition-colors",
          value ? "bg-primary" : "bg-muted",
        )}
      >
        <span
          className={cn(
            "absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform",
            value && "translate-x-5",
          )}
        />
      </button>
    </div>
  );
}

export function SettingsView() {
  const [productUpdates, setProductUpdates] = useState(true);
  const [taskAlerts, setTaskAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [ssoEnabled, setSsoEnabled] = useState(true);

  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Settings</p>
        <h1 className="font-display text-3xl font-semibold">Workspace Preferences</h1>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="inline-flex items-center gap-2">
              <UserCircle2 className="h-5 w-5 text-primary" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Input defaultValue="Ava Reynolds" placeholder="Full name" />
              <Input defaultValue="Head of Revenue" placeholder="Role" />
            </div>
            <Input defaultValue="ava@apexcrm.com" placeholder="Email" />
            <Textarea defaultValue="Focus: enterprise growth, account strategy, and forecast quality." />
            <Button className="w-full sm:w-auto">Save profile</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="inline-flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ToggleRow
              label="Product updates"
              description="Release notes and feature rollouts"
              value={productUpdates}
              onChange={() => setProductUpdates((current) => !current)}
            />
            <ToggleRow
              label="Task reminders"
              description="Daily reminders for assigned actions"
              value={taskAlerts}
              onChange={() => setTaskAlerts((current) => !current)}
            />
            <ToggleRow
              label="Weekly digest"
              description="Monday summary for pipeline and team velocity"
              value={weeklyDigest}
              onChange={() => setWeeklyDigest((current) => !current)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="inline-flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ToggleRow
              label="SSO enforcement"
              description="Require Google or Microsoft SSO login"
              value={ssoEnabled}
              onChange={() => setSsoEnabled((current) => !current)}
            />
            <div className="rounded-xl border border-border/60 bg-secondary/20 p-3 text-sm text-muted-foreground">
              Last login from San Francisco, CA on Mar 15 at 09:26.
            </div>
            <Button variant="outline">Rotate API token</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="inline-flex items-center gap-2">
              <MoonStar className="h-5 w-5 text-primary" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">Switch between dark and light modes anytime.</p>
            <ThemeToggle />
            <div className="rounded-xl border border-border/60 bg-secondary/20 p-3 text-sm text-muted-foreground">
              Typography: Manrope + Space Grotesk
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
