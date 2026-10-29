/**
 * Dynamic Multi-Server Database Cluster Routing & Connection Manager
 * 
 * Automatically detects and scans any MongoDB database server nodes configured in .env
 * Supports any number of global regions and any number of server nodes per region.
 */

import fs from "node:fs";
import path from "node:path";

export type RegionGroup = string;

export interface RegionInfo {
  code: string;
  name: string;
  flag: string;
  baseLatency: number;
  serversCount: number;
}

export interface ServerNodeConfig {
  id: string; // e.g. "SG_1", "DC_3", "JKT_1"
  group: string; // e.g. "SG", "DC", "JKT"
  serverIndex: number; // e.g. 1, 2, 3...
  uri: string;
  regionName: string;
  flag: string;
  baseLatency: number;
  isConfigured: boolean;
}

export const KNOWN_REGION_METADATA: Record<string, { name: string; flag: string; baseLatency: number }> = {
  SG: { name: "Singapore", flag: "🇸🇬", baseLatency: 16 },
  SIN: { name: "Singapore", flag: "🇸🇬", baseLatency: 16 },
  DC: { name: "Washington DC, USA", flag: "🇺🇸", baseLatency: 155 },
  WDC: { name: "Washington DC, USA", flag: "🇺🇸", baseLatency: 155 },
  BOMB: { name: "Mumbai, India", flag: "🇮🇳", baseLatency: 58 },
  BLR: { name: "Bangalore, India", flag: "🇮🇳", baseLatency: 62 },
  SYD: { name: "Sydney, Australia", flag: "🇦🇺", baseLatency: 94 },
  SF: { name: "San Francisco, USA", flag: "🇺🇸", baseLatency: 138 },
  PDX: { name: "Portland, USA", flag: "🇺🇸", baseLatency: 142 },
  LHR: { name: "London, UK", flag: "🇬🇧", baseLatency: 172 },
  KIX: { name: "Osaka/Tokyo, Japan", flag: "🇯🇵", baseLatency: 64 },
  TYO: { name: "Tokyo, Japan", flag: "🇯🇵", baseLatency: 64 },
  NRT: { name: "Tokyo, Japan", flag: "🇯🇵", baseLatency: 64 },
  JP: { name: "Tokyo, Japan", flag: "🇯🇵", baseLatency: 64 },
  JAPAN: { name: "Japan", flag: "🇯🇵", baseLatency: 64 },
  KOR: { name: "Seoul, South Korea", flag: "🇰🇷", baseLatency: 72 },
  ICN: { name: "Seoul, South Korea", flag: "🇰🇷", baseLatency: 72 },
  JKT: { name: "Jakarta, Indonesia", flag: "🇮🇩", baseLatency: 12 },
  ID: { name: "Jakarta, Indonesia", flag: "🇮🇩", baseLatency: 12 },
  FRA: { name: "Frankfurt, Germany", flag: "🇩🇪", baseLatency: 168 },
  AMS: { name: "Amsterdam, Netherlands", flag: "🇳🇱", baseLatency: 170 },
  CDG: { name: "Paris, France", flag: "🇫🇷", baseLatency: 175 },
  HKG: { name: "Hong Kong", flag: "🇭🇰", baseLatency: 45 },
  DUB: { name: "Dublin, Ireland", flag: "🇮🇪", baseLatency: 180 },
  GRU: { name: "São Paulo, Brazil", flag: "🇧🇷", baseLatency: 280 },
  CPT: { name: "Cape Town, South Africa", flag: "🇿🇦", baseLatency: 310 },
};

/**
 * Reads the latest .env file directly from disk to ensure zero-delay instant updates 
 * when the developer edits, adds, or uncomments server endpoints in .env.
 * Falls back to process.env if the file is absent (e.g. production/cloud environments).
 */
