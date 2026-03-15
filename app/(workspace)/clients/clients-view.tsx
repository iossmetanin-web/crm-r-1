"use client";

import { motion } from "framer-motion";
import { Building2, Mail, MapPin, Phone, Search, Wallet } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { clients } from "@/lib/data/mock";
import { cn, formatCurrency } from "@/lib/utils";

function statusBadgeVariant(status: string) {
  if (status === "At Risk") return "destructive" as const;
  if (status === "New") return "secondary" as const;
  return "default" as const;
}

export function ClientsView() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(clients[0]?.id ?? "");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return clients;
    return clients.filter((client) =>
      [client.name, client.company, client.email].some((field) => field.toLowerCase().includes(normalized)),
    );
  }, [query]);

  const selectedClient = filtered.find((client) => client.id === selectedId) ?? filtered[0] ?? clients[0];

  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Clients</p>
        <h1 className="font-display text-3xl font-semibold">Account Directory</h1>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_1.4fr]">
        <Card className="overflow-hidden">
          <CardHeader className="space-y-3">
            <CardTitle className="text-lg">Client List</CardTitle>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search clients"
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ScrollArea className="h-[470px] pr-2">
              <div className="space-y-2">
                {filtered.map((client) => (
                  <button
                    key={client.id}
                    className={cn(
                      "w-full rounded-xl border p-3 text-left transition-colors",
                      selectedClient?.id === client.id
                        ? "border-primary/55 bg-primary/10"
                        : "border-border/60 bg-secondary/20 hover:bg-secondary/45",
                    )}
                    onClick={() => setSelectedId(client.id)}
                  >
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold">{client.name}</p>
                      <Badge variant={statusBadgeVariant(client.status)}>{client.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{client.company}</p>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {selectedClient ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="h-full">
              <CardHeader className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-2xl">{selectedClient.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{selectedClient.company}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={statusBadgeVariant(selectedClient.status)}>{selectedClient.status}</Badge>
                    <Badge variant="outline">{selectedClient.tier}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-border/60 bg-secondary/25 p-3 text-sm">
                    <p className="mb-1 inline-flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      Email
                    </p>
                    <p>{selectedClient.email}</p>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-secondary/25 p-3 text-sm">
                    <p className="mb-1 inline-flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      Phone
                    </p>
                    <p>{selectedClient.phone}</p>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-secondary/25 p-3 text-sm">
                    <p className="mb-1 inline-flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      Location
                    </p>
                    <p>{selectedClient.location}</p>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-secondary/25 p-3 text-sm">
                    <p className="mb-1 inline-flex items-center gap-2 text-muted-foreground">
                      <Wallet className="h-4 w-4" />
                      Annual Value
                    </p>
                    <p>{formatCurrency(selectedClient.value)}</p>
                  </div>
                </div>

                <div className="rounded-xl border border-border/60 bg-secondary/20 p-4">
                  <p className="mb-2 inline-flex items-center gap-2 text-sm font-medium">
                    <Building2 className="h-4 w-4 text-primary" />
                    Profile Notes
                  </p>
                  <p className="text-sm text-muted-foreground">{selectedClient.notes}</p>
                </div>

                <div>
                  <p className="mb-3 text-sm font-medium">Timeline</p>
                  <div className="space-y-2 text-sm">
                    {[
                      "Kickoff completed with success team",
                      "Contract addendum signed for expansion seats",
                      "Quarterly business review scheduled next week",
                    ].map((item) => (
                      <div key={item} className="rounded-lg border border-border/50 bg-secondary/15 p-3">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : null}
      </div>
    </section>
  );
}
