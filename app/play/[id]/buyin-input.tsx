"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { isNumberObject } from "util/types";

interface BuyinInputProps {
  value: number;
}

export default function BuyinInput({ value }: BuyinInputProps) {
  const [buyins, setBuyins] = useState<number | string>(value);

  return (
    <div className="flex gap-1.5 items-center justify-center">
      <Input
        name="buyins"
        value={buyins}
        onChange={(e) => {
          const { value } = e.target;
          if (isNaN(+value)) {
            setBuyins(value);
          } else {
            setBuyins(+value);
          }
        }}
      />
      <Button
        size="icon"
        className="tracking-widest px-2"
        variant="destructive"
        onClick={(e) => {
          e.preventDefault();
          setBuyins((buyins) => {
            if (isNaN(+buyins)) return 0.5;
            return +buyins + 0.5;
          });
        }}
      >
        +.5
      </Button>
      <Button
        size="icon"
        className="tracking-widest px-3"
        variant="secondary"
        onClick={(e) => {
          e.preventDefault();
          setBuyins((buyins) => {
            if (isNaN(+buyins)) return 1;
            return +buyins + 1;
          });
        }}
      >
        +1
      </Button>
    </div>
  );
}
