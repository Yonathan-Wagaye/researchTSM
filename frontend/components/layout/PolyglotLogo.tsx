"use client";

import Box from "@mui/material/Box";
import SvgIcon from "@mui/material/SvgIcon";

type PolyglotLogoProps = {
  size?: number;
  className?: string;
  title?: string;
};

/** Material Translate icon in a graphite tile — language / localization. */
const PolyglotLogo = ({
  size = 48,
  className,
  title = "Polyglot",
}: PolyglotLogoProps) => {
  const iconSize = Math.round(size * 0.58);

  return (
    <Box
      component="span"
      className={className}
      role="img"
      aria-label={title}
      title={title}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: 2,
        bgcolor: "#FFFFFF",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.35)",
        flexShrink: 0,
      }}
    >
      <SvgIcon
        sx={{ fontSize: iconSize, color: "#111111" }}
        viewBox="0 0 24 24"
      >
        {/* Material Design "Translate" icon */}
        <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" />
      </SvgIcon>
    </Box>
  );
};

export default PolyglotLogo;
