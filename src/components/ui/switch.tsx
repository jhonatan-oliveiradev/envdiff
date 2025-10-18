"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

function Switch({
	className,
	...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
	return (
		<SwitchPrimitive.Root
			className={cn(
				// Base styles
				"peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
				"disabled:cursor-not-allowed disabled:opacity-50",
				// Colors - estado checked
				"data-[state=checked]:bg-primary",
				// Colors - estado unchecked
				"data-[state=unchecked]:bg-slate-700",
				className
			)}
			{...props}
		>
			<SwitchPrimitive.Thumb
				className={cn(
					// Base styles
					"pointer-events-none block h-5 w-5 rounded-full shadow-lg transition-transform",
					// Colors
					"bg-white",
					// Position
					"data-[state=checked]:translate-x-5",
					"data-[state=unchecked]:translate-x-0"
				)}
			/>
		</SwitchPrimitive.Root>
	);
}

export { Switch };
