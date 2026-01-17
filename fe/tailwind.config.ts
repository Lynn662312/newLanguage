import type { Config } from "tailwindcss"

const config: Config = {
    content: ["./index.html", "./src/**/*.{ts,tsx}"],
    theme: {
        extend: {
            colors: {
                mintBg: "#ECFDF5",
                mint: "#6EE7B7",
                mintDark: "#10B981",
                mintText: "#064E3B"
            }
        }
    },
    plugins: []
}

export default config
