import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { gsap } from "gsap";

const lightVars = {
  "--background": "0 0% 100%",
  "--foreground": "222.2 84% 4.9%",
};

const darkVars = {
  "--background": "222.2 84% 4.9%",
  "--foreground": "210 40% 98%",
};

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
  }, []);

  const handleToggle = () => {
    const root = document.documentElement;
    const targetVars = isDark ? lightVars : darkVars;
    gsap.to(root, {
      duration: 0.6,
      ease: "power2.out",
      ...targetVars,
      onComplete: () => {
        root.classList.toggle("dark", !isDark);
        Object.keys(targetVars).forEach(v => root.style.removeProperty(v));
        const newTheme = isDark ? "light" : "dark";
        localStorage.setItem("theme", newTheme);
        setIsDark(!isDark);
      },
    });
  };

  return (
    <button
      aria-label="Toggle dark mode"
      onClick={handleToggle}
      className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 transition-colors"
    >
      {isDark ? (
        <Sun className="h-5 w-5 text-yellow-300" />
      ) : (
        <Moon className="h-5 w-5 text-gray-800" />
      )}
    </button>
  );
}
