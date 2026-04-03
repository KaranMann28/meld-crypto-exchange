"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function TransactionCompletePage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-16 space-y-6">
      <Card className="border-violet-500/20 shadow-lg shadow-violet-500/5">
        <CardContent className="pt-8 pb-8 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-green-500/15 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold">Transaction Submitted</h1>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            Your transaction has been submitted to the provider. You can track
            its status using the transaction ID on the Transactions page.
          </p>
          <div className="flex gap-3 justify-center pt-2">
            <Button variant="outline" asChild>
              <a href="/transactions">Track Transaction</a>
            </Button>
            <Button
              asChild
              className="bg-gradient-to-r from-violet-600 to-indigo-600"
            >
              <a href="/">New Purchase</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
