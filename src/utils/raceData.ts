export function raceEmoji(r: string): string {
  const map: Record<string, string> = {
    Humans: "🛡️", Orcs: "🪓", Dwarfs: "⛏️", Skaven: "🐀",
    "High Elves": "🏹", "Dark Elves": "🗡️", Bretonnians: "🏇", Chaos: "🔥",
    "Wood Elves": "🌲", Lizardmen: "🦎", Norse: "⚔️", Undead: "☠️",
    Necromantic: "🪦", Nurgle: "🦠", "Chaos Dwarfs": "🔩", Khemri: "🏺",
    Halflings: "🥧", Ogres: "👊", Goblins: "👺", Vampires: "🦇",
    Amazon: "🌺", "Elven Union": "🎯", "Underworld Denizens": "🕳️", "Kislev Circus": "🎪",
  };
  return map[r] ?? "❓";
}

export function getRaceBlurb(r: string): string {
  const map: Record<string, string> = {
    Humans: "Balanced. Reliable linemen and versatile skills.",
    Orcs: "Tough and brutal — good at bashing and crowd control.",
    Dwarfs: "Resilient and slow — strong defense and mighty blocks.",
    Skaven: "Fast and sneaky, but fragile. Lots of scoring plays.",
    "High Elves": "Agile and skilled — excellent passing and movement.",
    "Dark Elves": "Agile with a dark twist — good at fouling and mobility.",
    Bretonnians: "Knightly teams — strong big guys and solid tackles.",
    Chaos: "Mutations and powerful brutes. Unpredictable but strong.",
    "Wood Elves": "Very fast and elusive — hard to pin down.",
    Lizardmen: "Durable and versatile with good big guys.",
    Norse: "Balanced warrior team, good mix of strength and agility.",
    Undead: "Slow but undead resilience, can reanimate players.",
    Necromantic: "Fragile but interesting mix of undead and flesh.",
    Nurgle: "Rotten resilience — nasty and hard to remove.",
    "Chaos Dwarfs": "Stout and brutal with heavy hitters.",
    Khemri: "Ancient mummies and skeletons, slow but tough.",
    Halflings: "Small, tricky and hilarious — high risk, high reward.",
    Ogres: "Huge strength, few players — smash through lines.",
    Goblins: "Chaotic and funny — unpredictable tricks.",
    Vampires: "Strong lone stars with blood-sucking flavour.",
    Amazon: "Athletic and balanced with female roster flavour.",
    "Elven Union": "Classic elven style — teamwork and skill.",
    "Underworld Denizens": "Strange mix of monsters and thieves.",
    "Kislev Circus": "Showy and unique, good at surprises.",
  };
  return map[r] ?? "A mysterious and unique race.";
}

export const ALL_RACES = [
  "Humans", "Orcs", "Dwarfs", "Skaven", "High Elves", "Dark Elves",
  "Bretonnians", "Chaos", "Wood Elves", "Lizardmen", "Norse", "Undead",
  "Necromantic", "Nurgle", "Chaos Dwarfs", "Khemri", "Halflings", "Ogres",
  "Goblins", "Vampires", "Amazon", "Elven Union", "Underworld Denizens", "Kislev Circus"
];

export function getUserId(): string {
  let userId = localStorage.getItem("bb2_user_id");
  if (!userId) {
    userId = `user_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
    localStorage.setItem("bb2_user_id", userId);
  }
  return userId;
}