export function getActiveEnvMap(): Record<string, string> {
  const envMap: Record<string, string> = {};

  // 1. Populate from process.env (base / runtime)
  for (const [key, val] of Object.entries(process.env)) {
    if (val !== undefined) {
      envMap[key] = val;
    }
  }

  // 2. If .env file exists on disk, parse it directly as the live source of truth
  const envPath = path.join(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    try {
      const content = fs.readFileSync(envPath, "utf-8");

      // Reset cached cluster keys so commented-out lines with '#' are removed immediately
      for (const k of Object.keys(envMap)) {
        if (k.startsWith("NEXT_GROUP_SERVER_")) {
          delete envMap[k];
        }
      }

      const lines = content.split(/\r?\n/);
      for (const line of lines) {
        const trimmed = line.trim();
        // Skip comment lines and blank lines
        if (!trimmed || trimmed.startsWith("#")) continue;

        const eqIdx = trimmed.indexOf("=");
        if (eqIdx > 0) {
          const key = trimmed.substring(0, eqIdx).trim();
          let val = trimmed.substring(eqIdx + 1).trim();

          // Strip surrounding quotes
          if (
            (val.startsWith('"') && val.endsWith('"')) ||
            (val.startsWith("'") && val.endsWith("'"))
          ) {
            val = val.substring(1, val.length - 1);
          }

          envMap[key] = val;
        }
      }
    } catch (err) {
      console.warn("Could not read local .env file directly:", err);
    }
  }

  return envMap;
}

/**
 * Automatically scans and detects all configured MongoDB cluster servers from .env
 */
export function getDiscoveredServers(): ServerNodeConfig[] {
  const env = getActiveEnvMap();
  const servers: ServerNodeConfig[] = [];

  // Match: NEXT_GROUP_SERVER_<GROUP>_<INDEX>_MONGODB_URI
  const pattern = /^NEXT_GROUP_SERVER_([A-Za-z0-9]+)_(\d+)_MONGODB_URI$/i;

  for (const [key, uri] of Object.entries(env)) {
    const match = key.match(pattern);
    if (!match) continue;

    const group = match[1].toUpperCase();
    const serverIndex = parseInt(match[2], 10);
    const id = `${group}_${serverIndex}`;

    const meta = KNOWN_REGION_METADATA[group] || {
      name: `Region ${group}`,
      flag: "🌐",
      baseLatency: 50,
    };

    const isConfigured = !!uri && !uri.includes("CHANGE_PASSWORD");

    servers.push({
      id,
      group,
      serverIndex,
      uri,
      regionName: meta.name,
      flag: meta.flag,
      baseLatency: meta.baseLatency,
      isConfigured,
    });
  }

  // Sort logically: active group first, then alphabetical, then by serverIndex ascending
  const activeGroup = (env.NEXT_GROUP || "SG").toUpperCase();
  servers.sort((a, b) => {
    if (a.group !== b.group) {
      if (a.group === activeGroup) return -1;
      if (b.group === activeGroup) return 1;
      return a.group.localeCompare(b.group);
    }
    return a.serverIndex - b.serverIndex;
  });

  return servers;
}

/**
 * Groups discovered servers into distinct regions with server counts
 */
export function getDiscoveredRegions(): RegionInfo[] {
  const env = getActiveEnvMap();
  const activeGroup = (env.NEXT_GROUP || "SG").toUpperCase();
  const servers = getDiscoveredServers();
  const regionMap = new Map<string, RegionInfo>();

  for (const s of servers) {
    if (!regionMap.has(s.group)) {
      const meta = KNOWN_REGION_METADATA[s.group] || {
        name: `Region ${s.group}`,
        flag: "🌐",
        baseLatency: 50,
      };

      regionMap.set(s.group, {
        code: s.group,
        name: meta.name,
        flag: meta.flag,
        baseLatency: meta.baseLatency,
        serversCount: 0,
      });
    }

    const reg = regionMap.get(s.group)!;
    reg.serversCount += 1;
  }

  return Array.from(regionMap.values()).sort((a, b) => {
    if (a.code === activeGroup) return -1;
    if (b.code === activeGroup) return 1;
    return a.code.localeCompare(b.code);
  });
}

