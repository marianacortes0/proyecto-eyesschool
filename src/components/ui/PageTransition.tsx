"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
        transition={{
          duration: 0.45,
          ease: [0.22, 1, 0.36, 1], // easing suave tipo iOS
        }}
        className="flex flex-col min-h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}