import { Zap, Users, Anchor, Navigation, Link } from "lucide-react"

export function getInfluenceIcon(style: string, size: number = 64) {
  const iconProps = {
    width: size,
    height: size,
    className: "text-white"
  }

  switch (style?.toLowerCase()) {
    case "catalyst":
      return <Zap {...iconProps} />
    case "diplomat":
      return <Users {...iconProps} />
    case "anchor":
      return <Anchor {...iconProps} />
    case "navigator":
      return <Navigation {...iconProps} />
    case "connector":
      return <Link {...iconProps} />
    default:
      return <Users {...iconProps} />
  }
}