/**
 * Retrieves the MongoDB URI for a specific group and server number
 */
export function getServerUri(group: string, serverIndex: number = 1): string | null {
  const env = getActiveEnvMap();
  const envKey = `NEXT_GROUP_SERVER_${group.toUpperCase()}_${serverIndex}_MONGODB_URI`;
  return env[envKey] || null;
}

/**
 * Retrieves all server connection URIs for a specific region/group
 */
export function getRegionServers(group: string): Array<{ server: string; uri: string | null }> {
  const servers = getDiscoveredServers().filter(
    (s) => s.group.toUpperCase() === group.toUpperCase()
  );
  return servers.map((s) => ({
    server: s.id,
    uri: s.uri,
  }));
}

/**
 * Resolves the currently active group and server based on NEXT_GROUP and NEXT_GROUP_SERVER
 */
export function getActiveClusterConfig(): {
  group: string;
  server: string;
  regionName: string;
  flag: string;
  uri: string | null;
} {
  const env = getActiveEnvMap();
  const servers = getDiscoveredServers();

  let group = (env.NEXT_GROUP?.toUpperCase() || "SG");
  let server = env.NEXT_GROUP_SERVER?.toUpperCase() || `${group}_1`;

  // Verify if the active server exists in discovered servers. If not, pick the first available server
  let matched = servers.find((s) => s.id === server);
  if (!matched && servers.length > 0) {
    matched = servers[0];
    group = matched.group;
    server = matched.id;
  }

  const meta = KNOWN_REGION_METADATA[group] || {
    name: matched ? matched.regionName : `Region ${group}`,
    flag: matched ? matched.flag : "🌐",
    baseLatency: 50,
  };

  const uri = matched ? matched.uri : getServerUri(group, 1);

  return {
    group,
    server,
    regionName: meta.name,
    flag: meta.flag,
    uri,
  };
}

/**
 * Persists the active group and server in memory and into the .env file
 */
export function updateActiveClusterInEnv(group: string, server: string): boolean {
  process.env.NEXT_GROUP = group.toUpperCase();
  process.env.NEXT_GROUP_SERVER = server.toUpperCase();

  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return true;

  try {
    let content = fs.readFileSync(envPath, "utf-8");
    if (/^NEXT_GROUP=.*$/m.test(content)) {
      content = content.replace(/^NEXT_GROUP=.*$/m, `NEXT_GROUP="${group.toUpperCase()}"`);
    } else {
      content = `NEXT_GROUP="${group.toUpperCase()}"\n` + content;
    }

    if (/^NEXT_GROUP_SERVER=.*$/m.test(content)) {
      content = content.replace(/^NEXT_GROUP_SERVER=.*$/m, `NEXT_GROUP_SERVER="${server.toUpperCase()}"`);
    } else {
      content = `NEXT_GROUP_SERVER="${server.toUpperCase()}"\n` + content;
    }

    fs.writeFileSync(envPath, content, "utf-8");
    return true;
  } catch (err) {
    console.error("Failed to update active cluster in .env file:", err);
    return false;
  }
}

/**
 * Backward compatibility helpers
 */
export function getAllRegions(): RegionInfo[] {
  return getDiscoveredRegions();
}

export const REGIONS: Record<string, RegionInfo> = new Proxy({}, {
  get: (_, prop: string) => {
    const regions = getDiscoveredRegions();
    return regions.find((r) => r.code === prop) || {
      code: prop,
      name: KNOWN_REGION_METADATA[prop]?.name || `Region ${prop}`,
      flag: KNOWN_REGION_METADATA[prop]?.flag || "🌐",
      baseLatency: KNOWN_REGION_METADATA[prop]?.baseLatency || 50,
      serversCount: 5,
    };
  },
});
